const express = require('express');
const router = express.Router();
const StripeController = require('./controller.stripe');
const { authenticateToken } = require('../src/middleware/middleware.auth'); // Adjust path

// Create payment intent for donation
router.post(
    '/create-donation-intent',
    authenticateToken,
    StripeController.createCampaignDonationIntent
);

module.exports = router;
