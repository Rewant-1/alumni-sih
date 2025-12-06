const express = require("express");
const JobController = require("../controller/controller.job.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

const router = express.Router();

router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.createJob);
router.get("/", AuthMiddleware.authenticateToken, JobController.getJobs);
router.get("/my/posted", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.getMyPostedJobs);
router.get("/my/applications", AuthMiddleware.authenticateToken, JobController.getMyApplications);
router.get("/my/referrals", AuthMiddleware.authenticateToken, JobController.getMyReferrals);
router.get("/:id", AuthMiddleware.authenticateToken, JobController.getJobById);
router.post("/:id/request-referral", AuthMiddleware.authenticateToken, JobController.requestReferral);
router.post("/:id/provide-referral", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.provideReferral);
router.post("/:id/apply", AuthMiddleware.authenticateToken, JobController.applyToJob);
router.put("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.updateJob);
router.delete("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.deleteJob);
router.put("/close-applications/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.closeJobApplications);

module.exports = router;
