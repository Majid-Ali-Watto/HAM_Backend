/** @format */

import { app, pool } from "./connection.js";
import fs from 'fs';

import StudentRouter from "./routes/students.js";
import HostelRouter from "./routes/hostelSuperVisor.js";
import SecurityRouter from "./routes/securitySuperVisor.js";
import MessRouter from "./routes/messSuperVisor.js";
import ComplaintsRouter from "./routes/complaints.js";
import MenuRouter from "./routes/menu.js";
import ExitEntryRouter from "./routes/exit-entry.js";
app.use("/students", StudentRouter);
app.use("/hostelSupervisor", HostelRouter);
app.use("/securitySupervosor", SecurityRouter);
app.use("/messSupervisor", MessRouter); 
app.use("/complaints", ComplaintsRouter);
app.use("/Menu",MenuRouter)
app.use("/ExitEntry",ExitEntryRouter)


app.get("/admin", async (req, res) => {
	try {
		//const allUsers = await pool.query('select * from "admin"');
		res.json(readData());
	} catch (error) {
		res.json(error.message);
	}
});
const readData=()=>{
	try {
		let data = fs.readFileSync('./Admin/admin.txt', 'utf8');
		data=data.replaceAll(':', ' ');
		data=data.replaceAll('\n', ' ');
		data=data.split(' ');
		const user=[]
		user.push(data[1])
		user.push(data[3])
		return user;
	  } catch (err) {
		console.error(err);
	  }
}

