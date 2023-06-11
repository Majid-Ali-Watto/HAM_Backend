/** @format */

import { pool } from "../connection.js";
import { Router } from "express";
const ComplaintsRouter = Router();


/////////////////////////////////////////////////
///////////////// Complaints ////////////////////
////////////////////////////////////////////////

ComplaintsRouter.post("/postComplaints", async (req, res) => {
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
ComplaintsRouter.patch("/updateCompStatus", async (req, res) => {
	try {
		let { status, compID } = req.body;
		let r = await pool.query('UPDATE "Complaints" SET status = $1 WHERE id = $2', [status, compID]);
		if (r.rowCount > 0) res.send("Status Updated Successfully");
		else res.send("Status not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});
ComplaintsRouter.delete("/removeComp/:id", async (req, res) => {
	try {
		let id = req.params.id;
		let r = await pool.query('DELETE FROM "Complaints" WHERE id = $1', [id]);
		if (r.rowCount > 0) res.send("Complaint deleted");
		else res.send("Complaint not deleted");
	} catch (error) {
		res.send(error.message);
	}
});
ComplaintsRouter.get("/allComplaints", async (req, res) => {
	try {
		const allUsers = await pool.query('select * from "Complaints"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

export default ComplaintsRouter;
