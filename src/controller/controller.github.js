const axios = require('axios');

// GitHub OAuth credentials from environment
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET;

/**
 * Redirect user to GitHub OAuth authorization page
 */
const githubAuth = (req, res) => {
    const redirect_uri = `${process.env.BASE_URL || 'http://localhost:3000'}/api/v1/github/callback`;
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}`);
};

/**
 * Handle GitHub OAuth callback, exchange code for access token
 */
const githubAuthCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Authorization code not found."
        });
    }

    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve access token."
            });
        }

        // Use the access token to fetch the user's profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`
            }
        });

        res.status(200).json({
            success: true,
            data: userResponse.data,
            message: "GitHub authentication successful."
        });

    } catch (error) {
        console.error("Error during GitHub OAuth callback:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

/**
 * Get public GitHub profile by username (no auth required)
 */
const getGithubProfile = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required."
            });
        }

        const response = await axios.get(`https://api.github.com/users/${username}`);

        res.status(200).json({
            success: true,
            data: response.data,
            message: "GitHub profile fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching Github profile:", error);

        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: "GitHub user not found."
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

/**
 * Get GitHub user's repositories
 */
const getGithubRepos = async (req, res) => {
    try {
        const { username } = req.params;
        const { sort = 'updated', per_page = 10 } = req.query;

        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            params: { sort, per_page }
        });

        res.status(200).json({
            success: true,
            data: response.data,
            message: "GitHub repositories fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching Github repos:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    githubAuth,
    githubAuthCallback,
    getGithubProfile,
    getGithubRepos,
};
