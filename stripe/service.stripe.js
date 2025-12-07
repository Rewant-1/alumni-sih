const Stripe = require('stripe');

let stripeInstance = null;

const getStripeInstance = () => {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
};

/**
 * Create a PaymentIntent
 * @param {Object} params
 * @param {number} params.amount - Amount in smallest currency unit (e.g., paise for INR)
 * @param {string} params.currency - Currency code (e.g., 'inr')
 * @param {Object} params.metadata - Metadata to attach to the payment
 * @returns {Promise<Object>} Created PaymentIntent
 */
const createPaymentIntent = async ({ amount, currency = 'inr', metadata = {} }) => {
    try {
        const stripe = getStripeInstance();
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        };
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    createPaymentIntent
};
