const express = require("express");
const router = express.Router();
const alumniController = require("../controller/controller.alumni.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

router.get(
    "/",
    AuthMiddleware.internalAuth(false),
    AuthMiddleware.authenticateToken,
    alumniController.getAlumni
);
router.get(
    "/:id",
    AuthMiddleware.internalAuth(false),
    AuthMiddleware.authenticateToken,
    alumniController.getAlumniById
);
router.put(
    "/:id",
    AuthMiddleware.authenticateToken,
    alumniController.updateAlumni
);

module.exports = router;
