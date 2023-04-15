import express, { json } from "express";
var app = express();
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import bodyParser from "body-parser";
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const port = 3000;
var pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "90opklnm",
  database: "postgres",
});
app.use(
  cors({
    origin: "*",
  })
);
app.use(json());
app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to database: ", err);
    return;
  }
  console.log("Connected to database.");
});

export {app,pool}
