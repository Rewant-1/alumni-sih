/**
 * Razorpay Payment Service
 * Handles payment order creation and verification
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpayInstance;
};

/**
 * Create a payment order
 * @param {Object} options
 * @param {number} options.amount - Amount in INR (will be converted to paise)
 * @param {string} options.receipt - Unique receipt ID
 * @param {string} options.currency - Currency code (default: INR)
 * @param {Object} options.notes - Additional notes to attach
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async ({ amount, receipt, currency = 'INR', notes = {} }) => {
    try {
        const razorpay = getRazorpayInstance();

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes,
            payment_capture: 1 // Auto-capture
        });

        return {
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status
            }
        };
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
const verifyPayment = (orderId, paymentId, signature) => {
    try {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        return generatedSignature === signature;
    } catch (error) {
        console.error('Payment verification failed:', error);
        return false;
    }
};

/**
 * Get payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const getPaymentDetails = async (paymentId) => {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            success: true,
            payment
        };
    } catch (error) {
        console.error('Fetch payment failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Process refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (in INR, optional - full refund if not provided)
 * @returns {Promise<Object>} Refund details
 */
const processRefund = async (paymentId, amount = null) => {
    try {
        const razorpay = getRazorpayInstance();

        const refundOptions = {};
        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions);
        return {
            success: true,
            refund
        };
    } catch (error) {
        console.error('Refund processing failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Create payment for event registration
 * @param {Object} event - Event object
 * @param {Object} user - User object
 * @returns {Promise<Object>} Order details
 */
const createEventPayment = async (event, user) => {
    const receipt = `EVT_${event._id}_${user._id}_${Date.now()}`.slice(0, 40);

    return await createOrder({
        amount: event.ticketPrice,
        receipt,
        notes: {
            type: 'event_registration',
            eventId: event._id.toString(),
            eventTitle: event.title,
            userId: user._id.toString(),
            userName: user.name
        }
    });
};

/**
 * Create payment for donation
 * @param {Object} campaign - Campaign object
 * @param {Object} user - User object
 * @param {number} amount - Donation amount
 * @returns {Promise<Object>} Order details
 */
const createDonationPayment = async (campaign, user, amount) => {
    const receipt = `DON_${campaign._id}_${user._id}_${Date.now()}`.slice(0, 40);

    return await createOrder({
        amount,
        receipt,
        notes: {
            type: 'campaign_donation',
            campaignId: campaign._id.toString(),
            campaignTitle: campaign.title,
            userId: user._id.toString(),
            userName: user.name
        }
    });
};

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentDetails,
    processRefund,
    createEventPayment,
    createDonationPayment,
    getRazorpayInstance
};
