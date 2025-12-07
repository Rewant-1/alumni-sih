const ConnectionModel = require("../model/model.connections.js");
const AlumniModel = require("../model/model.alumni.js");
const UserModel = require("../model/model.user.js");
const { validateAlumniCollege } = require("../middleware/middleware.collegeIsolation.js");

const sendRequest = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const userCollegeId = req.user.collegeId;
        // frontend may send { userId, message } where userId is the alumni id
        const alumniId = req.body.alumniId || req.body.userId;
        const message = req.body.message;

        if (!alumniId) {
            return res.status(400).json({
                success: false,
                message: "Alumni ID is required.",
            });
        }
        
        // Validate alumni exists
        const alumni = await AlumniModel.findById(alumniId).populate('userId', 'collegeId');
        if (!alumni || !alumni.userId) {
            return res.status(404).json({
                success: false,
                message: "Alumni not found.",
            });
        }
        
        // CRITICAL: Validate both are from same college
        if (alumni.userId.collegeId.toString() !== userCollegeId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Cannot connect with alumni from different college.",
            });
        }
        
        const existingConnection = await ConnectionModel.findOne({
            studentId,
            alumniId,
        });
        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: "Connection already exists.",
            });
        }
        
        const connection = new ConnectionModel({
            studentId,
            alumniId,
            collegeId: userCollegeId
        });
        await connection.save();
        
        res.status(201).json({
            success: true,
            message: "Connection request sent successfully.",
            data: {
                id: connection._id,
                from: { id: studentId },
                to: { id: alumniId },
                message: message || null,
            }
        });
    } catch (error) {
        console.error("Error sending connection request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const alumniId = req.user.userId;
        const userCollegeId = req.user.collegeId;
        // support param id from frontend: POST /requests/:id/accept
        const connectionId = req.params.id || req.body.connectionId;
        if (!connectionId) {
            return res.status(400).json({ success: false, message: "Connection ID is required." });
        }
        
        // Validate connection belongs to user's college
        const connection = await ConnectionModel.findOne({
            _id: connectionId,
            collegeId: userCollegeId
        });
        
        if (!connection || connection.alumniId.toString() !== alumniId) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found or access denied.",
            });
        }
        
        connection.status = "accepted";
        connection.acceptedAt = new Date();
        await connection.save();
        
        // Populate and return the created connection-like object
        await connection.populate('studentId', 'name email');
        res.status(200).json({
            success: true,
            message: "Connection request accepted successfully.",
            data: {
                id: connection._id,
                user: {
                    id: connection.studentId._id,
                    name: connection.studentId.name,
                    email: connection.studentId.email
                }
            }
        });
    } catch (error) {
        console.error("Error accepting connection request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const alumniId = req.user.userId;
        const userCollegeId = req.user.collegeId;
        const connectionId = req.params.id || req.body.connectionId;
        if (!connectionId) {
            return res.status(400).json({ success: false, message: "Connection ID is required." });
        }
        
        // Validate connection belongs to user's college
        const connection = await ConnectionModel.findOne({
            _id: connectionId,
            collegeId: userCollegeId
        });
        
        if (!connection || connection.alumniId.toString() !== alumniId) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found or access denied.",
            });
        }
        
        connection.status = "rejected";
        connection.rejectedAt = new Date();
        await connection.save();
        
        res.status(200).json({ success: true, message: "Connection request rejected successfully." });
    } catch (error) {
        console.error("Error rejecting connection request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const getConnections = async (req, res) => {
    try {
        const { studentId, alumniId } = req.query;
        const { userId, userType, collegeId } = req.user;
        
        // Base filter with college isolation
        const filter = {
            collegeId: collegeId
        };
        
        // Add user-specific filter
        if (userType === "Student") {
            filter.studentId = userId;
        } else {
            filter.alumniId = userId;
        }
        
        // Optional additional filters
        if (studentId) {
            filter.studentId = studentId;
        }
        if (alumniId) {
            filter.alumniId = alumniId;
        }
        
        const connections = await ConnectionModel.find(filter)
            .populate('studentId', 'name email')
            .populate('alumniId', 'graduationYear');
            
        res.status(200).json({
            success: true,
            message: "Connections fetched successfully",
            data: connections,
        });
    } catch (error) {
        console.error("Error getting connections:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const removeConnection = async (req, res) => {
    try {
        // support DELETE /connections/:id
        const connectionId = req.params.id || req.body.connectionId;
        if (!connectionId) return res.status(400).json({ success: false, message: "Connection ID is required." });
        const connection = await ConnectionModel.findById(connectionId);
        if (!connection) return res.status(404).json({ success: false, message: "Connection not found." });
        await ConnectionModel.findByIdAndDelete(connectionId);
        res.status(200).json({ success: true, message: "Connection removed successfully." });
    } catch (error) {
        console.error("Error removing connection:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Return pending requests for an alumni (requests where alumniId == userId && status == 'pending')
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const collegeId = req.user.collegeId;
        const requests = await ConnectionModel.find({ alumniId: userId, collegeId, status: 'pending' })
            .populate('studentId', 'name email avatarUrl')
            .lean();

        const mapped = requests.map(r => ({
            id: r._id,
            from: {
                id: r.studentId._id,
                name: r.studentId.name,
                email: r.studentId.email,
                avatarUrl: r.studentId.avatarUrl || null
            },
            createdAt: r.connectionDate || r._id.getTimestamp(),
        }));

        return res.status(200).json({ success: true, data: mapped });
    } catch (error) {
        console.error('Error fetching pending connection requests:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    sendRequest,
    acceptRequest,
    rejectRequest,
    getConnections,
    removeConnection,
    getPendingRequests,
};
