/** @format */

import { app, pool } from "./connection.js";
import StudentRouter from "./routes/students.js";
import HostelRouter from "./routes/hostelSuperVisor.js";
import SecurityRouter from "./routes/securitySuperVisor.js";
import MessRouter from "./routes/messSuperVisor.js";
import ComplaintsRouter from "./routes/complaints.js";
app.use("/students", StudentRouter);
app.use("/hostelSupervisor", HostelRouter);
app.use("/securitySupervosor", SecurityRouter);
app.use("/messSupervisor", MessRouter);
app.use("/complaints", ComplaintsRouter);

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
		const { rollno, sem, exen, cnic } = req.body;
		const today = new Date();
		let dateTime = today.toLocaleString();
		const result = await pool.query("INSERT INTO public.exitentry(status, datetime, cnic, rollno, semno) VALUES ($1, $2, $3, $4, $5)", [
			exen,
			dateTime,
			cnic,
			rollno,
			sem,
		]);
		console.log(result);
		res.json(result);
	} catch (error) {
		console.log(error.message);
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

app.get("/admin", async (req, res) => {
	try {
		const allUsers = await pool.query('select * from "admin"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
