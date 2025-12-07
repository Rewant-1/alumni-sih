const axios = require('axios');

/**
 * LinkedIn OAuth Controller
 * Handles LinkedIn authentication and profile fetching
 */

/**
 * Redirect user to LinkedIn OAuth authorization page
 */
const getAuth = async (req, res) => {
    const client_id = process.env.LINKEDIN_CLIENT_ID;
    const redirect_uri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.BASE_URL}/api/v1/linkedin/callback`;
    const state = process.env.LINKEDIN_STATE || 'random_state_string';

    if (!client_id) {
        return res.status(500).json({
            success: false,
            message: "LinkedIn Client ID not configured."
        });
    }

    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}&scope=openid%20profile%20email`;
    return res.redirect(linkedInAuthUrl);
};

/**
 * Handle LinkedIn OAuth callback, exchange code for access token
 */
const getAccessToken = async (req, res) => {
    const { code, state } = req.query;
    const expected_state = process.env.LINKEDIN_STATE || 'random_state_string';

    try {
        // Validate state to prevent CSRF
        if (state !== expected_state) {
            return res.status(400).json({
                success: false,
                message: "Invalid state parameter."
            });
        }

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code is required."
            });
        }

        // Exchange code for access token
        const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.BASE_URL}/api/v1/linkedin/callback`,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_SECRET,
        });

        const response = await axios.post(tokenUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, expires_in } = response.data;

        // Return token to client (or store in session/DB)
        res.status(200).json({
            success: true,
            data: {
                access_token,
                expires_in,
            },
            message: "LinkedIn authentication successful."
        });

    } catch (error) {
        console.error("Error during LinkedIn OAuth callback:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Failed to exchange authorization code for token."
        });
    }
};

/**
 * Get LinkedIn user profile using access token
 */
const getMe = async (req, res) => {
    try {
        // Get access token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "LinkedIn access token is required in Authorization header."
            });
        }

        const accessToken = authHeader.split(' ')[1];

        const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            timeout: 10000
        });

        res.status(200).json({
            success: true,
            data: response.data,
            message: "LinkedIn profile fetched successfully."
        });

    } catch (error) {
        console.error("Error fetching LinkedIn profile:", error.response?.data || error.message);

        if (error.response?.status === 401) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired LinkedIn access token."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch LinkedIn profile."
        });
    }
};

module.exports = {
    getAuth,
    getAccessToken,
    getMe,
};
