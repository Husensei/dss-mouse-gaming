const express = require("express");

const client = require("./connection");
const app = express();

app.listen(3100, () => {
  console.log("Server running in port 3100");
});
