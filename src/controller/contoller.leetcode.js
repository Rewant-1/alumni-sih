/**
 * baseurl = https://alfa-leetcode-api.onrender.com/
 * endpoints: 
 * Profile	/:username	Get details about a user’s profile.	click here
    Badges	/:username/badges	Get the badges earned by the user.	click here
    Solved	/:username/solved	Get the total number of questions solved by the user.	click here
    Contest	/:username/contest	Get details about the user’s contest participation.	click here
    Contest History	/:username/contest/history	Get all contest history.	click here
    Submission	/:username/submission	Get the last 20 submissions of the user.	click here
    Limited Submission	/:username/submission?limit=number	Get a specified number of the user’s last submissions.	click here
    Accepted Submission	/:username/acSubmission	Get the last 20 accepted submission of the user.	click here
    Limited Accepted Submission	/:username/acSubmission?limit=7	Get a specified number of the user’s last accepted submission.	click here
    Calendar	/:username/calendar	Get the user’s submission calendar.
 */
const axios = require('axios');

const BASE_URL = 'https://alfa-leetcode-api.onrender.com';

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getBadges = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/badges`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode badges:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getSolved = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/solved`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode solved count:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getContest = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/contest`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode contest details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getContestHistory = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/contest/history`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode contest history:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getSubmissions = async (req, res) => {
    try {
        const { username } = req.params;
        const { limit } = req.query;
        const url = limit ? `${BASE_URL}/${username}/submission?limit=${limit}` : `${BASE_URL}/${username}/submission`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode submissions:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getAcceptedSubmissions = async (req, res) => {
    try {
        const { username } = req.params;
        const { limit } = req.query;
        const url = limit ? `${BASE_URL}/${username}/acSubmission?limit=${limit}` : `${BASE_URL}/${username}/acSubmission`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode accepted submissions:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getCalendar = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/calendar`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching LeetCode calendar:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    getProfile,
    getBadges,
    getSolved,
    getContest,
    getContestHistory,
    getSubmissions,
    getAcceptedSubmissions,
    getCalendar,
}