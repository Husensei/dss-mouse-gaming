const express = require("express");
const app = express();

require("dotenv").config();

const client = require("./connection");

app.listen(process.env.DB_PORT, () => {
  console.log("Server is running");
});

client.connect((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected");
  }
});

console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_PORT);
console.log(process.env.DATABASE);
