const express = require("express");
const ActivityController = require("../controller/controller.activity");
const AuthMiddleware = require("../middleware/middleware.auth");

const router = express.Router();

router.get("/my", AuthMiddleware.authenticateToken, ActivityController.getMyActivities);
router.get("/summary", AuthMiddleware.authenticateToken, ActivityController.getActivitySummary);
router.get("/breakdown", AuthMiddleware.authenticateToken, ActivityController.getActivityBreakdown);
router.get("/leaderboard", AuthMiddleware.authenticateToken, ActivityController.getLeaderboard);
router.get("/user/:userId", AuthMiddleware.authenticateToken, ActivityController.getUserPublicActivities);

module.exports = router;
