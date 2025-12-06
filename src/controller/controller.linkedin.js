const axios = require('axios');
const { clientEncryption } = require('../model/model.user');
const dotenv = require('dotenv');
dotenv.config();

const getAuth = async (req, res) => {
    const client_id = process.env.LINKEDIN_CLIENT_ID;
    const redirect_uri = process.env.LINKEDIN_REDIRECT_URI;
    const state = process.env.LINKEDIN_STATE;

    console.log(client_id, redirect_uri);
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}&scope=openid%20profile%20email`;
  return res.redirect(linkedInAuthUrl);
};

const getAccessToken = async (req, res) => {
  const { code, state } = req.query;
  const _state = process.env.LINKEDIN_STATE;

  try {
    if (state !== _state) {
      return res.status(400).json({ success: false, message: "Invalid state." });
    }
    if (!code) {
      return res.status(400).json({ success: false, message: "Code is required." });
    }

    const response = await axios.post(`https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&client_id=${process.env.LINKEDIN_CLIENT_ID}&client_secret=${process.env.LINKEDIN_SECRET}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    // console.log(response.data);
    const accessToken = response.data.access_token;
    process.env.ACCESSTOKEN = accessToken;
    return res.send(response.data);
  } catch (error) {
    console.error("Error calling LinkedIn API:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getMe = async (req,res) => {
    const accessToken = 'AQVKIo5DI8EUWQ2qvkMnNEUjDSZbKb4q9EE1nEo1uGRhVpDAQz8GYxgzZRsJwBPNz7qb-sOloj7TZkhykYpVlZBJ36TIKP_Xst-VPFDY1hCW5I-RlhrcW6YZGziOIhVDDrf1lL19Wr0xaAKY2eRBdqKedYUTYTHTo62D9C7l9IBCXgsUuYe4zOLxim1bOI4HmSXrI2t4-QPRJS9Q5MUP2wqlMMKnZmxqzrV4X5X_eMd7A1jfbOUgZD0bT0rv57fj3BBynZbp9KljcWqAKa_2ZmDKbn_4jxApVkYW1-JTNmAsKqGaBkenEqAGPOyXCdifeEG0NX0FmonresB-VK3';
    console.log(accessToken);
    try {
        const response = await axios.get(`https://api.linkedin.com/v2/userinfo`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 10000
        });
        console.log(response.data);
        return res.send(response.data);
    } catch (error) {
        console.error("Error calling LinkedIn API:", error);
    }

}

module.exports = {
    getAuth,
    getAccessToken,
    getMe
};
