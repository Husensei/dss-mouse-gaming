const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const client = require("./connection");
const { getCriteria } = require("./criteria/criteria");
const { addAlternative, getAlternative, updateAlternative, deleteAlternative } = require("./alternative/alternative");

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
  try {
    return getCriteria().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Add mouse alternative
app.post("/alternative", (req, res) => {
  try {
    return addAlternative(req.body).then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Get mouse alternative
app.get("/alternative", (req, res) => {
  try {
    return getAlternative().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//Edit mouse detail
app.put("/alternative/:id", (req, res) => {
  try {
    return updateAlternative(req.params, req.body)
      .then((result) => res.json(result))
      .catch((error) => res.json(error));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Delete Alternative
app.delete("/alternative/:id", (req, res) => {
  try {
    return deleteAlternative(req.params)
      .then((result) => res.json(result))
      .catch((error) => res.json(error));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});
