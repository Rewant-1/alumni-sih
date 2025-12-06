const axios = require('axios');

// Replace with your GitHub App's Client ID and Client Secret
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET;

const githubAuth = (req, res) => {
    const redirect_uri = `http://localhost:3000/api/v1/github/callback`;
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}`);
};

const githubAuthCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ message: "Authorization code not found." });
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
            return res.status(500).json({ message: "Failed to retrieve access token." });
        }

        // Use the access token to fetch the user's profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`
            }
        });

        res.status(200).json(userResponse.data);

    } catch (error) {
        console.error("Error during GitHub OAuth callback:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getGithubProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`https://api.github.com/users/${username}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching Github profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    getGithubProfile,
    githubAuth,
    githubAuthCallback
};