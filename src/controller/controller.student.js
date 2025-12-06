// const StudentService = require("../service/service.student.js");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user.js");
const studentModel = require("../model/model.student.js");
require("../model/model.admin.js");

const getStudents = async (req, res) => {
    try {
        const collegeId = req.admin?.id || req.user?.collegeId;
        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: "College ID is required to fetch students.",
            });
        }
        const queryCondition = {
            userType: "Student",
            collegeId: collegeId,
        };

        if (req.query.search) {
            queryCondition.name = { $regex: req.query.search, $options: "i" };
        }

        const students = await UserModel.find(queryCondition)
            .populate("profileDetails")
            .select("-passwordHash")
            .lean();

        if (!students || students.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No students found" });
        }

        if (req.query.keys) {
            const keysArray = req.query.keys.split(",");

            const filteredStudents = students.map((student) => {
                const filteredData = {};
                keysArray.forEach((key) => {
                    if (student[key] !== undefined) {
                        filteredData[key] = student[key];
                    } else if (
                        student.profileDetails &&
                        student.profileDetails[key] !== undefined
                    ) {
                        filteredData[key] = student.profileDetails[key];
                    }
                });
                return filteredData;
            });

            return res
                .status(200)
                .json({ success: true, data: filteredStudents });
        }

        return res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await UserModel.findById(id)
            .populate("profileDetails")
            .select("-passwordHash")
            .lean();
        if (student) {
            return res.status(200).json({ success: true, data: student });
        } else {
            return res
                .status(404)
                .json({ success: false, message: "Student not found" });
        }
    } catch (error) {
        console.error("Error fetching student by ID:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const isAdmin = !!req.admin;
        const isSelf = req.user && req.user.userId === id;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this student.",
            });
        }

        const user = await UserModel.findById(id)
            .populate("profileDetails")
            .lean();
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        if(req.admin.id !== user.collegeId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this student.",
            });
        }

        const { name, email, profileDetails } = req.body;

        const userUpdates = {};
        if (name) userUpdates.name = name;
        if (email) userUpdates.email = email;

        let updatedUser = user;
        if (Object.keys(userUpdates).length > 0) {
            updatedUser = await UserModel.findByIdAndUpdate(
                id,
                { $set: userUpdates },
                { new: true }
            );
        }

        let updatedProfile = null;
        if (Object.keys(profileDetails).length > 0 && user.profileDetails) {
            updatedProfile = await studentModel.findByIdAndUpdate(
                user.profileDetails,
                { $set: profileDetails },
                { new: true }
            );
        }

        const responseData = {
            ...updatedUser.toObject(),
            profileDetails: updatedProfile || user.profileDetails,
        };

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: responseData,
        });
    } catch (error) {
        console.error("Error updating student:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createStudents = async (req, res) => {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid request body: 'students' must be a non-empty array",
        });
    }

    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        const createdStudents = [];

        for (const studentData of students) {
            if (
                !studentData.name ||
                !studentData.email ||
                !studentData.password ||
                !studentData.academic?.degreeType ||
                !studentData.academic?.degreeName
            ) {
                throw new Error(
                    `Missing fields for student: ${
                        studentData.email || "Unknown"
                    }`
                );
            }

            const existingUser = await UserModel.findOne({
                email: studentData.email,
            }).session(session);
            if (existingUser) {
                throw new Error(`User already exists: ${studentData.email}`);
            }

            const hashedPassword = await bcrypt.hash(studentData.password, 10);

            const [user] = await UserModel.create(
                [
                    {
                        name: studentData.name,
                        email: studentData.email,
                        passwordHash: hashedPassword,
                        collegeId: req.admin.id,
                        userType: "Student",
                    },
                ],
                { session }
            );

            const [student] = await studentModel.create(
                [
                    {
                        userId: user._id,
                        academic: studentData.academic,
                    },
                ],
                { session }
            );

            user.profileDetails = student._id;
            await user.save({ session });
            createdStudents.push(user);
        }
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "All students created successfully",
            data: createdStudents,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction Aborted:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getStudents,
    getStudentById,
    updateStudent,
    createStudents,
};
