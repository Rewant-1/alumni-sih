/**
 * Notification Service
 * Handles creating and sending notifications
 */

const NotificationModel = require('../model/model.notification');

/**
 * Create a notification
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async ({
    userId,
    type,
    title,
    message,
    reference,
    link,
    priority = 'medium'
}) => {
    try {
        const notification = await NotificationModel.create({
            userId,
            type,
            title,
            message,
            reference,
            link,
            priority
        });

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error('Notification creation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send connection request notification
 */
const notifyConnectionRequest = async (toUserId, fromUser) => {
    return await createNotification({
        userId: toUserId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${fromUser.name} wants to connect with you`,
        reference: { model: 'User', id: fromUser._id },
        link: `/connections`
    });
};

/**
 * Send connection accepted notification
 */
const notifyConnectionAccepted = async (toUserId, acceptedByUser) => {
    return await createNotification({
        userId: toUserId,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${acceptedByUser.name} accepted your connection request`,
        reference: { model: 'User', id: acceptedByUser._id },
        link: `/profile/${acceptedByUser._id}`
    });
};

/**
 * Send new message notification
 */
const notifyNewMessage = async (toUserId, fromUser, chatId) => {
    return await createNotification({
        userId: toUserId,
        type: 'message',
        title: 'New Message',
        message: `${fromUser.name} sent you a message`,
        reference: { model: 'Chat', id: chatId },
        link: `/messages/${chatId}`
    });
};

/**
 * Send job posted notification (to college admin)
 */
const notifyJobPosted = async (adminId, job, postedBy) => {
    return await createNotification({
        userId: adminId,
        type: 'approval_pending',
        title: 'New Job Pending Approval',
        message: `${postedBy.name} posted a new job: ${job.title}`,
        reference: { model: 'Job', id: job._id },
        link: `/admin/jobs/${job._id}`,
        priority: 'high'
    });
};

/**
 * Send job application notification
 */
const notifyJobApplication = async (jobPosterId, applicant, job) => {
    return await createNotification({
        userId: jobPosterId,
        type: 'job_application',
        title: 'New Job Application',
        message: `${applicant.name} applied for ${job.title}`,
        reference: { model: 'Job', id: job._id },
        link: `/jobs/${job._id}/applications`
    });
};

/**
 * Send job status update notification
 */
const notifyJobStatus = async (applicantId, job, status) => {
    const statusMessages = {
        viewed: 'Your application has been viewed',
        shortlisted: 'You have been shortlisted!',
        interview: 'You have been invited for an interview',
        offered: 'Congratulations! You received an offer',
        hired: 'Congratulations! You have been hired',
        rejected: 'Your application was not selected'
    };

    return await createNotification({
        userId: applicantId,
        type: 'job_status',
        title: `Application Update: ${job.title}`,
        message: statusMessages[status] || `Your application status: ${status}`,
        reference: { model: 'Job', id: job._id },
        link: `/jobs/applications`,
        priority: status === 'offered' || status === 'hired' ? 'high' : 'medium'
    });
};

/**
 * Send event reminder notification
 */
const notifyEventReminder = async (userId, event, hoursUntil) => {
    return await createNotification({
        userId,
        type: 'event_reminder',
        title: 'Event Reminder',
        message: `"${event.title}" starts in ${hoursUntil} hours`,
        reference: { model: 'Event', id: event._id },
        link: `/events/${event._id}`,
        priority: 'high'
    });
};

/**
 * Send event registration confirmation
 */
const notifyEventRegistration = async (userId, event) => {
    return await createNotification({
        userId,
        type: 'event_registration',
        title: 'Registration Confirmed',
        message: `You are registered for "${event.title}"`,
        reference: { model: 'Event', id: event._id },
        link: `/events/${event._id}/ticket`
    });
};

/**
 * Send donation thank you notification
 */
const notifyDonationReceived = async (campaignCreatorId, donation, donor) => {
    return await createNotification({
        userId: campaignCreatorId,
        type: 'donation_received',
        title: 'New Donation Received',
        message: `${donor.isAnonymous ? 'Anonymous donor' : donor.name} donated ₹${donation.amount}`,
        reference: { model: 'Donation', id: donation._id },
        link: `/campaigns/${donation.campaignId}`
    });
};

/**
 * Send donation thank you to donor
 */
const notifyDonationThankYou = async (donorId, campaign, amount) => {
    return await createNotification({
        userId: donorId,
        type: 'donation_thankyou',
        title: 'Thank You for Your Donation!',
        message: `Your donation of ₹${amount} to "${campaign.title}" is appreciated`,
        reference: { model: 'Campaign', id: campaign._id },
        link: `/campaigns/${campaign._id}`
    });
};

/**
 * Send story approval notification
 */
const notifyStoryApproved = async (authorId, story) => {
    return await createNotification({
        userId: authorId,
        type: 'story_approved',
        title: 'Story Published!',
        message: `Your success story "${story.title}" has been approved and published`,
        reference: { model: 'SuccessStory', id: story._id },
        link: `/success-stories/${story.slug}`
    });
};

/**
 * Send story rejection notification
 */
const notifyStoryRejected = async (authorId, story, reason) => {
    return await createNotification({
        userId: authorId,
        type: 'story_rejected',
        title: 'Story Needs Revision',
        message: `Your story "${story.title}" was not approved. Reason: ${reason}`,
        reference: { model: 'SuccessStory', id: story._id },
        link: `/success-stories/drafts`
    });
};

/**
 * Send alumni card issued notification
 */
const notifyCardIssued = async (userId, card) => {
    return await createNotification({
        userId,
        type: 'card_issued',
        title: 'Alumni Card Issued',
        message: `Your digital alumni card (${card.cardNumber}) is ready`,
        reference: { model: 'AlumniCard', id: card._id },
        link: `/alumni-card`
    });
};

/**
 * Get unread notifications count
 */
const getUnreadCount = async (userId) => {
    return await NotificationModel.getUnreadCount(userId);
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true, readAt: new Date() },
            { new: true }
        );

        return {
            success: true,
            notification
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
    try {
        await NotificationModel.updateMany(
            { userId, read: false },
            { read: true, readAt: new Date() }
        );

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
    try {
        const query = { userId };
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await NotificationModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await NotificationModel.countDocuments(query);

        return {
            success: true,
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    createNotification,
    notifyConnectionRequest,
    notifyConnectionAccepted,
    notifyNewMessage,
    notifyJobPosted,
    notifyJobApplication,
    notifyJobStatus,
    notifyEventReminder,
    notifyEventRegistration,
    notifyDonationReceived,
    notifyDonationThankYou,
    notifyStoryApproved,
    notifyStoryRejected,
    notifyCardIssued,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getUserNotifications
};
