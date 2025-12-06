const router = require("express").Router();
const linkedinController = require("../controller/controller.linkedin.js");

router.get("/auth", linkedinController.getAuth)
router.get("/callback", linkedinController.getAccessToken);
router.get("/userinfo", linkedinController.getMe);
module.exports = router;
