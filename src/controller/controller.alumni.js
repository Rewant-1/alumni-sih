const UserModel = require("../model/model.user.js");
const AlumniModel = require("../model/model.alumni.js");

const getAlumni = async (req, res) => {
    try {
        const collegeId = req.admin?.id || req.user?.collegeId;
        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: "College ID is required to fetch students.",
            });
        }
        const queryCondition = {
            userType: "Alumni",
            collegeId: collegeId,
        };

        if (req.query.search) {
            queryCondition.name = { $regex: req.query.search, $options: "i" };
        }

        const alumni = await UserModel.find(queryCondition)
            .populate("profileDetails")
            .select("-passwordHash")
            .lean();

        if (!alumni || alumni.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No alumni found" });
        }

        if (req.query.keys) {
            const keysArray = req.query.keys.split(",");

            const filteredAlumni = alumni.map((alumnus) => {
                const filteredData = {};
                keysArray.forEach((key) => {
                    if (alumnus[key] !== undefined) {
                        filteredData[key] = alumnus[key];
                    } else if (
                        alumnus.profileDetails &&
                        alumnus.profileDetails[key] !== undefined
                    ) {
                        filteredData[key] = alumnus.profileDetails[key];
                    }
                });
                return filteredData;
            });

            return res
                .status(200)
                .json({ success: true, data: filteredAlumni });
        }

        return res.status(200).json({ success: true, data: alumni });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAlumniById = async (req, res) => {
    try {
        const id = req.params.id;
        const alumni = await UserModel.findById(id)
            .populate("profileDetails")
            .select("-passwordHash")
            .lean();
        if (alumni) {
            return res.status(200).json({ success: true, data: alumni });
        } else {
            return res
                .status(404)
                .json({ success: false, message: "Alumni not found" });
        }
    } catch (error) {
        console.error("Error fetching alumni by ID:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateAlumni = async (req, res) => {
        const { id } = req.params;

    try {
        const isSelf = req.user && req.user.userId === id;

        if (!isSelf) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this alumni.",
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
            updatedProfile = await AlumniModel.findByIdAndUpdate(
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
            message: "Alumni updated successfully",
            data: responseData,
        });
    } catch (error) {
        console.error("Error updating alumni:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAlumni,
    getAlumniById,
    updateAlumni,
};
