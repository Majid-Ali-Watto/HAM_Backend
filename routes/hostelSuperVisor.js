/** @format */
import { pool } from "../connection.js";
import { Router } from "express";
const HostelRouter = Router();

//////////////////////////////////////////////////
///////////////// Hostel /////////////////////////
//////////////////////////////////////////////////

HostelRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(
			`select * from hostelsupervisor INNER JOIN "Images" ON hostelsupervisor."imgId" = "Images"."imgId" where cnic::BigInt=${id}`
		);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
HostelRouter.delete("/removeHW/:id", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM hostelsupervisor WHERE cnic = $1", [rollN]);
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
HostelRouter.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from hostelsupervisor INNER JOIN "Images" ON hostelsupervisor."imgId" = "Images"."imgId"`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

HostelRouter.post("/getHostelFee", async (req, res) => {
	try {
		const { rollno } = req.body;
		// let allUsers = await pool.query(`SELECT distinct semester.rollno,semno,hostelfee,messfee,status,"mStatus" FROM semester Inner Join months On semester.rollno=months.rollno  where semester.rollno = $1`, [
		// 	rollno,
		// ]);
		// if (allUsers.rowCount < 1)
		let allUsers = await pool.query(`SELECT * FROM semester where rollno = $1`, [rollno]);
		res.json(allUsers.rows);
		console.log(allUsers.rows);
	} catch (error) {
		console.log(error.message);
		res.json(error.message);
	}
});
HostelRouter.patch("/hostelRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let s = null;
		let r = await pool.query("select password from hostelsupervisor WHERE cnic = $1", [user]);
		
		if (r.rows[0].password==null) {
			s = await pool.query("UPDATE hostelsupervisor SET password = $1 WHERE cnic = $2", [password, user]);
			res.send(s);
		} else res.send({ msg: "Already, You are registered" });
	} catch (error) {
		res.send(error.message);
	}
});

HostelRouter.patch("/updateHW", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const { cnic, name, img, rollN } = req.body;
		let r = await pool.query(`UPDATE hostelsupervisor SET name = $1, cnic=$2, "imgId"=$3 WHERE cnic::BigInt = $4`, [name, cnic, cnic, rollN]);
		let s = await pool.query(`UPDATE "Images" SET image = $1, "imgId"=$2 WHERE "imgId"::BigInt = $3`, [img, cnic, cnic]);
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

HostelRouter.post("/saveHW", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const { cnic, name, img } = req.body;
		const s = await pool.query('INSERT INTO "Images" ("imgId",image) VALUES ($1,$2)', [cnic, img]);
		const r = await pool.query('INSERT INTO "hostelsupervisor" (name,cnic,"imgId") VALUES ($1,$2,$3)', [name, cnic, cnic]);

		res.json(r.rowCount > 0 && s.rowCount > 0 ? "User added successfully" : "User not added successfully");
		await client.query("COMMIT"); // commit transaction
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
export default HostelRouter;
