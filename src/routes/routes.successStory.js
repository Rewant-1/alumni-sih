const express = require("express");
const SuccessStoryController = require("../controller/controller.successStory");
const AuthMiddleware = require("../middleware/middleware.auth");

const router = express.Router();

// Public routes
router.get("/", SuccessStoryController.getStories);
router.get("/:idOrSlug", SuccessStoryController.getStory);

// Protected routes
router.post("/", AuthMiddleware.authenticateToken, SuccessStoryController.submitStory);
router.post("/draft", AuthMiddleware.authenticateToken, SuccessStoryController.saveAsDraft);
router.put("/draft/:id", AuthMiddleware.authenticateToken, SuccessStoryController.saveAsDraft);
router.get("/my/drafts", AuthMiddleware.authenticateToken, SuccessStoryController.getMyDrafts);
router.get("/my/published", AuthMiddleware.authenticateToken, SuccessStoryController.getMyStories);
router.post("/:id/like", AuthMiddleware.authenticateToken, SuccessStoryController.likeStory);
router.post("/:id/comment", AuthMiddleware.authenticateToken, SuccessStoryController.commentOnStory);
router.post("/:id/submit", AuthMiddleware.authenticateToken, SuccessStoryController.submitDraftForApproval);
router.delete("/:id", AuthMiddleware.authenticateToken, SuccessStoryController.deleteDraft);

module.exports = router;
