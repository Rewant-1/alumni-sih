const express = require("express");
const router = express.Router();
const studentController = require("../controller/controller.student.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

router.get("/", AuthMiddleware.internalAuth(false), AuthMiddleware.authenticateToken, studentController.getStudents);
router.get("/:id", AuthMiddleware.internalAuth(false), AuthMiddleware.authenticateToken, studentController.getStudentById);
router.put("/:id", AuthMiddleware.internalAuth(false), AuthMiddleware.authenticateToken, studentController.updateStudent);
router.post("/bulk-create", AuthMiddleware.internalAuth(true), studentController.createStudents);

module.exports = router;