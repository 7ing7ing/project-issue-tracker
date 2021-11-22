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
      const queryParams = req.query;

      Issue.find(queryParams, function (err, issues) {
        if (err) {
          console.log(err);
        } else {
          res.json(issues);
        }
      });
    })

    .post(function (req, res) {
      const project = req.body;

      if (!project.issue_title || !project.issue_text || !project.created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      //console.log("creating new issue");

      const userId = ObjectID();
      const newIssue = new Issue({
        issue_title: project.issue_title,
        issue_text: project.issue_text,
        created_by: project.created_by,
        assigned_to: project.assigned_to,
        status_text: project.status_text,
        _id: userId,
      });

      res.send(newIssue);

      newIssue.save(function (err, user) {
        if (err) return console.log(err);
        console.log("Issue created succesfully");
      });
    })
    .put(function (req, res) {
      if (!req.body._id) {
        return res.json({
          error: "missing _id",
        });
      }
      //console.log("updating issue");
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
        });
      } else {
        const fieldsToUpdate = {};
        Object.keys(req.body).map((field) => {
          if (field !== "_id" && req.body[field] !== "") {
            fieldsToUpdate[field] = req.body[field];
            fieldsToUpdate.updated_on = new Date();
          }
        });
        const id = { _id: req.body._id };
        Issue.findOneAndUpdate(id, fieldsToUpdate, function (err, issue) {
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
                result: "succesfully updated",
                _id: id._id,
              });
            }
          }
        });
      }
    })

    .delete(function (req, res) {
      //console.log("deleting issue");
      const id = { _id: req.body._id };
      Issue.deleteOne(id, function (err, itemsDeleted) {
        if (err) {
          return res.json({
            error: "could not delete",
            _id: id._id,
          });
        } else if (itemsDeleted.deletedCount === 0) {
          return res.json({
            error: "could not delete",
            _id: id._id,
          });
        } else {
          return res.json({
            result: "succesfully deleted",
            _id: id._id,
          });
        }
      });
    });
};
