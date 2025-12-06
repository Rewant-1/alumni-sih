const express = require("express");
const CampaignController = require("../controller/controller.campaign");
const DonationController = require("../controller/controller.donation");
const AuthMiddleware = require("../middleware/middleware.auth");

const router = express.Router();

// Campaign routes
router.get("/", AuthMiddleware.authenticateToken, CampaignController.getCampaigns);
router.get("/my", AuthMiddleware.authenticateToken, CampaignController.getMyCampaigns);
router.get("/:id", AuthMiddleware.authenticateToken, CampaignController.getCampaignById);
router.post("/", AuthMiddleware.authenticateToken, CampaignController.createCampaign);
router.put("/:id", AuthMiddleware.authenticateToken, CampaignController.updateCampaign);
router.delete("/:id", AuthMiddleware.authenticateToken, CampaignController.deleteCampaign);
router.post("/:id/update", AuthMiddleware.authenticateToken, CampaignController.addCampaignUpdate);
router.post("/:id/cover", AuthMiddleware.authenticateToken, CampaignController.uploadCoverImage);

// Donation routes
router.post("/:id/donate", AuthMiddleware.authenticateToken, DonationController.createDonationOrder);
router.post("/donate/verify", AuthMiddleware.authenticateToken, DonationController.verifyDonation);
router.post("/:id/contribute", AuthMiddleware.authenticateToken, DonationController.contributeSkill);
router.get("/:campaignId/donors", AuthMiddleware.authenticateToken, DonationController.getCampaignDonors);

module.exports = router;
