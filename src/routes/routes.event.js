const express = require("express");
const EventController = require("../controller/controller.event.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

const router = express.Router();

// Protected routes
router.post("/", AuthMiddleware.authenticateToken, EventController.createEvent);
router.get("/", AuthMiddleware.authenticateToken, EventController.getEvents);
router.get("/my", AuthMiddleware.authenticateToken, EventController.getMyEvents);
router.get("/:id", AuthMiddleware.authenticateToken, EventController.getEventById);
router.post("/:id/register", AuthMiddleware.authenticateToken, EventController.registerForEvent);
router.put("/:id", AuthMiddleware.authenticateToken, EventController.updateEvent);
router.delete("/:id", AuthMiddleware.authenticateToken, EventController.deleteEvent);

module.exports = router;
