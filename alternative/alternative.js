const client = require("../connection");

const addAlternative = async (data) => {
  return new Promise(async (resolve, reject) => {
    client.query(
      `INSERT INTO alternative (name, shape, connectivity, 
        grip, weight, sensor, price) VALUES ('${data.name}', 
        '${data.shape}', '${data.connectivity}', '${data.grip}', 
        ${data.weight}, '${data.sensor}', '${data.price}')`
    );
    resolve({ status: 201, message: "Insert success" });
  });
};

const getAlternative = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(
      `SELECT * FROM alternative 
    ORDER BY name`,
      (err, result) => {
        if (err) reject(err.message);
        if (!result.rows) reject({ status: 404, message: "Data not found" });
        resolve(result.rows);
      }
    );
  });
};

const updateAlternative = async (data) => {
  return new Promise(async (resolve, reject) => {
    client.query(
      `UPDATE alternative SET name = '${data.name}', 
      shape = '${data.shape}', connectivity = 
      '${data.connectivity}', grip = '${data.grip}', 
      weight = ${data.weight}, sensor = '${data.sensor}', 
      price = '${data.price}' WHERE id = '${data.id}'`,
      (err, result) => {
        if (err) reject(err.message);
        resolve({ status: 202, message: "Update success" });
      }
    );
  });
};

const deleteAlternative = async (data) => {
  return new Promise(async (resolve, reject) => {
    var q = await client.query(
      `DELETE FROM alternative 
      WHERE id = '${data.id}'`
    );
    if (q.rowCount == 0) reject({ status: 404, message: "Data not found" });
    resolve({ status: 202, message: "Delete success" });
  });
};

function interpolationLinear(x, x1, x2, y1, y2) {
  return ((x - x1) / (x2 - x1)) * (y2 - y1) + y1;
}

function getWeightByName(name, table) {
  const row = table.rows.find((row) => row.name === name);
  return row ? row.weight : null;
}

const selectedAlternative = async (data) => {
  return new Promise(async (resolve, reject) => {
    const reset = await client.query(
      `DELETE FROM recommendation 
    WHERE EXISTS (SELECT 1 FROM recommendation);`
    );
    const userPreference = await client.query(`SELECT * FROM preference`);
    const criteriaWeight = await client.query(
      `SELECT c.name, cw.weight
    FROM criteria_weight cw
    JOIN criteria c ON cw.id_criteria = c.id;`
    );

    const shapeWeight = getWeightByName("Shape", criteriaWeight);
    const connectivityWeight = getWeightByName("Connectivity", criteriaWeight);
    const gripWeight = getWeightByName("Grip", criteriaWeight);
    const weightWeight = getWeightByName("Weight", criteriaWeight);
    const sensorWeight = getWeightByName("Sensor", criteriaWeight);
    const priceWeight = getWeightByName("Price", criteriaWeight);

    const convertedData = data.map((item) => {
      let convertedItem = { ...item };

      if (item.shape === "Ergonomis") {
        convertedItem.shape = parseInt(userPreference.rows[0].ergo_pref, 10);
      } else if (item.shape === "Ambidextrous") {
        convertedItem.shape = parseInt(userPreference.rows[0].ambi_pref, 10);
      }

      if (item.connectivity === "Wireless") {
        convertedItem.connectivity = parseInt(userPreference.rows[0].wireless_pref, 10);
      } else if (item.connectivity === "Wired") {
        convertedItem.connectivity = parseInt(userPreference.rows[0].wired_pref, 10);
      }

      if (item.grip === "Palm") {
        convertedItem.grip = parseInt(userPreference.rows[0].palm_pref, 10);
      } else if (item.grip === "Claw") {
        convertedItem.grip = parseInt(userPreference.rows[0].claw_pref, 10);
      } else if (item.grip === "Fingertip") {
        convertedItem.grip = parseInt(userPreference.rows[0].fingertip_pref, 10);
      }

      return convertedItem;
    });

    const weightValues = convertedData.map((item) => item.weight);
    const maxWeight = Math.max(...weightValues);
    const minWeight = Math.min(...weightValues);

    const sensorArray = convertedData.map((item) => item.sensor);
    const sensorValues = await client.query(
      `SELECT * FROM sensor_rating 
    WHERE sensor_name IN 
    (${sensorArray.map((_, i) => `$${i + 1}`).join(", ")})`,
      sensorArray
    );

    const minMaxSensor = {
      cpi: { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
      ips: { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
      acceleration: { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
    };

    sensorValues.rows.forEach((ratingItem) => {
      minMaxSensor.cpi.min = Math.min(minMaxSensor.cpi.min, ratingItem.cpi);
      minMaxSensor.cpi.max = Math.max(minMaxSensor.cpi.max, ratingItem.cpi);

      minMaxSensor.ips.min = Math.min(minMaxSensor.ips.min, ratingItem.ips);
      minMaxSensor.ips.max = Math.max(minMaxSensor.ips.max, ratingItem.ips);

      minMaxSensor.acceleration.min = Math.min(minMaxSensor.acceleration.min, ratingItem.acceleration);
      minMaxSensor.acceleration.max = Math.max(minMaxSensor.acceleration.max, ratingItem.acceleration);
    });

    const gapPrice = convertedData.map((item) => item.price - userPreference.rows[0].price_pref);
    const maxGapPrice = Math.max(...gapPrice.map(Math.abs));
    const minGapPrice = -1 * maxGapPrice;

    const interpolatedData = convertedData.map((item, index) => {
      const weightRating = interpolationLinear(item.weight, minWeight, maxWeight, 10, 1);

      const sensorRating = sensorValues.rows.find((ratingItem) => ratingItem.sensor_name === item.sensor);

      const cpiRating = interpolationLinear(sensorRating.cpi, minMaxSensor.cpi.min, minMaxSensor.cpi.max, 1, 10);
      const ipsRating = interpolationLinear(sensorRating.ips, minMaxSensor.ips.min, minMaxSensor.ips.max, 1, 10);
      const accelerationRating = interpolationLinear(sensorRating.acceleration, minMaxSensor.acceleration.min, minMaxSensor.acceleration.max, 1, 10);
      const totalRating = (cpiRating + ipsRating + accelerationRating) / 3;

      let priceRating;
      if (gapPrice[index] >= minGapPrice && gapPrice[index] <= 0) {
        priceRating = interpolationLinear(gapPrice[index], minGapPrice, 0, 1, 10);
      } else if (gapPrice[index] >= 0 && gapPrice[index] <= maxGapPrice) {
        priceRating = interpolationLinear(gapPrice[index], 0, maxGapPrice, 10, 1);
      }

      return {
        ...item,
        weight: Number.isNaN(weightRating) ? 1 : weightRating,
        sensor: Number.isNaN(totalRating) ? 1 : totalRating,
        price: Number.isNaN(priceRating) ? 1 : priceRating,
      };
    });
    interpolatedData;

    let queries = [];
    for (let i = 0; i < interpolatedData.length; i++) {
      const finalScore =
        interpolatedData[i].shape * shapeWeight +
        interpolatedData[i].connectivity * connectivityWeight +
        interpolatedData[i].grip * gripWeight +
        interpolatedData[i].weight * weightWeight +
        interpolatedData[i].sensor * sensorWeight +
        interpolatedData[i].price * priceWeight;

      queries.push(
        `INSERT INTO recommendation(id_alternative, name, shape, 
        connectivity, grip, weight, sensor, price, rating) 
        VALUES ('${interpolatedData[i].id}', '${interpolatedData[i].name}', 
        ${interpolatedData[i].shape}, ${interpolatedData[i].connectivity}, 
        ${interpolatedData[i].grip}, ${interpolatedData[i].weight}, 
        ${interpolatedData[i].sensor}, ${interpolatedData[i].price}, 
        ${finalScore})`
      );
    }

    for (const query of queries) {
      client.query(query);
    }

    resolve({ status: 201, message: "Insert Success" });
  });
};

const getRecommendation = async () => {
  return new Promise(async (resolve, reject) => {
    client.query(`SELECT * FROM recommendation ORDER BY rating DESC`, (err, result) => {
      if (err) reject(err.message);
      if (!result) reject({ status: 404, message: "Data not found" });
      resolve(result.rows);
    });
  });
};

module.exports = {
  addAlternative,
  getAlternative,
  updateAlternative,
  deleteAlternative,
  selectedAlternative,
  getRecommendation,
};
