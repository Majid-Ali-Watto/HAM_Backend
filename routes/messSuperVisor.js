/** @format */
import { pool } from "../connection.js";
import { Router } from "express";
const MessRouter = Router();

/////////////////////////////////////////////////
///////////////// Mess ////////////////////
////////////////////////////////////////////////

MessRouter.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from messsupervisor INNER JOIN "Images" ON messsupervisor."imgId" = "Images"."imgId"`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

MessRouter.patch("/messRegister", async (req, res) => {
	try {
		let { user, password } = req.body;
		let s = null;
		// let r = await pool.query("select password from messsupervisor WHERE cnic::bigInt = $1", [user]);
		// console.log(r.rowCount);
		// if (r.rowCount < 1) {
		s = await pool.query("UPDATE messsupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(s);
		// } else res.send({ msg: "Already, You are registered" });
	} catch (error) {
		res.send(error.message);
	}
});

MessRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(
			`select * from messsupervisor INNER JOIN "Images" ON messsupervisor."imgId" = "Images"."imgId" where cnic::BigInt=${id}`
		);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

MessRouter.patch("/updateMW", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		let { cnic, name, img, rollN } = req.body;
		let r = await pool.query(`UPDATE messsupervisor SET name = $1, cnic=$2, "imgId"=$3 WHERE cnic = $4`, [name, cnic, cnic, rollN]);
		let s = await pool.query(`UPDATE "Images" SET "imgId" = $1, image=$2 WHERE "imgId" = $3`, [cnic, img, cnic]);
		await client.query("COMMIT"); // commit transaction

		if (r.rowCount > 0 && s.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		await client.query("ROLLBACK"); // rollback transaction
		console.log(error);
		res.send("Something went wrong");
	} finally {
		client.release(); // release the client back to the pool
	}
});

MessRouter.delete("/removeMW/:id", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM messsupervisor WHERE cnic = $1", [rollN]);
		let s = await pool.query(`DELETE FROM "Images" WHERE "imgId" = $1`, [rollN]);
		await client.query("COMMIT"); // commit transaction

		if (r.rowCount > 0 && s.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		await client.query("ROLLBACK"); // rollback transaction
		console.log(error);
		res.send("Something went wrong");
	} finally {
		client.release(); // release the client back to the pool
	}
});

MessRouter.post("/saveMW", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const { name, cnic, img } = req.body;

		const s = await pool.query('INSERT INTO "Images" (image,"imgId") VALUES ($1,$2)', [img, cnic]);
		const r = await pool.query('INSERT INTO "messsupervisor" (name,cnic,"imgId") VALUES ($1,$2,$3)', [name, cnic, cnic]);
		await client.query("COMMIT"); // commit transaction

		res.json(r.rowCount > 0 && s.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		await client.query("ROLLBACK"); // rollback transaction
		console.log(error);
		error.toString().includes("duplicate key value violates unique constraint")
			? res.send("User already added with this CNIC")
			: res.send("Something went wrong");
	} finally {
		client.release(); // release the client back to the pool
	}
});

MessRouter.post("/markAttendance", async (req, res) => {
	try {
		let data = req.body;
		let rollno = data.rollno;
		let price = data.price;
		let date = data.date;
		let time = data.time;
		const result = await pool.query('INSERT INTO "attendancesheet" (rollno,price,date,time) VALUES ($1,$2,$3,$4)', [rollno, price, date, time]);
		const results = await pool.query("select messfee from months where rollno=$1", [rollno]);

		let p = results.rows[0]["messfee"] == 0 ? 0 : results.rows[0]["messfee"];
		price = price + p;
		let month = date.substr(3, 4);
		await pool.query("UPDATE months SET messfee = $1 WHERE rollno = $2", [price, rollno]);
		res.json(result);
	} catch (error) {
		res.json(error.message);
	}
});
// MessRouter.post("/markAttendance", async (req, res) => {
// 	try {
// 		const { rollno, price, date, time } = req.body;
// 		const insertQuery = {
// 			text: "INSERT INTO attendancesheet (rollno, price, date, time) VALUES ($1, $2, $3, $4)",
// 			values: [rollno, price, date, time],
// 		};
// 		const result = await pool.query(insertQuery);
// 		const selectQuery = {
// 			text: "SELECT messfee FROM months WHERE rollno = $1",
// 			values: [rollno],
// 		};
// 		const results = await pool.query(selectQuery);
// 		const p = results.rows[0].messfee || 0;
// 		const newPrice = price + p;
// 		const updateQuery = {
// 			text: "UPDATE months SET messfee = $1 WHERE rollno = $2",
// 			values: [newPrice, rollno],
// 		};
// 		await pool.query(updateQuery);
// 		res.json(result);
// 	} catch (error) {
// 		console.error(error);
// 		if (error.message.includes("duplicate key")) res.json(error.message);
// 		else res.json({ error: error.message });
// 	}
// });

MessRouter.post("/addMenu", async (req, res) => {
	try {
		const { dishName, dishPrice, date, units, time } = req.body;
		const result = await pool.query('INSERT INTO menu(name, price, units, daydate, "time") VALUES ($1,$2,$3,$4,$5)', [
			dishName,
			dishPrice,
			units,
			date,
			time,
		]);
		res.json(result);
	} catch (error) {
		res.json(error.message);
	}
});
MessRouter.post("/editMenu", async (req, res) => {
	try {
		const { dishName, dishPrice, date, units, time } = req.body;
		const result = await pool.query('Update menu SET name=$1, price=$2, units=$3, daydate=$4, "time"=$5 WHERE daydate=$4 AND "time"=$5', [
			dishName,
			dishPrice,
			units,
			date,
			time,
		]);
		res.json(result);
	} catch (error) {
		res.json(error.message);
	}
});
export default MessRouter;
