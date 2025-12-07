const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user");
const AlumniModel = require("../model/model.alumni");
const {
    sendSuccess,
    sendError,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
} = require("../../utils/response");

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
    // Debug: log incoming login attempts (only keys, never log full passwords in prod)
    try {
        console.log('Login attempt payload keys:', Object.keys(req.body));
        // Log email and masked password length to diagnose credential mismatches
        console.log('Login attempt:', { email: (email || null), passwordLength: password ? password.length : 0 });
    } catch (e) {
        // ignore
    }
    if (!email || !password) {
        return sendBadRequest(res, "Email and password are required.");
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return sendUnauthorized(res, "Invalid email or password.");
        }
        
        if (user.userType === "Alumni") {
            if (!user.profileDetails) {
                return sendForbidden(res, "Alumni profile not found.");
            }
            const alumni = await AlumniModel.findById(user.profileDetails);
            if (!alumni.verified) {
                return sendForbidden(res, "Alumni account not verified.");
            }
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return sendUnauthorized(res, "Invalid email or password.");
        }

        const token = jwt.sign(
            {
                userId: user._id,
                userType: user.userType,
                collegeId: user.collegeId,
                adminId: user.collegeId  // adminId is the college identifier
            },
            process.env.JWT_SECRET
        );
        
        return sendSuccess(res, { token }, "Login successful.");
    } catch (error) {
        console.error("Error logging in:", error);
        return sendError(res, "Internal server error.", 500, error.message);
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

const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }

        const user = await UserModel.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const alumni = user.profileDetails ? await AlumniModel.findById(user.profileDetails) : null;

        return sendSuccess(res, { user, alumni }, 'User fetched successfully.');
    } catch (error) {
        console.error('Error fetching current user:', error);
        return sendError(res, 'Internal server error.', 500, error.message);
    }
};

module.exports = {
    registerAlumni,
    login,
    verifyAlumni,
    getMe,
};
