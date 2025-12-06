const express = require("express");
const DonationController = require("../controller/controller.donation");
const AuthMiddleware = require("../middleware/middleware.auth");

const router = express.Router();

// Get my donations
router.get("/my", AuthMiddleware.authenticateToken, DonationController.getMyDonations);

// Get donation impact
router.get("/impact", AuthMiddleware.authenticateToken, DonationController.getDonationImpact);

// Generate certificate
router.get("/certificate/:id", AuthMiddleware.authenticateToken, DonationController.generateCertificate);

module.exports = router;
