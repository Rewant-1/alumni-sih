/**
 * Notification Controller
 * Handles notification operations
 */

const notificationService = require('../service/service.notification');

/**
 * Get user's notifications
 */
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const result = await notificationService.getUserNotifications(
            req.user._id,
            { page: parseInt(page), limit: parseInt(limit), unreadOnly: unreadOnly === 'true' }
        );

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
                error: result.error
            });
        }

        res.status(200).json({
            success: true,
            data: result.notifications,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

/**
 * Get unread count
 */
const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);

        res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await notificationService.markAsRead(id, req.user._id);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to mark as read',
                error: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark as read',
            error: error.message
        });
    }
};

/**
 * Mark all as read
 */
const markAllAsRead = async (req, res) => {
    try {
        const result = await notificationService.markAllAsRead(req.user._id);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to mark all as read',
                error: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all as read',
            error: error.message
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
