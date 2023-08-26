const client = require("../connection");

const getCriteria = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(`SELECT * FROM criteria ORDER BY id`, (err, result) => {
      if (err) reject(err.message);
      if (!result.rows) reject({ status: 404, message: "Data not found" });
      resolve(result.rows);
    });
  });
};

const calculateWeight = async () => {
  return new Promise(async (resolve, reject) => {
    const arr = await client.query(
      `WITH f_values AS (SELECT id_criteria1, POWER(CAST(EXP(SUM(LN(value))) as numeric), 1.0/6) AS f_value 
      FROM pairwise_comparison GROUP BY id_criteria1), 
      sum_f_values AS (SELECT SUM(f_value) AS total_f_value FROM f_values) 
      SELECT f.id_criteria1, f.f_value, f.f_value / sf.total_f_value AS weight FROM f_values f 
      CROSS JOIN sum_f_values sf ORDER BY f.id_criteria1;`
    );

    const reset = await client.query(`DELETE FROM criteria_weight 
    WHERE EXISTS (SELECT 1 FROM pairwise_comparison);`);
    const queries = [];

    for (var i = 0; i < arr.rowCount; i++) {
      queries.push(`INSERT INTO criteria_weight(id_criteria, f_value, weight) VALUES('${arr.rows[i].id_criteria1}', '${arr.rows[i].f_value}', '${arr.rows[i].weight}')`);
    }

    try {
      queries.push(`SELECT * FROM criteria_weight;`);
      var result;
      for (const query of queries) {
        result = await client.query(query);
      }
      resolve(result.rows);
    } catch (error) {
      reject(error);
    }
  });
};

const getLambdaMax = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(
      `SELECT SUM(criteria_weight.weight * total.s) lambda_max FROM criteria_weight 
      JOIN (SELECT id_criteria2, SUM(value) s FROM pairwise_comparison GROUP BY id_criteria2) total 
      ON criteria_weight.id_criteria = total.id_criteria2;`,
      (err, result) => {
        if (err) reject(err.message);
        resolve(result.rows[0]);
      }
    );
  });
};

const getCI = async () => {
  return new Promise(async (resolve, reject) => {
    const lambdaMax = await client.query(
      `SELECT SUM(criteria_weight.weight * total.s) lambda_max FROM criteria_weight 
    JOIN (SELECT id_criteria2, SUM(value) s FROM pairwise_comparison GROUP BY id_criteria2) total 
    ON criteria_weight.id_criteria = total.id_criteria2;`
    );

    const arr = await client.query(`SELECT DISTINCT id_criteria1 FROM pairwise_comparison ORDER BY id_criteria1;`);

    ci_value = (lambdaMax.rows[0].lambda_max - arr.rowCount) / (arr.rowCount - 1);
    resolve(ci_value);
  });
};

const getCR = async () => {
  return new Promise(async (resolve, reject) => {
    const lambdaMax = await client.query(
      `SELECT SUM(criteria_weight.weight * total.s) lambda_max FROM criteria_weight 
    JOIN (SELECT id_criteria2, SUM(value) s FROM pairwise_comparison GROUP BY id_criteria2) total 
    ON criteria_weight.id_criteria = total.id_criteria2;`
    );

    const arr = await client.query(`SELECT DISTINCT id_criteria1 FROM pairwise_comparison ORDER BY id_criteria1;`);

    let ci_value = (lambdaMax.rows[0].lambda_max - arr.rowCount) / (arr.rowCount - 1);
    const ri = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    const cr_value = ci_value / ri[arr.rowCount];
    resolve(cr_value);
  });
};

module.exports = {
  getCriteria,
  calculateWeight,
  getLambdaMax,
  getCI,
  getCR,
};
