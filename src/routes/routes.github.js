const express = require("express");
const router = express.Router();
const githubController = require("../controller/controller.github.js");

router.get("/auth", githubController.githubAuth);
router.get("/callback", githubController.githubAuthCallback);
router.get("/:username", githubController.getGithubProfile);

module.exports = router;