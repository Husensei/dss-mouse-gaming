const client = require("../connection");

const getAllCriteria = async () => {
  return new Promise(async (resolve, reject) => {
    client.connect();
    client.query(`SELECT * FROM criteria`, (err, result) => {
      if (err) reject(err.message);
      if (!result) reject({ status: 404, message: "data-not-found" });
      resolve(result.rows);
      client.end();
    });
  });
};

module.exports = {
  getAllCriteria,
};
