const client = require("../connection");

const getCriteria = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(`SELECT * FROM criteria`, (err, result) => {
      if (err) reject(err.message);
      if (!result) reject({ status: 404, message: "Data not found" });
      resolve(result.rows);
    });
  });
};

module.exports = {
  getCriteria,
};
