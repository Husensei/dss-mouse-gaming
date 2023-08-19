const client = require("../connection");

const getMatrix = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(`SELECT * FROM pairwise_comparison`, (err, result) => {
      if (err) reject(err.message);
      if (!result) reject({ status: 404, message: "Data not found" });
      resolve(result.rows);
    });
  });
};

const insertMatrix = async (data) => {
  return new Promise(async (resolve, reject) => {
    const queries = [];
    for (var i = 0; i < data.scale.length; i++) {
      queries.push(`INSERT INTO pairwise_comparison (id_criteria1, id_criteria2, value) VALUES ('${data.scale[i].row}', '${data.scale[i].column}', ${data.scale[i].value})`);
    }
    try {
      const reset = await client.query(`DELETE FROM pairwise_comparison WHERE EXISTS (SELECT 1 FROM pairwise_comparison);`);
      for (const query of queries) {
        const result = await client.query(query);
      }
      resolve({ status: 201, message: "Insert success" });
    } catch (error) {
      reject(error);
    }
  });
};

const getPreference = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(`SELECT * FROM preference`, (err, result) => {
      if (err) reject(err.message);
      if (!result) reject({ status: 404, message: "Data not found" });
      resolve(result.rows);
    });
  });
};

const insertPreference = async (data) => {
  return new Promise(async (resolve, reject) => {
    const reset = await client.query(`DELETE FROM preference WHERE EXISTS (SELECT 1 FROM preference);`);

    client.query(
      `INSERT INTO preference (ergo_pref, ambi_pref, wireless_pref, wired_pref, palm_pref, claw_pref, fingertip_pref, price_pref) VALUES ('${data.ergo_pref}', '${data.ambi_pref}', '${data.wireless_pref}', '${data.wired_pref}', '${data.palm_pref}', '${data.claw_pref}', '${data.fingertip_pref}', '${data.price_pref}')`
    );
    resolve({ status: 201, message: "Insert success" });
  });
};

module.exports = {
  getMatrix,
  insertMatrix,
  getPreference,
  insertPreference,
};
