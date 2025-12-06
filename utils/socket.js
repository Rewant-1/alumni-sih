const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const ChatModel = require('../src/model/model.chat');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userType = decoded.userType;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId} (${socket.userType})`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Emit online status
        socket.broadcast.emit('userOnline', { userId: socket.userId });

        // Join chat rooms
        socket.on('joinChat', (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        // Leave chat room
        socket.on('leaveChat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`User ${socket.userId} left chat ${chatId}`);
        });

        // Send message
        socket.on('sendMessage', async (data) => {
            try {
                const { chatId, message } = data;
                const senderId = socket.userId;

                if (!chatId || !message) {
                    socket.emit('error', { message: 'Chat ID and message are required' });
                    return;
                }

                // Save message to database
                const chat = await ChatModel.findById(chatId);
                if (!chat) {
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }

                // Determine sender type
                const senderType = socket.userType === 'Alumni' ? 'alumni' : 'student';
                
                const newMessage = {
                    sender: senderType,
                    message,
                    timestamp: new Date()
                };

                chat.messages.push(newMessage);
                await chat.save();

                // Get the saved message with ID
                const savedMessage = chat.messages[chat.messages.length - 1];

                // Emit to chat room
                io.to(`chat:${chatId}`).emit('newMessage', {
                    _id: savedMessage._id,
                    chatId,
                    sender: senderType,
                    senderId,
                    message,
                    timestamp: savedMessage.timestamp
                });

                console.log(`Message sent in chat ${chatId} by ${senderId}`);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(`chat:${chatId}`).emit('userTyping', {
                userId: socket.userId,
                isTyping,
                chatId
            });
        });

        // Mark messages as read
        socket.on('markAsRead', async (data) => {
            try {
                const { chatId } = data;
                socket.to(`chat:${chatId}`).emit('messagesRead', {
                    chatId,
                    userId: socket.userId
                });
            } catch (error) {
                console.error('Error marking as read:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
            socket.broadcast.emit('userOffline', { userId: socket.userId });
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper function to emit to specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Helper function to emit to chat room
const emitToChat = (chatId, event, data) => {
    if (io) {
        io.to(`chat:${chatId}`).emit(event, data);
    }
};

module.exports = { 
    initializeSocket, 
    getIO,
    emitToUser,
    emitToChat
};
