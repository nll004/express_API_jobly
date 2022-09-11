"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { requireAdmin, ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/job");
const newJobSchema = require("../schemas/jobNew.json");
const editJobSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router();


/** POST /jobs
 *
 * Takes JSON data, validates and creates new job
 *
 * Arg should be { title, salary, equity, companyHandle }
 *
 * Returns { job: { id, title, salary, equity, companyHandle } }
 *
 * Authorization required: admin
 */

router.post("/", requireAdmin, async function (req, res, next) {
  try {
    const jsonData = jsonschema.validate(req.body, newJobSchema);
    if (!jsonData.valid) {
      const errs = jsonData.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const jobResult = await Job.create(req.body);
    return res.status(201).json({ job: jobResult });
  }
  catch (err) {
    return next(err);
  }
});

/** GET /jobs
 *
 *  Retrieves a list of all jobs that meet search criteria.
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)
 *
 *  Ex. { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    const queryObj = req.query;

    // change query string values to number and boolean
    if (queryObj.hasEquity !== undefined) {
        queryObj.hasEquity = queryObj.hasEquity === "true";
    }
    if (queryObj.minSalary !== undefined) {
        queryObj.minSalary = Number(queryObj.minSalary);
    }

    try {
        const jsonData = jsonschema.validate(queryObj, jobSearchSchema);
        if (!jsonData.valid) {
          const errs = jsonData.errors.map(err => err.stack);
          throw new BadRequestError(errs);
        }
        const jobs = await Job.find(queryObj);
        return res.json({ jobs });
    }
    catch (err) {
        return next(err);
    }
});

/** GET /jobs/:id
 *
 * Get single job by id.
 *
 * Returns { job: { id, title, salary, equity, companyHandle, companyName }}
 *
 * If id is not found. Returns a 404 not found error.
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  }
  catch (err) {
    return next(err);
  }
});


/** PATCH /jobs/:id
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", requireAdmin, async function (req, res, next) {
    try {
        const jsonData = jsonschema.validate(req.body, editJobSchema);
        if (!jsonData.valid) {
            const errs = jsonData.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    }
    catch (err) {
        return next(err);
    }
});

/** DELETE /jobs/:id
 *
 * Deletes job by id.
 *
 * Return { deleted: { id, title }}
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureLoggedIn, requireAdmin, async function (req, res, next) {
    try {
        const delResult = await Job.delete(req.params.id);
        return res.json({ deleted: delResult });
    }
    catch (err) {
        return next(err);
    }
});


module.exports = router;
