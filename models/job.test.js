"use strict";

const db = require("../db");
const { ForbiddenError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobs,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

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

  test('create job fails due to constraint issues', async function(){
    try{
      await Job.create(invalidJob);
      fail();
    } catch(err){
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
  });
});
