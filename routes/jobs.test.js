"use strict";

const request = require("supertest");

const app = require("../app");
const Job = require('../models/job')

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  u3Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach( async function() {
  commonBeforeEach();
  this.jobs = await Job.find();
});
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************************************************** POST /jobs */

describe("POST /jobs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J-new",
        salary: 10,
        equity: "0.2",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: "c1",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/********************************************************* GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 100,
              equity: "0.1",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "j2",
              salary: 20001,
              equity: "0.2",
              companyHandle: "c2",
              companyName: "C2",
            },
            {
              id: expect.any(Number),
              title: "j3",
              salary: 100000,
              equity: "0",
              companyHandle: "c1",
              companyName: "C1",
            },
          ],
        },
    );
  });

  test("filters by hasEquity", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 100,
              equity: "0.1",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "j2",
              salary: 20001,
              equity: "0.2",
              companyHandle: "c2",
              companyName: "C2",
            },
          ],
        },
    );
  });

  test("filters by title and minSalary", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ minSalary: 2, title: "3" });
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "j3",
              salary: 100000,
              equity: "0",
              companyHandle: "c1",
              companyName: "C1",
            },
          ],
        },
    );
  });

  test("bad request on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ minSalary: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/***************************************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("gets job by id", async function () {
    const resp = await request(app).get(`/jobs/${this.jobs[0].id}`);
    expect(resp.body).toEqual({
      job: {
        id: this.jobs[0].id,
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      }
    });
  });

  test("throw error if job id not found", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/******************************************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("admin can edit job", async function () {
    const resp = await request(app)
        .patch(`/jobs/${this.jobs[2].id}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J-New",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("non admin users cannot edit jobs", async function () {
    const resp = await request(app)
        .patch(`/jobs/${this.jobs[0].id}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("return not found if job id is invalid", async function () {
    console.log('testing invalid id')

    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          salary: 1000000000000,
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("cannot send data info that is not included in JSON schema", async function () {
    const resp = await request(app)
        .patch(`/jobs/${this.jobs[0].id}`)
        .send({
           handle: "new",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${this.jobs[0].id}`)
        .send({
           salary: "work for free please",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/******************************************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${this.jobs[0].id}`)
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.body).toEqual(
      {
        deleted: {
          id: this.jobs[0].id,
          title : this.jobs[0].title
        }
      });
  });

  test("auth denied if user is not admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${this.jobs[1].id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("auth denied if anon user", async function () {
    const resp = await request(app)
        .delete(`/jobs/${this.jobs[1].id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("return 404 if id not found", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
