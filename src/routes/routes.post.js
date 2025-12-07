const express = require("express");
const PostController = require("../controller/controller.post.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");
const { ensureSameCollege } = require("../middleware/middleware.collegeIsolation.js");

const router = express.Router();

// All routes require authentication and college isolation
router.use(AuthMiddleware.authenticateToken);
router.use(ensureSameCollege);

// Post routes
router.post("/", PostController.createPost);
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", PostController.updatePost);
router.delete("/:id", PostController.deletePost);
router.post("/:id/like", PostController.likePost);
router.post("/:id/comment", PostController.commentOnPost);

module.exports = router;
