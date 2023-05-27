/** @format */

import { app, pool } from "./connection.js";
import StudentRouter from "./routes/students.js";
app.use("/students", StudentRouter);
// app.use("/messStudents", StudentRouter);
// app.use("/hostelStudents", StudentRouter);
app.use("/students/:id", StudentRouter);
app.use("/studLogin/:id", StudentRouter);
app.use("/save", StudentRouter);
app.use("/saveMessStud", StudentRouter);
app.use("/saveHostStud", StudentRouter);
app.use("/update", StudentRouter);
app.use("/studRegister", StudentRouter);
app.use("/remove/:id", StudentRouter);

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

//////////////////////////////////////////////////
///////////////// Hostel /////////////////////////
//////////////////////////////////////////////////

app.get("/hostel/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select * from hostelsupervisor where cnic::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
app.delete("/removeHW/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM hostelsupervisor WHERE cnic = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
	}
});
app.get("/hostel", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from hostelsupervisor`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

app.post("/getHostelFee", async (req, res) => {
	try {
		const { rollno } = req.body;
		const allUsers = await pool.query(`SELECT * FROM semester where rollno = $1`, [rollno]);
		allUsers.rows;
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
app.patch("/hostelRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let r = await pool.query("UPDATE hostelsupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

app.patch("/updateHW", async (req, res) => {
	try {
		const { cnic, name, rollN } = req.body;
		let r = await pool.query("UPDATE hostelsupervisor SET name = $1, cnic=$2 WHERE cnic::BigInt = $3", [name, cnic, rollN]);
		if (r.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});

app.post("/saveHW", async (req, res) => {
	try {
		const { cnic, name } = req.body;
		const result = await pool.query('INSERT INTO "hostelsupervisor" (name,cnic) VALUES ($1,$2)', [name, cnic]);
		res.json(result.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		res.json(error.message);
	}
});

////////////////////////////////////////////////////
/////////////// Security ///////////////////////////
////////////////////////////////////////////////////

app.patch("/updateSW", async (req, res) => {
	try {
		const { user, name, rollN } = req.body;
		let r = await pool.query("UPDATE securitysupervisor SET name = $1, cnic=$2 WHERE cnic = $3", [name, user, rollN]);
		if (r.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});

app.get("/security", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from securitysupervisor`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
app.get("/security/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select * from securitysupervisor where cnic::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
app.patch("/securityRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let r = await pool.query("UPDATE securitysupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

app.post("/saveSW", async (req, res) => {
	try {
		const { cnic, name } = req.body;
		const result = await pool.query('INSERT INTO "securitysupervisor" (name,cnic) VALUES ($1,$2)', [name, cnic]);
		res.json(result.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		res.json(error.message);
	}
});

app.delete("/removeSW/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM securitysupervisor WHERE cnic = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
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

/////////////////////////////////////////////////
///////////////// Mess ////////////////////
////////////////////////////////////////////////

app.get("/mess", async (req, res) => {
	try {
		const allUsers = await pool.query(`select * from messsupervisor`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

app.patch("/messRegister", async (req, res) => {
	try {
		let { user, password } = req.body;
		let r = await pool.query("UPDATE messsupervisor SET password = $1 WHERE cnic = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

app.get("/mess/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select * from messsupervisor where cnic::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

app.patch("/updateMW", async (req, res) => {
	try {
		let { user, name, rollN } = req.body;
		let r = await pool.query("UPDATE messsupervisor SET name = $1, cnic=$2 WHERE cnic = $3", [name, user, rollN]);
		if (r.rowCount > 0) res.send("User Updated Successfully");
		else res.send("User not updated Successfully");
	} catch (error) {
		res.send(error.message);
	}
});

app.delete("/removeMW/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM messsupervisor WHERE cnic = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
	}
});

app.post("/saveMW", async (req, res) => {
	try {
		let data = req.body;
		let cnic = data.cnic;
		let name = data.name;
		const result = await pool.query('INSERT INTO "messsupervisor" (name,cnic) VALUES ($1,$2)', [name, cnic]);
		res.json(result.rowCount > 0 ? "User added successfully" : "User not added successfully");
	} catch (error) {
		res.json(error.message);
	}
});

// app.post("/markAttendance", async (req, res) => {
//   try {
//     let data = req.body;
//     let rollno = data.rollno;
//     let price = data.price;
//     let date = data.date;
//     let time = data.time;
//     const result = await pool.query(
//       'INSERT INTO "attendancesheet" (rollno,price,date,time) VALUES ($1,$2,$3,$4)',
//       [rollno, price, date, time]
//     );
//     const results = await pool.query(
//       "select messfee from months where rollno=$1",
//       [rollno]
//     );

//     let p = results.rows[0]["messfee"] == 0 ? 0 : results.rows[0]["messfee"];
//     price = price + p;
//     let month = date.substr(3, 4);
//     await pool.query("UPDATE months SET messfee = $1 WHERE rollno = $2", [
//       price,
//       rollno,
//     ]);
//     res.json(result);
//   } catch (error) {
//     res.json(error.message);
//   }
// });
app.post("/markAttendance", async (req, res) => {
	try {
		const { rollno, price, date, time } = req.body;
		const insertQuery = {
			text: "INSERT INTO attendancesheet (rollno, price, date, time) VALUES ($1, $2, $3, $4)",
			values: [rollno, price, date, time],
		};
		const result = await pool.query(insertQuery);
		const selectQuery = {
			text: "SELECT messfee FROM months WHERE rollno = $1",
			values: [rollno],
		};
		const results = await pool.query(selectQuery);
		const p = results.rows[0].messfee || 0;
		const newPrice = price + p;
		const updateQuery = {
			text: "UPDATE months SET messfee = $1 WHERE rollno = $2",
			values: [newPrice, rollno],
		};
		await pool.query(updateQuery);
		res.json(result);
	} catch (error) {
		console.error(error);
		if (error.message.includes("duplicate key")) res.json(error.message);
		else res.status(500).json({ error: error.message });
	}
});

app.post("/addMenu", async (req, res) => {
	try {
		const { dishName, dishPrice, date, units, time } = req.body;
		const result = await pool.query('INSERT INTO menu(name, price, units, daydate, "time") VALUES ($1,$2,$3,$4,$5)', [
			dishName,
			dishPrice,
			units,
			date,
			time,
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
