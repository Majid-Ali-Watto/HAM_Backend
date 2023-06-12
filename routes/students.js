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
		console.log("students from cache", students);
		if (students != undefined) {
			res.json(students);
			console.log("fetching from cache", students);
			return;
		}
		const query = `select * from students INNER JOIN "Images" ON students.rollno = "Images"."imgId" Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno`;
		const allUsers = await pool.query(query);
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
		const query = `select * from students INNER JOIN "Images" ON students.rollno = "Images"."imgId" Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno inner join months on students.rollno=months.rollno`;
		const allUsers = await pool.query(query);
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
			`select * from students INNER JOIN "Images" ON students.rollno = "Images"."imgId" Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno where semester.status=${true}`
		);
		hamCache.set("hostelStudents", allUsers.rows, 1000);

		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.post("/getMonthFee", async (req, res) => {
	try {
		const { month, year, rollno } = req.body;
		console.log(req.body);

		let allUsers = await pool.query(`select * from months where rollno::BigInt=$1 and monthname=$2 and year=$3`, [rollno, month, year]);
		console.log(allUsers.rows);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		console.log(id);
		let allUsers = await pool.query(
			`select * from students INNER JOIN "Images" ON students.rollno = "Images"."imgId" Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno inner join months on students.rollno=months.rollno where students.rollno::BigInt=${id}`
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
		const allUsers = await pool.query(`select rollno,password,cnic from students where students.rollno::BigInt=${id}`);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});

StudentRouter.post("/saveStud", async (req, res) => {
	console.log(req.body);
	const client = await pool.connect();
	try {
		await client.query("BEGIN"); // begin transaction
		const { name, rollno, dept, age, gender, cnic, semester, hostfee, program, img, qr } = req.body;
		function QR(qr, _rollno) {
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
						res.send("Internal Server Error");
						return;
					}
					await client.query("COMMIT"); // commit transaction
					res.send(`${url}`);
					hamCache.del(["students", "messStudents", "hostelStudents"]);
				}
			);
		}
		await client.query('INSERT INTO "students" ("sname","rollno","cnic","age","gender","program","imgId") VALUES ($1,$2,$3,$4,$5,$6,$7)', [
			name,
			rollno,
			cnic,
			age,
			gender,
			program,
			rollno,
		]);
		await client.query('INSERT INTO "Images" ("image","imgId") VALUES ($1,$2)', [img, rollno]);
		await client.query('INSERT INTO "department" ("dname","rollno") VALUES ($1,$2)', [dept, rollno]);
		await client.query('INSERT INTO "semester" ("semno","rollno","hostelfee","status") VALUES ($1,$2,$3,$4)', [semester, rollno, hostfee, false]);
		QR(qr, rollno);
	} catch (error) {
		await client.query("ROLLBACK"); // rollback transaction
		console.log(error);
		error.toString().includes("duplicate key value violates unique constraint")
			? res.send("User already added with this RegNo")
			: res.send("Something went wrong");
	} finally {
		client.release(); // release the client back to the pool
	}
});

StudentRouter.post("/saveMessStud", async (req, res) => {
	try {
		const { rollno } = req.body;
		await pool.query('INSERT INTO "months" ("rollno","messfee","mStatus",monthname,year) VALUES ($1,$2,$3,$4,$5)', [
			rollno,
			0,
			false,
			new Date().getMonth() + 1,
			new Date().getFullYear(),
		]);
		res.send("Record has been added");
		hamCache.del(["students", "messStudents", "hostelStudents"]);
	} catch (error) {
		error.message.includes("duplicate key") ? res.send("Already, Record has been added") : res.send(error.message);
	}
});

StudentRouter.patch("/saveHostStud", async (req, res) => {
	try {
		const { rollno, status } = req.body;
		let r = await pool.query("UPDATE semester SET status = $1 WHERE rollno = $2", [status, rollno]);
		res.send(r);
		hamCache.del(["students", "messStudents", "hostelStudents"]);
	} catch (error) {
		error.message.includes("duplicate key") ? res.send("Already, Record has been added") : res.send(error.message);
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

StudentRouter.patch("/updateStud", async (req, res) => {
	const { name, rollno, dept, age, gender, cnic, hostfee, semester, rollN, img } = req.body;
	let client = await pool.connect();
	try {
		await client.query("BEGIN");
		let r = await client.query(`UPDATE students SET sname = $1, cnic = $2, gender= $3, age = $4, rollno = $5, "imgId"=$6 WHERE rollno = $7`, [
			name,
			cnic,
			gender,
			age,
			rollno,
			cnic,
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
		let v = await pool.query(`UPDATE "Images" SET "imgId" = $1, image=$2 WHERE "imgId" = $3`, [cnic, img, cnic]);

		let u = await client.query("UPDATE months SET rollno=$1 WHERE rollno = $2", [rollno, rollN]);
		await client.query("COMMIT");
		if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && v.rowCount > 0) {
			console.log("Record has been updated");
			res.send("Record has been updated");
			hamCache.del(["students", "messStudents", "hostelStudents"]);
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
});
StudentRouter.delete("/removeStud/:id", async (req, res) => {
	let client = await pool.connect();
	try {
		await client.query("BEGIN");

		let rollN = req.params.id;
		let r = await pool.query("DELETE FROM students WHERE rollno = $1", [rollN]);
		let s = await client.query("DELETE FROM department WHERE rollno = $1", [rollN]);
		let t = await client.query("DELETE FROM semester WHERE rollno = $1", [rollN]);
		let u = await client.query("DELETE FROM months WHERE rollno = $1", [rollN]);
		let v = await client.query(`DELETE FROM "Images" WHERE imgId = $1`, [rollN]);
		await client.query("COMMIT");
		if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && v.rowCount > 0) res.send("Record has been removed");
		hamCache.del(["students", "messStudents", "hostelStudents"]);
	} catch (error) {
		await client.query("ROLLBACK");
		res.send(error.message);
	} finally {
		client.release();
	}
});
// Export the StudentRouter
export default StudentRouter;
