"use strict";

const db = require("../db");
const { ForbiddenError, NotFoundError, BadRequestError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach( async function() {
  commonBeforeEach();
  this.jobs = await getTestJobs(); // alternate way to make a variable to use with tests
});
afterEach(commonAfterEach);
afterAll(commonAfterAll);

async function getTestJobs(){
    const jobRes = await db.query(`SELECT * FROM jobs`)
    return jobRes.rows
}

/**************************************************************** create */
describe("create job method", function () {
  let newJob = {
    companyHandle: "c1",
    title: "fakeJob",
    salary: 10,
    equity: "0.1",
  };
  let invalidJob = {
    companyHandle:"invalid",
    salary: -1,
    equity: "1.5"
  };

  test("creates job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "fakeJob",
      salary: 10,
      equity: "0.1",
      companyHandle: 'c1',
    });
  });

  test('if create job fails due to constraint => throws error', async function(){
    try{
      await Job.create(invalidJob);
      fail();
    } catch(err){
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
  });

  test('create job fails with error if empty title string', async function(){
    try{
      await Job.create({ title: '', companyHandle: 'c1' });
      fail();
    } catch(err){
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
  });
});

/*********************************************************************** get */
describe('Get job by id', function(){
  test('Job.get(id) returns one job', async function(){
    const testJobs = await getTestJobs();
    const result = await Job.get(testJobs[0].id);

    expect(result).toEqual(
        { "id": testJobs[0].id,
          "companyHandle": "c1",
          "equity": "0.1",
          "salary": 1000,
          "title": "j1",
          "companyName" : 'C1'
        });
  })

  test('Job.get(string)- if not found => 404', async function(){
    try{
      await Job.get('invalid');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError ).toBeTruthy();
    };
  });

  test('Job.get(number)- if not found => 404', async function(){
    try{
      await Job.get(1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError ).toBeTruthy();
    };
  });

  test('Job.get(id)- if no arg => error', async function(){
    try{
      await Job.get(undefined);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError ).toBeTruthy();
    };
  });
})

/***************************************************************** find */

describe('Job.find method', function(){
  test('Job.find() with no arg returns all jobs', async function(){
    const result = await Job.find();
    expect(result).toEqual(
      [
        {
          id: this.jobs[0].id,
          title: "j1",
          salary: 1000.00,
          equity: "0.1",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: this.jobs[1].id,
          title: "j2",
          salary: 20001,
          equity: "0.2",
          companyHandle: "c2",
          companyName: "C2",
        },
        {
          id: this.jobs[2].id,
          title: "j3",
          salary: 100000,
          equity: "0",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: this.jobs[3].id,
          title: "j4",
          salary: null,
          equity: null,
          companyHandle: "c1",
          companyName: "C1",
        },
      ]);
  });


  test("works with min salary", async function () {
    let jobs = await Job.find({ minSalary: 90000 });
    expect(jobs).toEqual([
      {
        id: this.jobs[2].id,
        title: "j3",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works with equity", async function () {
    let jobs = await Job.find({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: this.jobs[0].id,
        title: "j1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: this.jobs[1].id,
        title: "j2",
        salary: 20001,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });

  test("works with min salary & equity", async function () {
    let jobs = await Job.find({ minSalary: 15000, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: this.jobs[1].id,
        title: "j2",
        salary: 20001,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });

  test("works with name", async function () {
    let jobs = await Job.find({ title: "j1" });
    expect(jobs).toEqual([
      {
        id: this.jobs[0].id,
        title: "j1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
  test("works with name, equity and minSalary", async function () {
    let jobs = await Job.find({ title: "j",  minSalary: 15000, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: this.jobs[1].id,
        title: "j2",
        salary: 20001,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });
});

/*********************************************************************** update */

describe('Job.update method', function(){
    let updateData = {
      title: "New",
      salary: 500,
      equity: "0.5",
    };

    test("works", async function () {
      let job = await Job.update(this.jobs[0].id, updateData);
      expect(job).toEqual({
        id: this.jobs[0].id,
        companyHandle: "c1",
        ...updateData,
      });
    });

    test("not found if no such job", async function () {
      try {
        await Job.update(0, {
          title: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

    test("bad request with no data", async function () {
      try {
        await Job.update(this.jobs[0].id, {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

/*********************************************************************** delete */

describe('Job.delete method', function(){
  test('should delete job and return job id, title', async function(){
        const testJobs = await getTestJobs();
        const result = await Job.delete(testJobs[3].id);
        expect(result).toEqual(
            {
              "id" : testJobs[3].id,
              "title": "j4"
            });
  });

  test('should throw error if deleted job not found', async function(){
    try{
        await Job.delete('1');
        fail();
    }catch(err){
        expect(err instanceof BadRequestError).toBeTruthy();
    };
  });
});
