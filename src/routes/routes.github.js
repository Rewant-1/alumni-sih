const express = require("express");
const router = express.Router();
const githubController = require("../controller/controller.github.js");

// GitHub OAuth flow
router.get("/auth", githubController.githubAuth);
router.get("/callback", githubController.githubAuthCallback);

// Public profile endpoints (no auth required)
router.get("/:username", githubController.getGithubProfile);
router.get("/:username/repos", githubController.getGithubRepos);

module.exports = router;
