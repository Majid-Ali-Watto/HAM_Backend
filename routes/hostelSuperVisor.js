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
		const allUsers = await pool.query(`select * from hostelsupervisor where cnic::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
HostelRouter.delete("/removeHW/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM hostelsupervisor WHERE cnic = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
	}
});
HostelRouter.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from hostelsupervisor`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

HostelRouter.post("/getHostelFee", async (req, res) => {
	try {
		const { rollno } = req.body;
		const allUsers = await pool.query(`SELECT * FROM semester where rollno = $1`, [rollno]);
		allUsers.rows;
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
HostelRouter.patch("/hostelRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let r = await pool.query("UPDATE hostelsupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

HostelRouter.patch("/updateHW", async (req, res) => {
	try {
		const { cnic, name, rollN } = req.body;
		let r = await pool.query("UPDATE hostelsupervisor SET name = $1, cnic=$2 WHERE cnic::BigInt = $3", [name, cnic, rollN]);
		if (r.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});

HostelRouter.post("/saveHW", async (req, res) => {
	try {
		const { cnic, name } = req.body;
		const result = await pool.query('INSERT INTO "hostelsupervisor" (name,cnic) VALUES ($1,$2)', [name, cnic]);
		res.json(result.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		res.json(error.message);
	}
});
export default HostelRouter;
