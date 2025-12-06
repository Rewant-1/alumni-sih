/**
 * Activity Controller
 * Handles activity tracking and retrieval
 */

const ActivityModel = require('../model/model.activity');

/**
 * Get user's activities
 */
const getMyActivities = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            startDate,
            endDate
        } = req.query;

        const query = { userId: req.user._id };

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const activities = await ActivityModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ActivityModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
};

/**
 * Get activity summary
 */
const getActivitySummary = async (req, res) => {
    try {
        const summary = await ActivityModel.getActivitySummary(req.user._id);
        const totalPoints = await ActivityModel.getTotalPoints(req.user._id);

        // Get recent activity count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentCount = await ActivityModel.countDocuments({
            userId: req.user._id,
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                breakdown: summary,
                totalPoints,
                recentActivityCount: recentCount
            }
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        });
    }
};

/**
 * Get public activities for a user profile
 */
const getUserPublicActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const activities = await ActivityModel.find({
            userId,
            isPublic: true
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Get public activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
};

/**
 * Get leaderboard (top contributors)
 */
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;

        let dateFilter = {};
        if (period === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (period === 'week') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - 7);
            dateFilter = { createdAt: { $gte: startOfWeek } };
        }

        const leaderboard = await ActivityModel.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$userId',
                    totalPoints: { $sum: '$points' },
                    activityCount: { $sum: 1 }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'alumnis',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'alumni'
                }
            },
            { $unwind: { path: '$alumni', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    totalPoints: 1,
                    activityCount: 1,
                    'user.name': 1,
                    'alumni.photo': 1,
                    'alumni.headline': 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard',
            error: error.message
        });
    }
};

/**
 * Get activity types breakdown
 */
const getActivityBreakdown = async (req, res) => {
    try {
        const breakdown = await ActivityModel.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    points: { $sum: '$points' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: breakdown
        });
    } catch (error) {
        console.error('Get breakdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch breakdown',
            error: error.message
        });
    }
};

module.exports = {
    getMyActivities,
    getActivitySummary,
    getUserPublicActivities,
    getLeaderboard,
    getActivityBreakdown
};
