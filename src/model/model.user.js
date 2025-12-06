const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    userType: { type: String, enum: ["student", "alumni"], required: true },
    profileDetails: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "userType",
    },
    createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
