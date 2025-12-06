const express = require('express');
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
const linkedinRoutes = require('./routes.linkedin.js');
const leetcodeRoutes = require('./routes.leetcode.js');
const githubRoutes = require('./routes.github.js');

const v1 = express.Router();

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
v1.use('/linkedin',linkedinRoutes);
v1.use('/leetcode', leetcodeRoutes);
v1.use('/github', githubRoutes);

module.exports = v1;
