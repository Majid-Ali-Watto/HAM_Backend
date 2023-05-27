/** @format */
import { pool } from "../connection.js";
import { Router } from "express";
const StudentRouter = Router();
import NodeCache from "node-cache";
const hamCache = new NodeCache();
import QRCode from "qrcode";
// Define student routes
StudentRouter.get("/", async (req, res) => {
	try {
		const students = hamCache.get("students");
		if (students != undefined) {
			res.json(students);
			console.log("fetching from cache");
			return;
		}
		const allUsers = await pool.query(
			"select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno"
		);
		hamCache.set("students", allUsers.rows, 1000);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.get("/messStudents", async (req, res) => {
	try {
		const students = hamCache.get("messStudents");
		if (students != undefined) {
			res.json(students);
			console.log("fetching from cache");
			return;
		}
		const allUsers = await pool.query(
			"select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno inner join months on students.rollno=months.rollno"
		);
		hamCache.set("messStudents", allUsers.rows, 1000);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.get("/hostelStudents", async (req, res) => {
	try {
		const students = hamCache.get("hostelStudents");
		if (students != undefined) {
			res.json(students);
			console.log("fetching from cache");
			return;
		}
		const allUsers = await pool.query(
			`select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno where semester.status=${true}`
		);
		hamCache.set("hostelStudents", allUsers.rows, 1000);

		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

StudentRouter.get("/students/:id", async (req, res) => {
	try {
		let id = req.params.id;
		console.log(id);
		let allUsers = await pool.query(
			`select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno inner join months on students.rollno=months.rollno where students.rollno::BigInt=${id}`
		);
		if (allUsers.rowCount === 0)
			allUsers = await pool.query(
				`select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno where students.rollno::BigInt=${id}`
			);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.get("/studLogin/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select rollno,password from students where students.rollno::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

StudentRouter.post("/save", async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN"); // begin transaction
		const { name, rollno, dept, age, gender, cnic, semester, hostfee, program, img, qr } = req.body;
		function QR(qr, rollno) {
			QRCode.toDataURL(
				qr,
				{
					type: "png",
					errorCorrectionLevel: "H",
					margin: 1,
					color: {
						dark: "#000000",
						light: "#ffffff",
					},
					width: 400, // width in pixels
					height: 400, // height in pixels
				},
				async (err, url) => {
					if (err) {
						console.error(err);
						res.status(500).send("Internal Server Error");
						return;
					}
					await client.query("COMMIT"); // commit transaction
					res.send(`${url}`);
				}
			);
		}
		await client.query('INSERT INTO "students" ("sname","rollno","cnic","age","gender","program","image") VALUES ($1,$2,$3,$4,$5,$6,$7)', [
			name,
			rollno,
			cnic,
			age,
			gender,
			program,
			img,
		]);

		await client.query('INSERT INTO "department" ("dname","rollno") VALUES ($1,$2)', [dept, rollno]);
		await client.query('INSERT INTO "semester" ("semno","rollno","hostelfee","status") VALUES ($1,$2,$3,$4)', [semester, rollno, hostfee, false]);
		QR(qr, rollno);
	} catch (error) {
		await client.query("ROLLBACK"); // rollback transaction
		console.log(error);
		res.status(500).send("Something went wrong");
	} finally {
		client.release(); // release the client back to the pool
	}
});

StudentRouter.post("/saveMessStud", async (req, res) => {
	try {
		const { rollno } = req.body;
		await pool.query('INSERT INTO "months" ("rollno","messfee","mStatus",monthname) VALUES ($1,$2,$3,$4)', [
			rollno,
			0,
			false,
			new Date().getMonth() + 1,
		]);
		res.send("Record has been added");
	} catch (error) {
		error.message.includes("duplicate key") ? res.send("Already, Record has been added") : res.send(error.message);
	}
});

StudentRouter.patch("/saveHostStud", async (req, res) => {
	try {
		const { rollno, status } = req.body;
		let r = await pool.query("UPDATE semester SET status = $1 WHERE rollno = $2", [status, rollno]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});
StudentRouter.patch("/studRegister", async (req, res) => {
	try {
		const { user, password } = req.body;
		let r = await pool.query("UPDATE students SET password = $1 WHERE rollno = $2", [password, user]);
		res.send(r);
	} catch (error) {
		res.send(error.message);
	}
});

StudentRouter.patch("/update", async (req, res) => {
	// try {
	const { name, rollno, dept, age, gender, cnic, hostfee, semester, rollN } = req.body;
	let client = await pool.connect();
	try {
		await client.query("BEGIN");
		let r = await client.query("UPDATE students SET sname = $1, cnic = $2, gender= $3, age = $4, rollno = $5 WHERE rollno = $6", [
			name,
			cnic,
			gender,
			age,
			rollno,
			rollN,
		]);
		let s = await client.query("UPDATE department SET dname=$1 WHERE rollno = $2", [dept, rollno]);
		let t = await client.query("UPDATE semester SET semno=$1, rollno=$2, hostelfee=$3, status=$4 WHERE rollno = $5", [
			semester,
			rollno,
			hostfee,
			false,
			rollN,
		]);
		let u = await client.query("UPDATE months SET rollno=$1 WHERE rollno = $2", [rollno, rollN]);
		await client.query("COMMIT");
		if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && u.rowCount > 0) {
			console.log("Record has been updated");
			res.send("Record has been updated");
		} else {
			console.log("Record has not been updated");

			res.send("Record has not been updated");
		}
	} catch (error) {
		await client.query("ROLLBACK");
		res.send(error.message);
	} finally {
		client.release();
	}
	// let r = await pool.query(
	//   "UPDATE students SET sname = $1, cnic = $2, gender= $3, age = $4,rollno = $5 WHERE rollno = $6",
	//   [name, cnic, gender, age, rollno, rollN]
	// );
	// let s = await pool.query(
	//   "UPDATE department SET dname=$1,rollno=$2  WHERE rollno = $3",
	//   [dept, rollno, rollN]
	// );
	// let t = await pool.query(
	//   "Update semester SET semno=$1,rollno=$2,hostelfee=$3,status=$4 WHERE rollno = $5",
	//   [semester, rollno, hostfee, false, rollN]
	// );
	// let u = await pool.query("Update months SET rollno=$1  WHERE rollno = $2", [
	//   rollno,
	//   rollN,
	// ]);
	// if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && u.rowCount > 0)
	//   res.send("Record has been updated");
	// else res.send("Record has not been updated");
	// } catch (error) {
	//   res.send(error.message);
	// }
});
StudentRouter.delete("/remove/:id", async (req, res) => {
	try {
		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM students WHERE rollno = $1", [rollN]);
		if (r.rowCount > 0) res.send("Record has been removed");
	} catch (error) {
		res.send(error.message);
	}
});
// Export the StudentRouter
export default StudentRouter;
