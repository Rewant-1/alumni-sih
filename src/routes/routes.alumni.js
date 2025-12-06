const express = require("express");
const router = express.Router();
const alumniController = require("../controller/controller.alumni.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

// Get all alumni (with filters)
router.get(
    "/",
    AuthMiddleware.internalAuth(false),
    AuthMiddleware.authenticateToken,
    alumniController.getAlumni
);

// Get current user's profile
router.get(
    "/me",
    AuthMiddleware.authenticateToken,
    alumniController.getMyProfile
);

// Get alumni for map view
router.get(
    "/map",
    AuthMiddleware.authenticateToken,
    alumniController.getAlumniForMap
);

// Get connection suggestions (AI)
router.get(
    "/suggestions",
    AuthMiddleware.authenticateToken,
    alumniController.getConnectionSuggestions
);

// Get profile analysis (AI)
router.get(
    "/analyze",
    AuthMiddleware.authenticateToken,
    alumniController.analyzeProfile
);

// Chat with AI assistant
router.post(
    "/chat",
    AuthMiddleware.authenticateToken,
    alumniController.chatWithAI
);

// Get alumni by ID
router.get(
    "/:id",
    AuthMiddleware.internalAuth(false),
    AuthMiddleware.authenticateToken,
    alumniController.getAlumniById
);

// Update alumni profile
router.put(
    "/:id",
    AuthMiddleware.authenticateToken,
    alumniController.updateAlumni
);

// Update profile picture
router.post(
    "/profile-picture",
    AuthMiddleware.authenticateToken,
    alumniController.updateProfilePicture
);

// Add timeline entry
router.post(
    "/timeline",
    AuthMiddleware.authenticateToken,
    alumniController.addTimelineEntry
);

// Add experience
router.post(
    "/experience",
    AuthMiddleware.authenticateToken,
    alumniController.addExperience
);

// Add education
router.post(
    "/education",
    AuthMiddleware.authenticateToken,
    alumniController.addEducation
);

module.exports = router;
