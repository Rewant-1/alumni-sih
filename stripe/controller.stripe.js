const StripeService = require('./service.stripe');
const CampaignModel = require('../src/model/model.campaign'); // Adjust path to reach src/model
const UserModel = require('../src/model/model.user');
const { sendSuccess, sendError, sendBadRequest, sendNotFound } = require('../utils/response'); // Adjust path

/**
 * Create a donation payment intent
 * @route POST /api/v1/stripe/create-donation-intent
 */
const createCampaignDonationIntent = async (req, res) => {
    try {
        const { campaignId, amount } = req.body;
        const userId = req.user.userId;

        if (!campaignId || !amount) {
            return sendBadRequest(res, "Campaign ID and amount are required");
        }

        // Validate Campaign
        const campaign = await CampaignModel.findById(campaignId);
        if (!campaign) {
            return sendNotFound(res, "Campaign not found");
        }

        if (campaign.status !== 'active') {
            return sendBadRequest(res, "This campaign is not active");
        }

        // Validate User
        const user = await UserModel.findById(userId);
        if (!user) {
            return sendNotFound(res, "User not found");
        }

        // Create Payment Intent
        // Amount is expected in standard unit (e.g., Rupees), convert to smallest unit (Paise)
        const amountInPaise = Math.round(amount * 100);

        const result = await StripeService.createPaymentIntent({
            amount: amountInPaise,
            currency: 'inr',
            metadata: {
                campaignId: campaignId,
                campaignTitle: campaign.title,
                userId: userId,
                userEmail: user.email,
                type: 'campaign_donation'
            }
        });

        if (!result.success) {
            return sendError(res, "Failed to create payment intent", 500, result.error);
        }

        return sendSuccess(res, {
            clientSecret: result.clientSecret,
            paymentIntentId: result.id
        }, "Payment intent created successfully");

    } catch (error) {
        console.error("Error in createCampaignDonationIntent:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

module.exports = {
    createCampaignDonationIntent
};
