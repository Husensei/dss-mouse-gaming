const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const client = require("./connection");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

process.on("uncaughtException", function (err) {
  console.log(err);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});

client.connect((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected");
  }
});

app.get("/", (_, res) => {
  res.send("Hello, World!");
});

// Get mouse criteria
app.get("/criteria", (req, res) => {
  client.query(`SELECT * FROM criteria`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
});

// Add mouse alternative
app.post("/alternative", (req, res) => {
  const { name, shape, connectivity, grip, weight, sensor, price } = req.body;
  client.query(`INSERT INTO alternative (name, shape, connectivity, grip, weight, sensor, price) VALUES ('${name}', '${shape}', '${connectivity}', '${grip}', ${weight}, '${sensor}', '${price}')`, (err, result) => {
    if (!err) {
      res.send({ message: "Insert Success" });
    } else {
      res.send(err.message);
    }
  });
});

// Get all mouse alternative
app.get("/alternative", (req, res) => {
  client.query(`SELECT * FROM alternative`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
});

// Edit mouse specification
app.put("/alternative/:id", (req, res) => {
  const { name, shape, connectivity, grip, weight, sensor, price } = req.body;
  client.query(`UPDATE alternative SET name = '${name}', shape = '${shape}', connectivity = '${connectivity}', grip = '${grip}', weight = ${weight}, sensor = '${sensor}', price = '${price}' WHERE id = '${req.params.id}'`, (err, result) => {
    if (!err) {
      res.send({ message: "Update Success" });
    } else {
      res.send(err.message);
    }
  });
});

// Delete mouse alternative
app.delete("/alternative/:id", (req, res) => {
  client.query(`DELETE FROM alternative WHERE id = '${req.params.id}'`, (err, result) => {
    if (!err) {
      res.send({ message: "Delete Success" });
    } else {
      res.send(err.message);
    }
  });
});
