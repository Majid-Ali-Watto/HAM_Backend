/** @format */

import { app, pool } from "./connection.js";
import StudentRouter from "./routes/students.js";
import HostelRouter from "./routes/hostelSuperVisor.js";
import SecurityRouter from "./routes/securitySuperVisor.js";
import MessRouter from "./routes/messSuperVisor.js";
app.use("/students", StudentRouter);
app.use("/hostelSupervisor", HostelRouter);
app.use("/securitySupervosor", SecurityRouter);
app.use("/messSupervisor", MessRouter);

app.post("/getExitEntry", async (req, res) => {
	try {
		const { rollno, sems } = req.body;
		const allUsers = await pool.query(`SELECT * FROM exitentry where rollno = $1 and semno=$2`, [rollno, sems]);
		allUsers.rows;
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

app.get("/todayMenu/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`SELECT * FROM menu where time = $1`, [id]);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

///////////////////////////////////////////////////////////////////////////////////////////

app.post("/exitentry", async (req, res) => {
	try {
		const { rollno, datetime, sem, exen, cnic } = req.body;
		const result = await pool.query('INSERT INTO "exitentry" (rollno,semno,datetime,status,cnic) VALUES ($1,$2,$3,$4,$5)', [
			rollno,
			sem,
			datetime,
			exen,
			cnic,
		]);
		res.json(result);
	} catch (error) {
		res.json(error.message);
	}
});

app.get("/getMenu", async (req, res) => {
	try {
		const allUsers = await pool.query('select * from "menu"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
/////////////////////////////////////////////////
///////////////// Complaints ////////////////////
////////////////////////////////////////////////

app.post("/postComplaints", async (req, res) => {
	try {
		const { title, body, id, user, status } = req.body;
		const result = await pool.query('INSERT INTO "Complaints" (title,body,id,complainer,status) VALUES ($1,$2,$3,$4,$5)', [
			title,
			body,
			id,
			user,
			status,
		]);
		res.json(result);
	} catch (error) {
		res.json(error.message);
	}
});
app.patch("/updateCompStatus", async (req, res) => {
	try {
		let { status, compID } = req.body;
		let r = await pool.query('UPDATE "Complaints" SET status = $1 WHERE id = $2', [status, compID]);
		if (r.rowCount > 0) res.send("Status Updated Successfully");
		else res.send("Status not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});
app.delete("/removeComp/:id", async (req, res) => {
	try {
		let id = req.params.id;
		let r = await pool.query('DELETE FROM "Complaints" WHERE id = $1', [id]);
		if (r.rowCount > 0) res.send("Complaint deleted");
		else res.send("Complaint not deleted");
	} catch (error) {
		res.send(error.message);
	}
});
app.get("/allComplaints", async (req, res) => {
	try {
		const allUsers = await pool.query('select * from "Complaints"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

app.get("/admin", async (req, res) => {
	try {
		const allUsers = await pool.query('select * from "admin"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
