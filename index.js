const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const { getAllCriteria } = require("./criteria/criteria");
const client = require("./connection");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

process.on("uncaughtException", function (err) {
  console.log(err);
});

app.listen(3100, () => {
  console.log("Server is listening on port");
});

client.connect((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected");
  }
});

// app.get("/criteria", async (_, res) => {
//   try {
//     return getAllCriteria().then((result) => res.json(result));
//   } catch (error) {}
// });

app.get("/criteria", (req, res) => {
  client.query(`SELECT * FROM criteria`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
});

app.get("/alternative", (req, res) => {
  client.query(`SELECT * FROM mouse_alternative`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
});

app.post("/alternative", (req, res) => {
  const { name, shape, connectivity, grip, weight, sensor, price } = req.body;
  client.query(
    `INSERT INTO mouse_alternative (mouse_name, mouse_shape, mouse_connectivity, mouse_grip, mouse_weight, mouse_sensor, mouse_price) VALUES ('${name}', '${shape}', '${connectivity}', '${grip}', ${weight}, '${sensor}', '${price}')`,
    (err, result) => {
      if (!err) {
        res.send({ message: "Insert Success" });
      } else {
        res.send(err.message);
      }
    }
  );
});

app.put("/alternative/:id", (req, res) => {
  const { name, shape, connectivity, grip, weight, sensor, price } = req.body;
  client.query(
    `UPDATE mouse_alternative SET mouse_name = '${name}', mouse_shape = '${shape}', mouse_connectivity = '${connectivity}', mouse_grip = '${grip}', mouse_weight = ${weight}, mouse_sensor = '${sensor}', mouse_price = '${price}' WHERE mouse_id = '${req.params.id}'`,
    (err, result) => {
      if (!err) {
        res.send({ message: "Update Success" });
      } else {
        res.send(err.message);
      }
    }
  );
});

app.delete("/alternative/:id", (req, res) => {
  client.query(`DELETE FROM mouse_alternative WHERE mouse_id = '${req.params.id}'`, (err, result) => {
    if (!err) {
      res.send({ message: "Delete Success" });
    } else {
      res.send(err.message);
    }
  });
});
