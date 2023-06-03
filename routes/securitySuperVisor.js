/** @format */
import { pool } from "../connection.js";
import { Router } from "express";
const SecurityRouter = Router();

////////////////////////////////////////////////////
/////////////// Security ///////////////////////////
////////////////////////////////////////////////////

SecurityRouter.patch("/updateSW", async (req, res) => {
	try {
		const { user, name, rollN } = req.body;
		let r = await pool.query("UPDATE securitysupervisor SET name = $1, cnic=$2 WHERE cnic = $3", [name, user, rollN]);
		if (r.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});

SecurityRouter.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from securitysupervisor`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
SecurityRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select * from securitysupervisor where cnic::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
SecurityRouter.patch("/securityRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let r = await pool.query("UPDATE securitysupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

SecurityRouter.post("/saveSW", async (req, res) => {
	try {
		const { cnic, name } = req.body;
		const result = await pool.query('INSERT INTO "securitysupervisor" (name,cnic) VALUES ($1,$2)', [name, cnic]);
		res.json(result.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		res.json(error.message);
	}
});

SecurityRouter.delete("/removeSW/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM securitysupervisor WHERE cnic = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
	}
});

export default SecurityRouter;
