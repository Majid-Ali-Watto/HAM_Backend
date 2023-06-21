/** @format */
import { pool } from "../connection.js";
import { Router } from "express";
const SecurityRouter = Router();

////////////////////////////////////////////////////
/////////////// Security ///////////////////////////
////////////////////////////////////////////////////

SecurityRouter.patch("/updateSW", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const { cnic, name, img, rollN } = req.body;
		console.log(req.body);
		let r = await pool.query(`UPDATE securitysupervisor SET name = $1, cnic=$2, "imgId"=$3 WHERE cnic = $4`, [name, cnic, cnic, rollN]);
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

SecurityRouter.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from securitysupervisor INNER JOIN "Images" ON securitysupervisor."imgId" = "Images"."imgId"`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
SecurityRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(
			`select * from securitysupervisor INNER JOIN "Images" ON securitysupervisor."imgId" = "Images"."imgId" where cnic::BigInt=${id}`
		);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
SecurityRouter.patch("/securityRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let s = null;
		let r = await pool.query("select password from securitysupervisor WHERE cnic = $1", [user]);
		
		if (r.rows[0].password==null) {
			s = await pool.query("UPDATE securitysupervisor SET password = $1 WHERE cnic = $2", [password, user]);
			res.send(s);
		} else res.send({ msg: "Already, You are registered" });
	} catch (error) {
		res.send(error.message);
	}
});

SecurityRouter.post("/saveSW", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const { cnic, name, img } = req.body;
		const s = await pool.query('INSERT INTO "Images" ("imgId",image) VALUES ($1,$2)', [cnic, img]);
		const r = await pool.query('INSERT INTO "securitysupervisor" (name,cnic,"imgId") VALUES ($1,$2,$3)', [name, cnic, cnic]);
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

SecurityRouter.delete("/removeSW/:id", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM securitysupervisor WHERE cnic = $1", [rollN]);
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

export default SecurityRouter;
