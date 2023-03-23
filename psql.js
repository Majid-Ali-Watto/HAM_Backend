import { app, pool } from "./connection.js";
// const QRCode = require("qrcode");

import QRCode from "qrcode";
/////////////////////////////////////////////////
//////////// student apis //////////////////////////
////////////////////////////////////////////////
// function createQR(coded, regno) {
//   QRCode.toFile(regno + "qr.png", coded, (err) => {
//     if (err) throw err;
//   });
// }
app.get("/students", async (req, res) => {
  try {
    const allUsers = await pool.query(
      "select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno inner join months on students.rollno=months.rollno"
    );
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});
app.get("/students/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const allUsers = await pool.query(
      `select * from students Inner join department on students.rollno=department.rollno inner join semester on students.rollno=semester.rollno inner join months on students.rollno=months.rollno where students.rollno::BigInt=${id}`
    );
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});

app.post("/save", async (req, res) => {
  try {
    let data = req.body;
    let name = data.name;
    let rollno = data.rollno;
    let dept = data.dept;
    let age = data.age;
    let gender = data.gender;
    let cnic = data.cnic;
    let semester = data.semester;
    let hostfee = data.hostfee;
    let prog = data.program;
    let img = data.img;
    let qr = data.qr;
    console.log(qr);
    function QR(qr, rollno) {
      QRCode.toFile(
        "C:/Users/Majid Ali//Documents/QR Codes/" + rollno + ".png",
        qr,
        (err) => {
          if (err) throw err;
          else console.log("QR saved");
        }
      );
    }
    QR(qr, rollno);
    await pool.query(
      'INSERT INTO "students" ("sname","rollno","cnic","age","gender","program","image") VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [name, rollno, cnic, age, gender, prog, img]
    );
    await pool.query(
      'INSERT INTO "department" ("dname","rollno") VALUES ($1,$2)',
      [dept, rollno]
    );
    await pool.query(
      'INSERT INTO "semester" ("semno","rollno","hostelfee","status") VALUES ($1,$2,$3,$4)',
      [semester, rollno, hostfee, false]
    );
    await pool.query('INSERT INTO "months" ("rollno") VALUES ($1)', [rollno]);
    res.send("Record has been added");
  } catch (error) {
    res.send(error.message);
  }
});
app.patch("/studRegister", async (req, res) => {
  try {
    let data = req.body;
    let rollno = data.user;
    let password = data.password;
    let r = await pool.query(
      "UPDATE students SET password = $1 WHERE rollno = $2",
      [password, rollno]
    );
    if (r.rowCount > 0) res.send("User Registered Successfully");
    else res.send("User not Registered Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.patch("/update", async (req, res) => {
  try {
    let data = req.body;
    let name = data.name;
    let rollno = data.rollno;
    let dept = data.dept;
    let age = data.age;
    let gender = data.gender;
    let cnic = data.cnic;
    let hostelfee = data.hostfee;
    let semester = data.semester;
    let rollN = data.rollN;
    let r = await pool.query(
      "UPDATE students SET sname = $1, cnic = $2, gender= $3, age = $4,rollno = $5 WHERE rollno = $6",
      [name, cnic, gender, age, rollno, rollN]
    );
    let s = await pool.query(
      "UPDATE department SET dname=$1,rollno=$2  WHERE rollno = $3",
      [dept, rollno, rollN]
    );
    let t = await pool.query(
      "Update semester SET semno=$1,rollno=$2,hostelfee=$3,status=$4 WHERE rollno = $5",
      [semester, rollno, hostelfee, false, rollN]
    );
    let u = await pool.query("Update months SET rollno=$1  WHERE rollno = $2", [
      rollno,
      rollN,
    ]);
    if (r.rowCount > 0 && s.rowCount > 0 && t.rowCount > 0 && u.rowCount > 0)
      res.send("Record has been updated");
    else res.send("Record has not been updated");
  } catch (error) {
    res.send(error.message);
  }
});
app.delete("/remove/:id", async (req, res) => {
  try {
    let rollN = req.params.id;

    let r = await pool.query("DELETE FROM students WHERE rollno = $1", [rollN]);
    if (r.rowCount > 0) res.send("Record has been removed");
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/getExitEntry", async (req, res) => {
  try {
    let data = req.body;
    let rollno = data.rollno;
    let sems = data.sems;
    const allUsers = await pool.query(
      `SELECT * FROM exitentry where rollno = $1 and semno=$2`,
      [rollno, sems]
    );
    allUsers.rows;
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});

app.get("/todayMenu/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const allUsers = await pool.query(`SELECT * FROM menu where time = $1`, [
      id,
    ]);
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
    const allUsers = await pool.query(
      `select * from hostelsupervisor where cnic::BigInt=${id}`
    );
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});
app.delete("/removeHW/:id", async (req, res) => {
  try {
    let rollN = req.params.id;
    let r = await pool.query("DELETE FROM hostelsupervisor WHERE cnic = $1", [
      rollN,
    ]);
    if (r.rowCount > 0) res.send("Record has been removed");
  } catch (error) {
    res.send(error.message);
  }
});
app.get("/hostel", async (req, res) => {
  try {
    let id = req.params.id;
    const allUsers = await pool.query(`select * from hostelsupervisor`);
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});

app.post("/getHostelFee", async (req, res) => {
  try {
    let data = req.body;
    let rollno = data.rollno;

    const allUsers = await pool.query(
      `SELECT * FROM semester where rollno = $1`,
      [rollno]
    );
    allUsers.rows;
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});
app.patch("/hostelRegister", async (req, res) => {
  try {
    let data = req.body;
    let cnic = data.user;
    let password = data.password;
    let r = await pool.query(
      "UPDATE hostelsupervisor SET password = $1 WHERE cnic = $2",
      [password, cnic]
    );
    if (r.rowCount > 0) res.send("User Registered Successfully");
    else res.send("User not Registered Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.patch("/updateHW", async (req, res) => {
  try {
    let data = req.body;
    let cn = data.cnic;
    let name = data.name;
    let rollN = data.rollN;

    let r = await pool.query(
      "UPDATE hostelsupervisor SET name = $1, cnic=$2 WHERE cnic::BigInt = $3",
      [name, cn, rollN]
    );

    if (r.rowCount > 0) res.send("User Updated Successfully");
    else res.send("User not updated Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/saveHW", async (req, res) => {
  try {
    let data = req.body;
    let cnic = data.cnic;
    let name = data.name;
    const result = await pool.query(
      'INSERT INTO "hostelsupervisor" (name,cnic) VALUES ($1,$2)',
      [name, cnic]
    );
    res.json(
      result.rowCount > 0
        ? "User added successfully"
        : "User not added successfully"
    );
  } catch (error) {
    res.json(error.message);
  }
});

////////////////////////////////////////////////////
/////////////// Security ///////////////////////////
////////////////////////////////////////////////////

app.patch("/updateSW", async (req, res) => {
  try {
    let data = req.body;
    let cnic = data.user;
    let name = data.name;
    let rollN = data.rollN;
    let r = await pool.query(
      "UPDATE securitysupervisor SET name = $1, cnic=$2 WHERE cnic = $3",
      [name, cnic, rollN]
    );
    if (r.rowCount > 0) res.send("User Updated Successfully");
    else res.send("User not updated Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/security", async (req, res) => {
  try {
    let id = req.params.id;
    const allUsers = await pool.query(`select * from securitysupervisor`);
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});

app.get("/security/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const allUsers = await pool.query(
      `select * from securitysupervisor where cnic::BigInt=${id}`
    );
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});
app.patch("/securityRegister", async (req, res) => {
  try {
    let data = req.body;
    console.log(data);
    let cnic = data.user;
    let password = data.password;
    console.log(cnic, password);
    let r = await pool.query(
      "UPDATE securitysupervisor SET password = $1 WHERE cnic = $2",
      [password, cnic]
    );
    if (r.rowCount > 0) res.send("User Registered Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/saveSW", async (req, res) => {
  try {
    let data = req.body;
    let cnic = data.cnic;
    let name = data.name;
    const result = await pool.query(
      'INSERT INTO "securitysupervisor" (name,cnic) VALUES ($1,$2)',
      [name, cnic]
    );
    res.json(
      result.rowCount > 0
        ? "User added successfully"
        : "User not added successfully"
    );
  } catch (error) {
    res.json(error.message);
  }
});

app.delete("/removeSW/:id", async (req, res) => {
  try {
    let rollN = req.params.id;
    let r = await pool.query("DELETE FROM securitysupervisor WHERE cnic = $1", [
      rollN,
    ]);
    if (r.rowCount > 0) res.send("Record has been removed");
  } catch (error) {
    res.send(error.message);
  }
});

///////////////////////////////////////////////////////////////////////////////////////////

app.post("/exitentry", async (req, res) => {
  try {
    let data = req.body;
    let rollno = data.rollno;
    let datetime = data.dateTime;
    let sem = data.sem;
    let exen = data.exen;
    const result = await pool.query(
      'INSERT INTO "exitentry" (rollno,semno,datetime,status) VALUES ($1,$2,$3,$4)',
      [rollno, sem, datetime, exen]
    );
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
    let id = req.params.id;
    const allUsers = await pool.query(`select * from messsupervisor`);
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});

app.patch("/messRegister", async (req, res) => {
  try {
    let data = req.body;
    let cnic = data.user;
    let password = data.password;
    let r = await pool.query(
      "UPDATE messsupervisor SET password = $1 WHERE cnic = $2",
      [password, cnic]
    );
    if (r.rowCount > 0) res.send("User Registered Successfully");
    else res.send("User not Registered Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/mess/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const allUsers = await pool.query(
      `select * from messsupervisor where cnic::BigInt=${id}`
    );
    res.json(allUsers.rows);
  } catch (error) {
    res.json(error.message);
  }
});

app.patch("/updateMW", async (req, res) => {
  try {
    let data = req.body;
    let cnic = data.user;
    let name = data.name;
    let rollN = data.rollN;
    let r = await pool.query(
      "UPDATE messsupervisor SET name = $1, cnic=$2 WHERE cnic = $3",
      [name, cnic, rollN]
    );
    if (r.rowCount > 0) res.send("User Updated Successfully");
    else res.send("User not updated Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

app.delete("/removeMW/:id", async (req, res) => {
  try {
    let rollN = req.params.id;
    let r = await pool.query("DELETE FROM messsupervisor WHERE cnic = $1", [
      rollN,
    ]);
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
    const result = await pool.query(
      'INSERT INTO "messsupervisor" (name,cnic) VALUES ($1,$2)',
      [name, cnic]
    );
    res.json(
      result.rowCount > 0
        ? "User added successfully"
        : "User not added successfully"
    );
  } catch (error) {
    res.json(error.message);
  }
});

app.post("/markAttendance", async (req, res) => {
  try {
    let data = req.body;
    console.log("data", data);
    let rollno = data.rollno;
    let price = data.price;
    let date = data.date;
    let time = data.time;
    const result = await pool.query(
      'INSERT INTO "attendancesheet" (rollno,price,date,time) VALUES ($1,$2,$3,$4)',
      [rollno, price, date, time]
    );
    const results = await pool.query(
      "select messfee from months where rollno=$1",
      [rollno]
    );

    let p = results.rows[0]["messfee"] == null ? 0 : results.rows[0]["messfee"];
    price = price + p;
    let month = date.substr(3, 4);
    console.log("month: ", month, price);
    res.json(result);
  } catch (error) {
    res.json(error.message);
  }
});

app.post("/addMenu", async (req, res) => {
  try {
    let data = req.body;

    let name = data.dishName;
    let price = data.dishPrice;
    let date = data.date;
    let units = data.units;
    let time = data.time;
    const result = await pool.query(
      'INSERT INTO menu(name, price, units, daydate, "time") VALUES ($1,$2,$3,$4,$5)',
      [name, price, units, date, time]
    );

    console.log(result.rowCount);
    res.json(result);
  } catch (error) {
    res.json(error.message);
  }
});
app.get("/getMenu", async (req, res) => {
  console.log("get menu");
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
    let data = req.body;
    let title = data.title.toString();
    let body = data.body.toString();
    let id = data.id.toString();
    let user = data.user.toString();
    const result = await pool.query(
      'INSERT INTO "Complaints" (title,body,id,complainer) VALUES ($1,$2,$3,$4)',
      [title, body, id, user]
    );
    res.json(result);
  } catch (error) {
    res.json(error.message);
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
