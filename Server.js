/** @format */

import { app, pool } from "./connection.js";
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
		const allUsers = await pool.query('select * from "admin"');
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
