const { BadRequestError } = require("../expressError");

/** Converts arguements into columns/values to use in SQL queries.
 *
 * Args:
 * @arg dataToUpdate {object} - required - Key:values to update in database.
 * >   Ex: { firstName: "Jessie", lastName: "Jones"}
 *
 * @arg jsToSql {object} - Key:values with JS variable names as keys and SQL variable names as values.
 * >   Ex: { firstName: "first_name", lastName: "last_name"}
 *
 * @returns {object}
 * { setCols: "first_name"=$1, "last_name"=$2', values: ["Jessie", "Jones"] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);

  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
