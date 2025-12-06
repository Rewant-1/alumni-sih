const express = require("express");
const NotificationController = require("../controller/controller.notification");
const AuthMiddleware = require("../middleware/middleware.auth");

const router = express.Router();

router.get("/", AuthMiddleware.authenticateToken, NotificationController.getNotifications);
router.get("/unread-count", AuthMiddleware.authenticateToken, NotificationController.getUnreadCount);
router.put("/:id/read", AuthMiddleware.authenticateToken, NotificationController.markAsRead);
router.put("/read-all", AuthMiddleware.authenticateToken, NotificationController.markAllAsRead);

module.exports = router;
