const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    graduationYear: {
        type: Number,
        required: true,
    },
    degreeUrl: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
    },
    designation: {
        type: String,
    },
    company: {
        type: String,
    },
    location: {
        type: String,
    },
    phone: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    branch: {
        type: String,
    },
    completion_percent: {
        type: Number,
        default: 0,
    },
});

const AlumniModel = mongoose.model("Alumni", alumniSchema);

module.exports = AlumniModel;
