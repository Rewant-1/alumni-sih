/**
 * LeetCode Stats Controller
 * Uses alfa-leetcode-api (https://alfa-leetcode-api.onrender.com/) for fetching user stats
 * 
 * Available endpoints:
 * - Profile: /:username - User profile details
 * - Badges: /:username/badges - Earned badges
 * - Solved: /:username/solved - Problems solved count
 * - Contest: /:username/contest - Contest participation
 * - Contest History: /:username/contest/history - All contests
 * - Submissions: /:username/submission - Last 20 submissions
 * - Accepted: /:username/acSubmission - Accepted submissions
 * - Calendar: /:username/calendar - Submission calendar
 */

const axios = require('axios');

const BASE_URL = 'https://alfa-leetcode-api.onrender.com';

/**
 * Get LeetCode user profile
 */
const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}`);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode profile fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode profile."
        });
    }
};

/**
 * Get user's earned badges
 */
const getBadges = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/badges`);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode badges fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode badges:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode badges."
        });
    }
};

/**
 * Get problems solved count
 */
const getSolved = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/solved`);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode solved count fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode solved count:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode solved count."
        });
    }
};

/**
 * Get contest participation details
 */
const getContest = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/contest`);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode contest details fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode contest details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode contest details."
        });
    }
};

/**
 * Get all contest history
 */
const getContestHistory = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/contest/history`);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode contest history fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode contest history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode contest history."
        });
    }
};

/**
 * Get user's submissions (last 20 or specified limit)
 */
const getSubmissions = async (req, res) => {
    try {
        const { username } = req.params;
        const { limit } = req.query;
        const url = limit
            ? `${BASE_URL}/${username}/submission?limit=${limit}`
            : `${BASE_URL}/${username}/submission`;
        const response = await axios.get(url);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode submissions fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode submissions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode submissions."
        });
    }
};

/**
 * Get accepted submissions
 */
const getAcceptedSubmissions = async (req, res) => {
    try {
        const { username } = req.params;
        const { limit } = req.query;
        const url = limit
            ? `${BASE_URL}/${username}/acSubmission?limit=${limit}`
            : `${BASE_URL}/${username}/acSubmission`;
        const response = await axios.get(url);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode accepted submissions fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode accepted submissions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode accepted submissions."
        });
    }
};

/**
 * Get submission calendar
 */
const getCalendar = async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`${BASE_URL}/${username}/calendar`);
        res.status(200).json({
            success: true,
            data: response.data,
            message: "LeetCode calendar fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode calendar:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode calendar."
        });
    }
};

/**
 * Get complete user stats (aggregated)
 */
const getCompleteStats = async (req, res) => {
    try {
        const { username } = req.params;

        const [profile, solved, badges, contest] = await Promise.all([
            axios.get(`${BASE_URL}/${username}`).catch(() => ({ data: null })),
            axios.get(`${BASE_URL}/${username}/solved`).catch(() => ({ data: null })),
            axios.get(`${BASE_URL}/${username}/badges`).catch(() => ({ data: null })),
            axios.get(`${BASE_URL}/${username}/contest`).catch(() => ({ data: null })),
        ]);

        res.status(200).json({
            success: true,
            data: {
                profile: profile.data,
                solved: solved.data,
                badges: badges.data,
                contest: contest.data,
            },
            message: "LeetCode complete stats fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching LeetCode complete stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode complete stats."
        });
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
    getCompleteStats,
};
