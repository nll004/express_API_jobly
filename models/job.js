"use strict";

const db = require("../db");
const {ForbiddenError}= require('../expressError')


/** Related functions for jobs */

class Job {
  /** Create a job and insert into db, return new job data.
   *
   * Data should be { job title, job salary, equity, company handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * If the query fails or causes a constraint error, a forbidden error will be thrown.
   **/

  static async create(data) {
    try{
        if( data.title === '') throw new Error;

        const result = await db.query(
            `INSERT INTO jobs (title,
                               salary,
                               equity,
                               company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
          [ data.title, data.salary, data.equity, data.companyHandle ]);
      let job = result.rows[0];

      return job;
    }
    catch(err){
        throw new ForbiddenError('Create job failed')
    };
  };


}

module.exports = Job;
