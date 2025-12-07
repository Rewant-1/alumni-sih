const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    
    // College isolation - both users must be from same college
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true,
        index: true
    },
    
    connectionDate: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date }
});

// Indexes for efficient queries
connectionSchema.index({ studentId: 1, alumniId: 1 }, { unique: true });
connectionSchema.index({ collegeId: 1, status: 1 });
connectionSchema.index({ alumniId: 1, status: 1 });
connectionSchema.index({ studentId: 1, status: 1 });

const ConnectionModel = mongoose.model("Connection", connectionSchema);

module.exports = ConnectionModel;
