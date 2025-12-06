const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user");
const AlumniModel = require("../model/model.alumni");

const registerAlumni = async (req, res) => {
    const { name, email, password, graduationYear, degreeUrl, collegeId } =
        req.body;
    if (
        !name ||
        !email ||
        !password ||
        !graduationYear ||
        !degreeUrl ||
        !collegeId
    ) {
        return res
            .status(400)
            .json({ success: false, error: "All fields are required." });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            name,
            email,
            passwordHash: hashedPassword,
            collegeId,
            userType: "Alumni",
        });
        await user.save({ session });

        const alumni = new AlumniModel({
            userId: user._id,
            graduationYear,
            degreeUrl,
        });
        await alumni.save({ session });

        user.profileDetails = alumni._id;
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            data: null,
            message: "Alumni registered successfully.",
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error registering alumni:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error.",
        });
    } finally {
        session.endSession();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({
                success: false,
                error: "Email and password are required.",
            });
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid email or password." });
        }
        if (user.userType === "Alumni") {
            if (!user.profileDetails) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        error: "Alumni profile not found.",
                    });
            }
            const alumni = await AlumniModel.findById(user.profileDetails);
            if (!alumni.verified) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        error: "Alumni account not verified.",
                    });
            }
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid email or password." });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                userType: user.userType,
                collegeId: user.collegeId,
            },
            process.env.JWT_SECRET
        );
        res.status(200).json({
            success: true,
            data: { token },
            message: "Login successful.",
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error.",
        });
    }
};

const verifyAlumni = async (req, res) => {
    const { alumniId } = req.params;

    try {
        const alumni = await AlumniModel.findById(alumniId);
        if (!alumni) {
            return res
                .status(404)
                .json({ success: false, error: "Alumni not found." });
        }

        alumni.verified = true;
        await alumni.save();

        res.status(200).json({
            success: true,
            data: null,
            message: "Alumni verified successfully.",
        });
    } catch (error) {
        console.error("Error verifying alumni:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error.",
        });
    }
};

module.exports = {
    registerAlumni,
    login,
    verifyAlumni,
};
