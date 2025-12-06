const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
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
    student_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    branch: { type: String },
    year: { type: Number },
    cgpa: { type: Number },
    skills: { type: [String] },
    interests: { type: [String] },
    career_goal: { type: String },
    skills_to_learn: { type: [String] },
});

const StudentModel = mongoose.model("Student", studentSchema);

module.exports = StudentModel;
   