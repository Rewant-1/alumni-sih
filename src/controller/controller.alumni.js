const UserModel = require("../model/model.user.js");
const AlumniModel = require("../model/model.alumni.js");
const ActivityModel = require("../model/model.activity.js");
const cloudinaryService = require("../service/service.cloudinary.js");
const geminiService = require("../service/service.gemini.js");

/**
 * Get all alumni with enhanced filtering
 */
const getAlumni = async (req, res) => {
    try {
        const collegeId = req.admin?.id || req.user?.collegeId;
        const {
            page = 1,
            limit = 20,
            search,
            department,
            graduationYear,
            batch,
            city,
            verified,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query for User model
        const userQuery = {
            userType: "Alumni"
        };

        if (collegeId) {
            userQuery.collegeId = collegeId;
        }

        if (search) {
            userQuery.name = { $regex: search, $options: "i" };
        }

        // Get users first
        const users = await UserModel.find(userQuery)
            .select('_id name email profileDetails')
            .lean();

        const userIds = users.map(u => u._id);

        // Build alumni query
        const alumniQuery = { userId: { $in: userIds } };

        if (department) alumniQuery.department = department;
        if (graduationYear) alumniQuery.graduationYear = parseInt(graduationYear);
        if (batch) alumniQuery.graduationYear = parseInt(batch);
        if (city) alumniQuery['location.city'] = { $regex: city, $options: 'i' };
        if (verified !== undefined) alumniQuery.verified = verified === 'true';

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const alumni = await AlumniModel.find(alumniQuery)
            .populate('userId', 'name email')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await AlumniModel.countDocuments(alumniQuery);

        return res.status(200).json({
            success: true,
            data: alumni,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get alumni by ID with full profile
 */
const getAlumniById = async (req, res) => {
    try {
        const { id } = req.params;

        const alumni = await AlumniModel.findById(id)
            .populate('userId', 'name email createdAt')
            .lean();

        if (!alumni) {
            // Try finding by userId
            const alumniByUser = await AlumniModel.findOne({ userId: id })
                .populate('userId', 'name email createdAt')
                .lean();

            if (!alumniByUser) {
                return res.status(404).json({
                    success: false,
                    message: "Alumni not found"
                });
            }

            // Increment profile views
            await AlumniModel.findByIdAndUpdate(alumniByUser._id, {
                $inc: { profileViews: 1 }
            });

            return res.status(200).json({ success: true, data: alumniByUser });
        }

        // Increment profile views
        await AlumniModel.findByIdAndUpdate(alumni._id, {
            $inc: { profileViews: 1 }
        });

        return res.status(200).json({ success: true, data: alumni });
    } catch (error) {
        console.error("Error fetching alumni by ID:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get current user's alumni profile
 */
const getMyProfile = async (req, res) => {
    try {
        const alumni = await AlumniModel.findOne({ userId: req.user._id })
            .populate('userId', 'name email createdAt')
            .lean();

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        return res.status(200).json({ success: true, data: alumni });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update alumni profile
 */
const updateAlumni = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if updating own profile
        const alumni = await AlumniModel.findById(id);

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni not found"
            });
        }

        if (alumni.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this profile"
            });
        }

        const allowedUpdates = [
            'bio', 'headline', 'skills', 'socialLinks',
            'experience', 'education', 'timeline', 'location',
            'department', 'degree', 'privacySettings'
        ];

        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedAlumni = await AlumniModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate('userId', 'name email');

        // Log activity
        await ActivityModel.logActivity({
            userId: req.user._id,
            type: 'profile_updated',
            title: 'Updated profile',
            referenceId: alumni._id,
            referenceModel: 'Alumni'
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedAlumni
        });
    } catch (error) {
        console.error("Error updating alumni:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update profile picture
 */
const updateProfilePicture = async (req, res) => {
    try {
        const { image } = req.body; // Base64 image

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        const uploadResult = await cloudinaryService.uploadProfilePicture(
            image,
            req.user._id.toString()
        );

        if (!uploadResult.success) {
            return res.status(400).json({
                success: false,
                message: "Image upload failed",
                error: uploadResult.error
            });
        }

        alumni.photo = uploadResult.url;
        await alumni.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture updated",
            data: { photo: uploadResult.url }
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add timeline entry
 */
const addTimelineEntry = async (req, res) => {
    try {
        const { type, title, organization, startDate, endDate, description } = req.body;

        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        alumni.timeline.push({
            type,
            title,
            organization,
            startDate,
            endDate,
            description
        });

        await alumni.save();

        return res.status(201).json({
            success: true,
            message: "Timeline entry added",
            data: alumni.timeline[alumni.timeline.length - 1]
        });
    } catch (error) {
        console.error("Error adding timeline entry:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add experience
 */
const addExperience = async (req, res) => {
    try {
        const experienceData = req.body;

        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        alumni.experience.push(experienceData);
        await alumni.save();

        return res.status(201).json({
            success: true,
            message: "Experience added",
            data: alumni.experience[alumni.experience.length - 1]
        });
    } catch (error) {
        console.error("Error adding experience:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add education
 */
const addEducation = async (req, res) => {
    try {
        const educationData = req.body;

        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        alumni.education.push(educationData);
        await alumni.save();

        return res.status(201).json({
            success: true,
            message: "Education added",
            data: alumni.education[alumni.education.length - 1]
        });
    } catch (error) {
        console.error("Error adding education:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get alumni for map view (with coordinates)
 */
const getAlumniForMap = async (req, res) => {
    try {
        const { city, state, country } = req.query;

        const query = {
            'location.coordinates.lat': { $exists: true },
            'location.coordinates.lng': { $exists: true }
        };

        if (city) query['location.city'] = { $regex: city, $options: 'i' };
        if (state) query['location.state'] = { $regex: state, $options: 'i' };
        if (country) query['location.country'] = { $regex: country, $options: 'i' };

        const alumni = await AlumniModel.find(query)
            .populate('userId', 'name')
            .select('photo headline location graduationYear department userId')
            .limit(500) // Limit for performance
            .lean();

        return res.status(200).json({
            success: true,
            data: alumni
        });
    } catch (error) {
        console.error("Error fetching map data:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get AI-powered connection suggestions
 */
const getConnectionSuggestions = async (req, res) => {
    try {
        const alumni = await AlumniModel.findOne({ userId: req.user._id })
            .populate('userId', 'name')
            .lean();

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        // Get other alumni
        const otherAlumni = await AlumniModel.find({
            userId: { $ne: req.user._id }
        })
            .populate('userId', 'name')
            .select('skills department graduationYear headline location')
            .limit(50)
            .lean();

        // Get AI suggestions
        const suggestions = await geminiService.suggestConnections(
            alumni,
            otherAlumni
        );

        return res.status(200).json({
            success: true,
            data: suggestions.success ? suggestions.suggestions : otherAlumni.slice(0, 5)
        });
    } catch (error) {
        console.error("Error getting suggestions:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Chat with AI assistant
 */
const chatWithAI = async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const alumni = await AlumniModel.findOne({ userId: req.user._id })
            .populate('userId', 'name')
            .lean();

        const response = await geminiService.chatWithAlumniAssistant(message, {
            ...context,
            userProfile: alumni
        });

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error("Error with AI chat:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get profile analysis from AI
 */
const analyzeProfile = async (req, res) => {
    try {
        const alumni = await AlumniModel.findOne({ userId: req.user._id })
            .populate('userId', 'name')
            .lean();

        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        const analysis = await geminiService.analyzeProfile(alumni);

        return res.status(200).json({
            success: true,
            data: analysis.success ? analysis.analysis : null
        });
    } catch (error) {
        console.error("Error analyzing profile:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAlumni,
    getAlumniById,
    getMyProfile,
    updateAlumni,
    updateProfilePicture,
    addTimelineEntry,
    addExperience,
    addEducation,
    getAlumniForMap,
    getConnectionSuggestions,
    chatWithAI,
    analyzeProfile
};
