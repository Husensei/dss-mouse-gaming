const client = require("../connection");

const addAlternative = async (data) => {
  return new Promise(async (resolve, reject) => {
    client.query(`INSERT INTO alternative (name, shape, connectivity, grip, weight, sensor, price) VALUES ('${data.name}', '${data.shape}', '${data.connectivity}', '${data.grip}', ${data.weight}, '${data.sensor}', '${data.price}')`);
    resolve({ status: 201, message: "Insert success" });
  });
};

const getAlternative = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(`SELECT * FROM alternative`, (err, result) => {
      if (err) reject(err.message);
      if (!result) reject({ status: 404, message: "Data not found" });
      resolve(result.rows);
    });
  });
};

const updateAlternative = async (params, data) => {
  return new Promise(async (resolve, reject) => {
    const id = params.id;
    client.query(
      `UPDATE alternative SET name = '${data.name}', shape = '${data.shape}', connectivity = '${data.connectivity}', grip = '${data.grip}', weight = ${data.weight}, sensor = '${data.sensor}', price = '${data.price}' WHERE id = '${id}'`,
      (err, result) => {
        if (err) reject(err.message);
        resolve({ status: 202, message: "Update success" });
      }
    );
  });
};

const deleteAlternative = async (data) => {
  return new Promise(async (resolve, reject) => {
    var q = await client.query(`DELETE FROM alternative WHERE id = '${data.id}'`);
    if (q.rowCount == 0) reject({ status: 404, message: "Data not found" });
    resolve({ status: 202, message: "Delete success" });
  });
};

module.exports = {
  addAlternative,
  getAlternative,
  updateAlternative,
  deleteAlternative,
};
