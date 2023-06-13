import { pool } from "../connection.js";
import { Router } from "express";
const ExitEntryRouter = Router();

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Exit Entry //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

ExitEntryRouter.post("/getExitEntry", async (req, res) => {
	try {
		const { rollno, sems } = req.body;
		const allUsers = await pool.query(`SELECT * FROM exitentry where rollno = $1 and semno=$2`, [rollno, sems]);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

ExitEntryRouter.post("/exitentry", async (req, res) => {
	try {
		const { rollno, sem, exen, cnic } = req.body;
		const today = new Date();
		let dateTime = today.toLocaleString();
		const query="INSERT INTO public.exitentry(status, datetime, cnic, rollno, semno) VALUES ($1, $2, $3, $4, $5)";
		const result = await pool.query(query, [exen, dateTime, cnic, rollno, sem]);
		console.log(result);
		res.json(result);
	} catch (error) {
		console.log(error.message);
		res.json(error.message);
	}
});

export default ExitEntryRouter;
