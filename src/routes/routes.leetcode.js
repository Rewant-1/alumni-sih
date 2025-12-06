const express = require("express");
const router = express.Router();
const leetcodeController = require("../controller/contoller.leetcode.js");

router.get("/:username", leetcodeController.getProfile);
router.get("/:username/badges", leetcodeController.getBadges);
router.get("/:username/solved", leetcodeController.getSolved);
router.get("/:username/contest", leetcodeController.getContest);
router.get("/:username/contest/history", leetcodeController.getContestHistory);
router.get("/:username/submission", leetcodeController.getSubmissions);
router.get("/:username/acSubmission", leetcodeController.getAcceptedSubmissions);
router.get("/:username/calendar", leetcodeController.getCalendar);

module.exports = router;
