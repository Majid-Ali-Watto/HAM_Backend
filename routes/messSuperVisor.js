/** @format */
import { pool } from "../connection.js";
import { Router } from "express";
const MessRouter = Router();

/////////////////////////////////////////////////
///////////////// Mess ////////////////////
////////////////////////////////////////////////

MessRouter.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from messsupervisor`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

MessRouter.patch("/messRegister", async (req, res) => {
	try {
		let { user, password } = req.body;
		let r = await pool.query("UPDATE messsupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

MessRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select * from messsupervisor where cnic::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

MessRouter.patch("/updateMW", async (req, res) => {
	try {
		let { user, name, rollN } = req.body;
		let r = await pool.query("UPDATE messsupervisor SET name = $1, cnic=$2 WHERE cnic = $3", [name, user, rollN]);
		if (r.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});

MessRouter.delete("/removeMW/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM messsupervisor WHERE cnic = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
	}
});

MessRouter.post("/saveMW", async (req, res) => {
	try {
		let data = req.body;
		let cnic = data.cnic;
		let name = data.name;
		const result = await pool.query('INSERT INTO "messsupervisor" (name,cnic) VALUES ($1,$2)', [name, cnic]);
		res.json(result.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		res.json(error.message);
	}
});

// MessRouter.post("/markAttendance", async (req, res) => {
//   try {
//     let data = req.body;
//     let rollno = data.rollno;
//     let price = data.price;
//     let date = data.date;
//     let time = data.time;
//     const result = await pool.query(
//       'INSERT INTO "attendancesheet" (rollno,price,date,time) VALUES ($1,$2,$3,$4)',
//       [rollno, price, date, time]
//     );
//     const results = await pool.query(
//       "select messfee from months where rollno=$1",
//       [rollno]
//     );

//     let p = results.rows[0]["messfee"] == 0 ? 0 : results.rows[0]["messfee"];
//     price = price + p;
//     let month = date.substr(3, 4);
//     await pool.query("UPDATE months SET messfee = $1 WHERE rollno = $2", [
//       price,
//       rollno,
//     ]);
//     res.json(result);
//   } catch (error) {
//     res.json(error.message);
//   }
// });
MessRouter.post("/markAttendance", async (req, res) => {
	try {
		const { rollno, price, date, time } = req.body;
		const insertQuery = {
			text: "INSERT INTO attendancesheet (rollno, price, date, time) VALUES ($1, $2, $3, $4)",
			values: [rollno, price, date, time],
		};
		const result = await pool.query(insertQuery);
		const selectQuery = {
			text: "SELECT messfee FROM months WHERE rollno = $1",
			values: [rollno],
		};
		const results = await pool.query(selectQuery);
		const p = results.rows[0].messfee || 0;
		const newPrice = price + p;
		const updateQuery = {
			text: "UPDATE months SET messfee = $1 WHERE rollno = $2",
			values: [newPrice, rollno],
		};
		await pool.query(updateQuery);
		res.json(result);
	} catch (error) {
		console.error(error);
		if (error.message.includes("duplicate key")) res.json(error.message);
		else res.status(500).json({ error: error.message });
	}
});

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

export default MessRouter;
