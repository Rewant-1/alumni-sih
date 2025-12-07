const express = require("express");
const router = express.Router();
const ConnectionController = require("../controller/controller.connection.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");

// Frontend-compatible endpoints
router.post("/request", authenticateToken, checkRole("Student"), ConnectionController.sendRequest);
router.post("/requests/:id/accept", authenticateToken, checkRole("Alumni"), ConnectionController.acceptRequest);
router.post("/requests/:id/reject", authenticateToken, checkRole("Alumni"), ConnectionController.rejectRequest);
router.get("/requests/pending", authenticateToken, checkRole("Alumni"), ConnectionController.getPendingRequests);
router.get("/connections", authenticateToken, ConnectionController.getConnections);
router.delete("/:id", authenticateToken, ConnectionController.removeConnection);

module.exports = router;