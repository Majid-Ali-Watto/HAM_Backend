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
		const query = `SELECT DISTINCT students.rollno, sname, dname, cnic, program, semno, image, status, hostelfee, students.age, gender FROM students INNER JOIN department ON students.rollno = department.rollno INNER JOIN semester ON students.rollno = semester.rollno INNER JOIN "Images" ON students.cnic = "Images"."imgId"::bigint`;
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
		const query = `select distinct students.rollno,sname,dname,cnic,program,semno,image from students INNER JOIN "Images" ON students.cnic = "Images"."imgId"::bigInt Inner join department on students.rollno::bigInt=department.rollno::bigInt inner join semester on students.rollno::bigInt=semester.rollno::bigInt Inner JOIN months ON students.rollno::bigInt = months.rollno::bigInt`;
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
			`select distinct students.rollno,sname,dname,cnic,program,semno,image from students INNER JOIN "Images" ON students.cnic = "Images"."imgId"::bigint Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno where semester.status=${true}`
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
StudentRouter.post("/getMessFee", async (req, res) => {
	try {
		const {rollno } = req.body;
		console.log(req.body);

		let allUsers = await pool.query(`select * from months where rollno::BigInt=$1`, [rollno]);
		console.log(allUsers.rows);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.post("/getSemesterFee", async (req, res) => {
	try {
		const { sem, rollno } = req.body;
		console.log(req.body);
// select distinct students.rollno,sname,dname,cnic,program,semno,image,hostelfee,status from students INNER JOIN "Images" ON students.rollno = "Images"."imgId" Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno where semester.rollno=$1 and semester.semno=$2
		let allUsers = await pool.query(
			`select hostelfee,status from students inner join semester on students.rollno=semester.rollno where semester.rollno=$1 and semester.semno=$2`,
			[rollno, sem]
		);
		console.log(allUsers.rows);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.post("/getSemester", async (req, res) => {
	try {
		const { rollno } = req.body;
		console.log(rollno);

		let allUsers = await pool.query(`select max(semno) from semester where rollno=$1`, [rollno]);
		console.log(allUsers.rows[0].max);
		res.json(allUsers.rows[0].max);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.get("/:id", async (req, res) => {
	try {
		let id = req.params.id;
		console.log(id);
		let allUsers = await pool.query(
			`SELECT DISTINCT students.rollno, sname, dname, cnic, program, semno, image, status, hostelfee, students.age, gender FROM students INNER JOIN department ON students.rollno = department.rollno INNER JOIN semester ON students.rollno = semester.rollno INNER JOIN "Images" ON students.cnic = "Images"."imgId"::bigint inner join months on students.rollno=months.rollno where students.rollno::BigInt=${id}`
		);
		if (allUsers.rowCount === 0)
			allUsers = await pool.query(
				`SELECT DISTINCT students.rollno, sname, dname, cnic, program, semno, image, status, hostelfee, students.age, gender FROM students INNER JOIN department ON students.rollno = department.rollno INNER JOIN semester ON students.rollno = semester.rollno INNER JOIN "Images" ON students.cnic = "Images"."imgId"::bigint WHERE students.rollno::bigint=${id}`
			);
		res.json(allUsers.rows);
	} catch (error) {
		res.json(error.message);
	}
});
StudentRouter.get("/studLogin/:id", async (req, res) => {
	try {
		let id = req.params.id;
		const allUsers = await pool.query(`select rollno,password,cnic from students where students.rollno::BigInt=$1`, [id]);
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
						dark: "#434fff",
						light: "#ffff",
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
		await client.query('INSERT INTO "Images" ("image","imgId") VALUES ($1,$2)', [img, cnic]);
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
		let r = null;
		const s = await pool.query(`select password from students where students.rollno::BigInt=$1`, [user]);
		
		if (s.rows[0].password==null) {
			r = await pool.query("UPDATE students SET password = $1 WHERE rollno = $2", [password, user]);
			res.send(r);
		} else res.send({ msg: "Already, You are registered" });
	} catch (error) {
		res.send(error.message);
	}
});

StudentRouter.patch("/updateStud", async (req, res) => {
	console.log(req.body);
	const { name, rollno, dept, age, gender, cnic, hostfee, semester, rollN, img, prevCNIC, prevRegNo } = req.body;
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
			prevRegNo,
		]);
		let s = await client.query("UPDATE department SET dname=$1,rollno=$2 WHERE rollno = $3", [dept, rollno, prevRegNo]);
		let t = await client.query("UPDATE semester SET semno=$1, rollno=$2, hostelfee=$3, status=$4 WHERE rollno = $5", [
			semester,
			rollno,
			hostfee,
			false,
			prevRegNo,
		]);
		let v = 0;
		if (img == undefined || img == "") {
			v = 1;
		} else v = await pool.query(`UPDATE "Images" SET "imgId" = $1, image=$2 WHERE "imgId" = $3`, [cnic, img, prevCNIC]);

		await client.query("COMMIT");
		let u = await client.query("UPDATE months SET rollno=$1 WHERE rollno = $2", [rollno, prevRegNo]);
		console.log(r.rowCount, s.rowCount, t.rowCount, v.rowCount, u.rowCount);
		if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && (v.rowCount > 0 || v == 1)) {
			hamCache.del(["students", "messStudents", "hostelStudents"]);
			console.log("Record has been updated");
			res.send("Record has been updated");
		} else {
			console.log("Record has not been updated");

			res.send("Record has not been updated");
			await client.query("ROLLBACK");
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
		let data = req.params.id;
		const rollNCNIC = data.split(",");
		let r = await pool.query("DELETE FROM students WHERE rollno = $1", [rollNCNIC[0]]);
		let s = await client.query("DELETE FROM department WHERE rollno = $1", [rollNCNIC[0]]);
		let t = await client.query("DELETE FROM semester WHERE rollno = $1", [rollNCNIC[0]]);
		let v = await client.query(`DELETE FROM "Images" WHERE "imgId" = $1`, [rollNCNIC[1]]);
		await client.query("COMMIT");
		let u = await client.query("DELETE FROM months WHERE rollno = $1", [rollNCNIC[0]]);
		await client.query(`DELETE FROM "Complaints" WHERE complainer = $1`, [rollNCNIC[1]]);
		await client.query("DELETE FROM exitentry WHERE rollno = $1", [rollNCNIC[0]]);
		if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && v.rowCount > 0) {
			res.send("Record has been removed");
			hamCache.del(["students", "messStudents", "hostelStudents"]);
		} else await client.query("ROLLBACK");
	} catch (error) {
		await client.query("ROLLBACK");
		res.send(error.message);
	} finally {
		client.release();
	}
});
// Export the StudentRouter
export default StudentRouter;
