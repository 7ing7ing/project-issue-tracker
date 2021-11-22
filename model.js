const mongoose = require("mongoose");
const { Schema } = mongoose;

const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  created_on: { type: Date, default: new Date() },
  updated_on: { type: Date, default: new Date() },
  open: { type: Boolean, default: true },
  _id: String,
  project: { type: String, required: true },
});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
