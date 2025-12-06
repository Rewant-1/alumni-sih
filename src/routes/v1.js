const express = require('express');

// Existing routes
const authRoutes = require('./routes.auth');
const studentRoutes = require('./routes.student');
const connectionRoutes = require('./routes.connection');
const alumniRoutes = require('./routes.alumni');
const chatRoutes = require('./routes.chat.js');
const eventRoutes = require('./routes.event.js');
const jobRoutes = require('./routes.job.js');
const messageRoutes = require('./routes.message.js');
const postRoutes = require('./routes.post.js');
const userRoutes = require('./routes.user.js');

// New routes
const campaignRoutes = require('./routes.campaign.js');
const donationRoutes = require('./routes.donation.js');
const successStoryRoutes = require('./routes.successStory.js');
const alumniCardRoutes = require('./routes.alumniCard.js');
const notificationRoutes = require('./routes.notification.js');
const activityRoutes = require('./routes.activity.js');

const v1 = express.Router();

// Existing routes
v1.use('/auth', authRoutes);
v1.use('/students', studentRoutes);
v1.use('/connections', connectionRoutes);
v1.use('/alumni', alumniRoutes);
v1.use('/chats', chatRoutes);
v1.use('/events', eventRoutes);
v1.use('/jobs', jobRoutes);
v1.use('/messages', messageRoutes);
v1.use('/posts', postRoutes);
v1.use('/users', userRoutes);

// New routes
v1.use('/campaigns', campaignRoutes);
v1.use('/donations', donationRoutes);
v1.use('/success-stories', successStoryRoutes);
v1.use('/alumni-card', alumniCardRoutes);
v1.use('/notifications', notificationRoutes);
v1.use('/activities', activityRoutes);

module.exports = v1;
