"use strict";
const Issue = require("../model");
const mongoose = require("mongoose");
const ObjectID = require("bson-objectid");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
});

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let projectUrl = req.params.project;
      const queryParams = Object.assign({}, req.query, { project: projectUrl });

      Issue.find(queryParams, function (err, issues) {
        if (err) {
          console.log(err);
        } else {
          res.json(issues);
        }
      });
    })

    .post(function (req, res) {
      let projectUrl = req.params.project;
      const requestBody = req.body;

      if (
        !requestBody.issue_title ||
        !requestBody.issue_text ||
        !requestBody.created_by
      ) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      //console.log("creating new issue");

      const userId = ObjectID();
      const newIssue = new Issue({
        issue_title: requestBody.issue_title,
        issue_text: requestBody.issue_text,
        created_by: requestBody.created_by,
        assigned_to: requestBody.assigned_to,
        status_text: requestBody.status_text,
        _id: userId,
        project: projectUrl,
      });

      newIssue.save(function (err, user) {
        if (err) {
          return console.log(err);
        } else {
          res.send(user);
          console.log("Issue created succesfully");
        }
      });
    })
    .put(function (req, res) {
      let projectUrl = req.params.project;
      if (!req.body._id) {
        return res.json({
          error: "missing _id",
        });
      }

      if (
        !req.body.issue_title &&
        !req.body.issue_text &&
        !req.body.created_by &&
        !req.body.assigned_to &&
        !req.body.status_text &&
        !req.body.open
      ) {
        return res.json({
          error: "no update field(s) sent",
          _id: req.body._id,
        });
      } else {
        const fieldsToUpdate = {};
        Object.keys(req.body).map((field) => {
          if (field !== "_id" && req.body[field] !== "") {
            fieldsToUpdate[field] = req.body[field];
            fieldsToUpdate.updated_on = new Date();
          }
        });
        const filter = { _id: req.body._id, project: projectUrl };
        Issue.findOneAndUpdate(filter, fieldsToUpdate, function (err, issue) {
          if (err) {
            return res.json({
              error: "could not update",
              _id: req.body._id,
            });
          } else {
            if (issue === null) {
              return res.json({
                error: "could not update",
                _id: req.body._id,
              });
            } else {
              return res.json({
                result: "successfully updated",
                _id: filter._id,
              });
            }
          }
        });
      }
    })

    .delete(function (req, res) {
      //console.log("deleting issue");
      let projectUrl = req.params.project;
      if (!req.body._id) {
        return res.json({
          error: "missing _id",
        });
      }
      const filter = { _id: req.body._id, project: projectUrl };
      Issue.deleteOne(filter, function (err, itemsDeleted) {
        if (err) {
          return res.json({
            error: "could not delete",
            _id: filter._id,
          });
        } else if (itemsDeleted.deletedCount === 0) {
          return res.json({
            error: "could not delete",
            _id: filter._id,
          });
        } else {
          return res.json({
            result: "successfully deleted",
            _id: filter._id,
          });
        }
      });
    });
};
