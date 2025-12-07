const UserModel = require("../model/model.user");
const AlumniModel = require("../model/model.alumni");
const { sendForbidden, sendUnauthorized } = require("../../utils/response");

/**
 * Middleware to ensure user has college context
 * Adds collegeId/adminId to request object for use in controllers
 * Supports both collegeId and adminId for backward compatibility
 */
const ensureSameCollege = async (req, res, next) => {
    try {
        // Support both collegeId and adminId (adminId is the college identifier)
        const userCollegeId = req.user?.collegeId || req.user?.adminId;
        
        if (!userCollegeId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No college ID found"
            });
        }
        
        // Add both for backward compatibility
        req.collegeId = userCollegeId;
        req.adminId = userCollegeId;
        next();
    } catch (error) {
        console.error("Error in ensureSameCollege middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Middleware to validate that a resource belongs to user's college
 * Used after fetching a resource to ensure cross-college access is denied
 * 
 * @param {Object} resource - The resource object to validate
 * @param {String} collegeFieldName - Name of the college field (default: 'collegeId')
 */
const validateResourceCollege = (resource, collegeFieldName = 'collegeId') => {
    return (req, res, next) => {
        try {
            const userCollegeId = req.collegeId || req.user?.collegeId;
            const resourceCollegeId = resource[collegeFieldName];
            
            if (!resourceCollegeId) {
                return sendForbidden(res, "Resource does not have college information");
            }
            
            if (resourceCollegeId.toString() !== userCollegeId.toString()) {
                return sendForbidden(res, "Access denied: Resource belongs to different college");
            }
            
            next();
        } catch (error) {
            console.error("Error in validateResourceCollege middleware:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};

/**
 * Utility function to validate if two users belong to same college
 * Use in controllers before establishing relationships
 * 
 * @param {String} userId1 - First user ID
 * @param {String} userId2 - Second user ID
 * @returns {Promise<Boolean>} - True if same college, false otherwise
 */
const areSameCollege = async (userId1, userId2) => {
    try {
        const user1 = await UserModel.findById(userId1).select('collegeId');
        const user2 = await UserModel.findById(userId2).select('collegeId');
        
        if (!user1 || !user2) {
            return false;
        }
        
        if (!user1.collegeId || !user2.collegeId) {
            return false;
        }
        
        return user1.collegeId.toString() === user2.collegeId.toString();
    } catch (error) {
        console.error("Error in areSameCollege:", error);
        return false;
    }
};

/**
 * Get collegeId from userId
 * @param {String} userId - User ID
 * @returns {Promise<String|null>} - CollegeId or null
 */
const getCollegeIdFromUser = async (userId) => {
    try {
        const user = await UserModel.findById(userId).select('collegeId');
        return user?.collegeId || null;
    } catch (error) {
        console.error("Error in getCollegeIdFromUser:", error);
        return null;
    }
};

/**
 * Validate alumni belongs to user's college
 * @param {String} alumniId - Alumni profile ID (not userId)
 * @param {String} userCollegeId - User's college ID (or adminId)
 * @returns {Promise<Boolean>}
 */
const validateAlumniCollege = async (alumniId, userCollegeId) => {
    try {
        const alumni = await AlumniModel.findById(alumniId).populate('userId', 'collegeId');
        
        if (!alumni || !alumni.userId) {
            return false;
        }
        
        // Support both collegeId and adminId
        const alumniCollegeId = alumni.userId.collegeId || alumni.userId.adminId;
        return alumniCollegeId && alumniCollegeId.toString() === userCollegeId.toString();
    } catch (error) {
        console.error("Error in validateAlumniCollege:", error);
        return false;
    }
};

module.exports = {
    ensureSameCollege,
    validateResourceCollege,
    areSameCollege,
    getCollegeIdFromUser,
    validateAlumniCollege
};
