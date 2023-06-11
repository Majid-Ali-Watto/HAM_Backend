import { pool } from "../connection.js";
import { Router } from "express";
const MenuRouter = Router();


MenuRouter.get("/getMenu", async (req, res) => {
	try {
		const allUsers = await pool.query('select * from "menu"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

MenuRouter.get("/todayMenu/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`SELECT * FROM menu where time = $1`, [id]);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
export default MenuRouter;
