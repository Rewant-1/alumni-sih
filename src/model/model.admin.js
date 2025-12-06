const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({}, { strict: false });

const AdminModel = mongoose.model("admins", adminSchema, "admins");

module.exports = AdminModel;