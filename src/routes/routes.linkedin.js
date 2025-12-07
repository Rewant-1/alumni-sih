const router = require("express").Router();
const linkedinController = require("../controller/controller.linkedin.js");

// LinkedIn OAuth flow
router.get("/auth", linkedinController.getAuth);
router.get("/callback", linkedinController.getAccessToken);

// Profile endpoint (requires access token in Authorization header)
router.get("/userinfo", linkedinController.getMe);

module.exports = router;
