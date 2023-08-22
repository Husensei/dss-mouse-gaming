const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const client = require("./connection");
const { getCriteria, calculateWeight, getLambdaMax, getCI, getCR } = require("./criteria/criteria");
const { addAlternative, getAlternative, updateAlternative, deleteAlternative, selectedAlternative, getRecommendation } = require("./alternative/alternative");
const { getMatrix, insertMatrix, getPreference, insertPreference } = require("./preference/preference");

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
app.get("/criteria", (_, res) => {
  try {
    return getCriteria().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Get criteria weight
app.get("/criteria/ahp", (_, res) => {
  try {
    return calculateWeight().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Get lambda max value
app.get("/criteria/lambdamax", (_, res) => {
  try {
    return getLambdaMax().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Get CI value
app.get("/criteria/ci", (_, res) => {
  try {
    return getCI().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Get CR value
app.get("/criteria/cr", (_, res) => {
  try {
    return getCR().then((result) => res.json(result));
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
app.get("/alternative", (_, res) => {
  try {
    return getAlternative().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//Edit mouse alternative
app.patch("/alternative", (req, res) => {
  try {
    return updateAlternative(req.body).then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Delete mouse alternative
app.delete("/alternative/:id", (req, res) => {
  try {
    return deleteAlternative(req.params).then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.get("/matrix", (_, res) => {
  try {
    return getMatrix().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/matrix", (req, res) => {
  try {
    return insertMatrix(req.body).then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.get("/preference", (_, res) => {
  try {
    return getPreference().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/preference", (req, res) => {
  try {
    return insertPreference(req.body).then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/recommendation", (req, res) => {
  try {
    return selectedAlternative(req.body).then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.get("/recommendation", (_, res) => {
  try {
    return getRecommendation().then((result) => res.json(result));
  } catch (error) {
    return res.status(500).json(error.message);
  }
});
