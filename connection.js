import express, { json } from "express";
var app = express();
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import compression from 'compression'
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
const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    // Will not compress responses, if this header is present
    return false;
  }
  // Resort to standard compression
  return compression.filter(req, res);
};
// Compress all HTTP responses
app.use(compression({
  // filter: Decide if the answer should be compressed or not,
  // depending on the 'shouldCompress' function above
  filter: shouldCompress,
  // threshold: It is the byte threshold for the response 
  // body size before considering compression, the default is 1 kB
  threshold: 0
}));
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
