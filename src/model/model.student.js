const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Academic Info
    academic: {
        entryDate: { type: Date, default: Date.now },
        expectedGraduationDate: { type: Date },
        degreeType: {
            type: String,
            required: true,
        },
        degreeName: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completionDate: { type: Date },
        currentYear: { type: Number, default: 1 },
    },

    // Student Identity (from reference)
    student_id: { type: String, unique: true, sparse: true },
    name: { type: String },
    branch: { type: String },
    year: { type: Number },
    cgpa: { type: Number },

    // Skills & Interests (from reference)
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    career_goal: { type: String },
    skills_to_learn: { type: [String], default: [] },
});

const StudentModel = mongoose.model("Student", studentSchema);

module.exports = StudentModel;
