const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    type: { type: String, enum: ["full-time", "internship"], required: true },
    isOpen: {
        type: Boolean,
        default: true,
        required: true,
    },
    draft: { type: Boolean, default: false },
    description: { type: String },
    skillsRequired: [{ type: String }],

    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
        required: true,
    },

    createdAt: { type: Date, default: Date.now },
});

const JobModel = mongoose.model("Job", jobSchema);

module.exports = JobModel;