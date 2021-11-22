const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { request } = require("chai");

chai.use(chaiHttp);
let testId;

describe("Functional Tests", function () {
  // POST request
  describe("POST request to api/issues/{project}", function () {
    it("Create an issue with every field", function (done) {
      chai
        .request(server)
        .post("/api/issues/project")
        .send({
          issue_title: "Project issue",
          issue_text: "Not passing tests",
          created_by: "Ting-Ting",
          assigned_to: "FCC",
          status_text: "Not solved",
          project: "project",
        })
        .end(function (err, res) {
          testId = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Project issue");
          assert.equal(res.body.issue_text, "Not passing tests");
          assert.equal(res.body.created_by, "Ting-Ting");
          assert.equal(res.body.assigned_to, "FCC");
          assert.equal(res.body.status_text, "Not solved");
          done();
        });
    });
    it("Create an issue with only required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/projects")
        .send({
          issue_title: "Project issue",
          issue_text: "Not passing tests",
          created_by: "Ting-Ting",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Project issue");
          assert.equal(res.body.issue_text, "Not passing tests");
          assert.equal(res.body.created_by, "Ting-Ting");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          done();
        });
    });
    it("Create an issue with missing required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/projects")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: "",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  // GET requests
  describe("GET request to api/issues/{project}", function () {
    it("View issues on a project", function (done) {
      chai
        .request(server)
        .get("/api/issues/project")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          res.body.forEach((issue) => {
            var test = "";
            if (
              issue._id === undefined ||
              issue.issue_title === undefined ||
              issue.issue_text === undefined ||
              issue.created_by === undefined ||
              issue.assigned_to === undefined ||
              issue.status_text === undefined ||
              issue.created_on === undefined ||
              issue.updated_on === undefined ||
              issue.open === undefined
            ) {
              console.log("UNDEFINED FOUND");
              console.log(issue);
            }

            assert.notEqual(issue._id, undefined);
            assert.notEqual(issue.issue_title, undefined);
            assert.notEqual(issue.issue_text, undefined);
            assert.notEqual(issue.created_by, undefined);
            assert.notEqual(issue.assigned_to, undefined);
            assert.notEqual(issue.status_text, undefined);
            assert.notEqual(issue.created_on, undefined);
            assert.notEqual(issue.updated_on, undefined);
            assert.notEqual(issue.open, undefined);
          });
          done();
        });
    });
    it("View issues on a project with one filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/project")
        .query({ assigned_to: "FCC" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          res.body.forEach((issue) => {
            assert.equal(issue.assigned_to, "FCC");
          });
          done();
        });
    });
    it("View issues on a project with multiple filters", function (done) {
      chai
        .request(server)
        .get("/api/issues/project")
        .query({ assigned_to: "FCC", created_by: "Ting-Ting" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          res.body.forEach((issue) => {
            assert.equal(issue.assigned_to, "FCC");
            assert.equal(issue.created_by, "Ting-Ting");
          });
          done();
        });
    });
  });
  // PUT requests
  describe("PUT request to api/issues/{project}", function () {
    it("Update one field on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/project")
        .send({
          _id: testId,
          issue_text: "Problem XYZ",
          project: "project",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, testId);
          done();
        });
    });
    it("Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/project")
        .send({
          _id: testId,
          issue_text: "Problem XYZ",
          status_text: "Solved",
          project: "project",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, testId);
          done();
        });
    });
    it("Update an issue with missing _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/project")
        .send({
          _id: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    it("Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/project")
        .send({
          _id: testId,
          issue_title: "",
          issue_text: "",
          created_by: "",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });
    it("Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/project")
        .send({
          _id: "nonexistingid",
          created_by: "Ting-Ting",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "nonexistingid");
          done();
        });
    });
  });

  // DELETE request
  describe("DELETE request to api/issues/{project}", function () {
    it("Delete an issue", function (done) {
      chai
        .request(server)
        .delete("/api/issues/project")
        .send({
          _id: testId,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, testId);
          done();
        });
    });
    it("Delete an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/project")
        .send({
          _id: "nonexistingid",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "nonexistingid");
          done();
        });
    });
    it("Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/project")
        .send({
          _id: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
