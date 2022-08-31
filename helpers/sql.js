const { BadRequestError } = require("../expressError");

/**
 * Takes JS object and builds  into SQL query.
 *
 * dataToUpdate: takes JS object with keys:values to update in database. Error if no key
 *
 * Ex: { firstName: "Jessie", lastName: "Jones"}
 *
 * jsToSql: takes object with JS keys and SQL variable names as values to convert
 *
 * Ex: { firstName: "first_name", lastName: "last_name"}
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  console.log("sqlForPartialUpdate, Keys:", keys)

  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  console.log("sqlForPartialUpdate =>", {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate)
      });
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
