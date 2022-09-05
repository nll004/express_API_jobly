"use strict";

const db = require("../db");
const {ForbiddenError, NotFoundError, BadRequestError}= require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');


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
        throw new ForbiddenError('Create job failed');
    };
  };

  /** Find one job by id.
   *
   * Args (number or number string). Job.get(1) or Job.get('1')
   * - If no results => 404 error.
   * - All other args are not valid, an error is thrown.
   */

    static async get(id){
        if (id && (typeof(id) === "number" || typeof(id) === "string")){
            try{
                const results = await db.query(
                        `SELECT j.id,
                            j.title,
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName"
                        FROM jobs j
                        LEFT JOIN companies AS c ON c.handle = j.company_handle
                        WHERE id = $1`, [id]
                )
                if (results.rows.length === 0) throw new Error;
                return results.rows[0]
            } catch(e){
                throw new NotFoundError('No job found with that id');
            }
        } else {
            throw new BadRequestError('Invalid argument passed to Job.get() method');
        };
    };


  /** Find jobs based on data passed
   *
   * Args:
   * > No arg. Returns an array of all jobs
   *
   * > If object arg, must receive one or more of the following:
   * >  - title: "String value to search"
   * >  - equity: Boolean
   * >  - minSalary: Number
   *
   * Returns an array of one or all of the jobs meeting the criteria
   */
    static async find({minSalary, hasEquity, title, companyHandle} = {}){
        let queryString = `SELECT j.id,
                                   j.title,
                                   j.salary,
                                   j.equity,
                                   j.company_handle AS "companyHandle",
                                   c.name AS "companyName"
                               FROM jobs j
                               LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        const whereStatements = [];
        const queryVals = [];

        // add search criteria to where statement only if included in data argument
        if (minSalary !== undefined) {
            queryVals.push(minSalary);
            whereStatements.push(`salary >= $${queryVals.length}`);
        }

        if (hasEquity === true) {
            whereStatements.push(`equity > 0`);
        }

        if (title !== undefined) {
            queryVals.push(`%${title}%`);
            whereStatements.push(`title ILIKE $${queryVals.length}`);
        }

        if (companyHandle !== undefined) {
            console.log("Job.find - companyHandle:", companyHandle);
            queryVals.push(companyHandle);
            whereStatements.push(`company_handle = $${queryVals.length}`);
        }

        if (whereStatements.length > 0) {
            queryString += " WHERE " + whereStatements.join(" AND ");
        }
        queryString += " ORDER BY title";

        const jobsRes = await db.query(queryString, queryVals);
        return jobsRes.rows;
    };

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

    static async update(id, data) {
        try{
            const { setCols, values } = sqlForPartialUpdate(
                data,
                {});
            const idVarIdx = "$" + (values.length + 1);

            const querySql = `UPDATE jobs
                              SET ${setCols}
                              WHERE id = ${idVarIdx}
                              RETURNING id,
                                        title,
                                        salary,
                                        equity,
                                        company_handle AS "companyHandle"`;
            const result = await db.query(querySql, [...values, id]);
            const job = result.rows[0];

            if (!job) throw new NotFoundError();

            return job;
        }
        catch(err){
            if (err instanceof NotFoundError) throw new NotFoundError(`No job found with id ${id}`);
            else throw new BadRequestError(`Update failed. ${err}`);
        }
    }

    /** Delete job using id. If id is not found in database, throw 404 error */

    static async delete(id){
        try{
            // look for id in db first and throw error if not found
            const checkId = await db.query(
                `SELECT id FROM jobs WHERE id = $1`, [id]
            );
            if (checkId.rows.length === 0) throw new NotFoundError();

            const result = await db.query(
                `DELETE FROM jobs WHERE id = $1 RETURNING id, title`, [id]
            )
            return result.rows[0];
        }
        catch(err){
            if (err instanceof NotFoundError) throw new NotFoundError(`Deletion failed. Job id not found.`);
            else throw new BadRequestError(`Deletion failed. ${err}`);
        }
    }
}


module.exports = Job;
