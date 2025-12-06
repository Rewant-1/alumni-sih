# 📋 Implementation Roadmap - Missing Features

**Created:** December 6, 2025  
**Priority Order:** High → Medium → Low

---

## 🔴 **PHASE 1: CRITICAL FEATURES (Week 1)**

### 1.1 Job Applications System ⏱️ 2-3 hours

**Files to Create/Modify:**
- `src/controller/controller.job.js` - Add functions
- `src/routes/routes.job.js` - Add routes

**Tasks:**

#### Step 1: Add Controller Functions
```javascript
// Add to controller.job.js

// Apply to job
const applyToJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { resumeUrl, coverLetter } = req.body;
        const userId = req.user.userId;

        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        if (!job.isOpen) {
            return res.status(400).json({ success: false, message: "Job applications are closed" });
        }

        // Check if already applied
        const existingApplication = job.applications.find(
            app => app.applicantId.toString() === userId
        );
        if (existingApplication) {
            return res.status(400).json({ success: false, message: "Already applied" });
        }

        // Get alumni profile
        const alumni = await AlumniModel.findOne({ userId });
        
        job.applications.push({
            applicantId: userId,
            applicantAlumniId: alumni?._id,
            resumeUrl,
            coverLetter,
            status: 'applied'
        });

        job.applicationCount = job.applications.length;
        await job.save();

        res.status(200).json({
            success: true,
            message: "Application submitted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my posted jobs
const getMyPostedJobs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const jobs = await JobModel.find({ postedByUser: userId })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { jobs }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my applications
const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const jobs = await JobModel.find({
            'applications.applicantId': userId
        })
        .populate('postedBy', 'name')
        .select('title company location type applications createdAt');

        const applications = jobs.map(job => {
            const myApp = job.applications.find(
                app => app.applicantId.toString() === userId
            );
            return {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type
                },
                application: myApp
            };
        });

        res.status(200).json({
            success: true,
            data: { applications }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export new functions
module.exports = {
    // ...existing exports
    applyToJob,
    getMyPostedJobs,
    getMyApplications
};
```

#### Step 2: Add Routes
```javascript
// Add to routes.job.js after existing routes

router.post("/:id/apply", AuthMiddleware.authenticateToken, JobController.applyToJob);
router.get("/my/posted", AuthMiddleware.authenticateToken, JobController.getMyPostedJobs);
router.get("/my/applications", AuthMiddleware.authenticateToken, JobController.getMyApplications);
```

**Testing:**
```bash
# Apply to job
POST http://localhost:5000/api/v1/jobs/{jobId}/apply
Authorization: Bearer {token}
{
  "resumeUrl": "https://example.com/resume.pdf",
  "coverLetter": "I am interested..."
}

# Get my posted jobs
GET http://localhost:5000/api/v1/jobs/my/posted
Authorization: Bearer {token}

# Get my applications
GET http://localhost:5000/api/v1/jobs/my/applications
Authorization: Bearer {token}
```

---

### 1.2 Job Referral System ⏱️ 3-4 hours

**Tasks:**

#### Step 1: Add Controller Functions
```javascript
// Add to controller.job.js

const requestReferral = async (req, res) => {
    try {
        const { id } = req.params; // job id
        const { message } = req.body;
        const userId = req.user.userId;

        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Create notification to job poster
        await NotificationModel.create({
            userId: job.postedByUser,
            type: 'referral_request',
            title: 'Referral Request',
            message: `Someone requested a referral for ${job.title}`,
            relatedId: id,
            relatedModel: 'Job'
        });

        res.status(200).json({
            success: true,
            message: "Referral request sent"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const provideReferral = async (req, res) => {
    try {
        const { id } = req.params; // job id
        const { referredUserId, message } = req.body;
        const userId = req.user.userId;

        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Add referral
        job.referrals.push({
            referredBy: userId,
            referredUser: referredUserId,
            status: 'pending'
        });

        await job.save();

        // Create notification
        await NotificationModel.create({
            userId: referredUserId,
            type: 'referral_received',
            title: 'Job Referral',
            message: `You received a referral for ${job.title}`,
            relatedId: id,
            relatedModel: 'Job'
        });

        res.status(200).json({
            success: true,
            message: "Referral provided successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyReferrals = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const given = await JobModel.find({
            'referrals.referredBy': userId
        }).select('title company referrals');

        const received = await JobModel.find({
            'referrals.referredUser': userId
        }).select('title company referrals');

        res.status(200).json({
            success: true,
            data: { given, received }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export
module.exports = {
    // ...existing
    requestReferral,
    provideReferral,
    getMyReferrals
};
```

#### Step 2: Add Routes
```javascript
// Add to routes.job.js

router.post("/:id/request-referral", AuthMiddleware.authenticateToken, JobController.requestReferral);
router.post("/:id/provide-referral", AuthMiddleware.authenticateToken, JobController.provideReferral);
router.get("/my/referrals", AuthMiddleware.authenticateToken, JobController.getMyReferrals);
```

---

### 1.3 Event Registration System ⏱️ 2 hours

**Files to Modify:**
- `src/model/model.event.js`
- `src/controller/controller.event.js`
- `src/routes/routes.event.js`

#### Step 1: Update Event Model
```javascript
// Add to model.event.js schema

registrations: [{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    attended: {
        type: Boolean,
        default: false
    },
    feedbackGiven: {
        type: Boolean,
        default: false
    }
}],

registrationCount: {
    type: Number,
    default: 0
},

maxAttendees: {
    type: Number
}
```

#### Step 2: Add Controller Function
```javascript
// Add to controller.event.js

const registerForEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const event = await EventModel.findById(id);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found" 
            });
        }

        // Check if already registered
        const isRegistered = event.registrations.some(
            reg => reg.userId.toString() === userId
        );

        if (isRegistered) {
            return res.status(400).json({
                success: false,
                message: "Already registered for this event"
            });
        }

        // Check max attendees
        if (event.maxAttendees && event.registrationCount >= event.maxAttendees) {
            return res.status(400).json({
                success: false,
                message: "Event is full"
            });
        }

        event.registrations.push({ userId });
        event.registrationCount = event.registrations.length;
        await event.save();

        res.status(200).json({
            success: true,
            message: "Successfully registered for event"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const events = await EventModel.find({
            'registrations.userId': userId
        }).sort({ date: 1 });

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    // ...existing
    registerForEvent,
    getMyEvents
};
```

#### Step 3: Update Routes with Auth
```javascript
// Replace routes.event.js content

const express = require("express");
const EventController = require("../controller/controller.event.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

const router = express.Router();

// Protected routes
router.post("/", AuthMiddleware.authenticateToken, EventController.createEvent);
router.get("/", AuthMiddleware.authenticateToken, EventController.getEvents);
router.get("/my", AuthMiddleware.authenticateToken, EventController.getMyEvents);
router.get("/:id", AuthMiddleware.authenticateToken, EventController.getEventById);
router.put("/:id", AuthMiddleware.authenticateToken, EventController.updateEvent);
router.delete("/:id", AuthMiddleware.authenticateToken, EventController.deleteEvent);
router.post("/:id/register", AuthMiddleware.authenticateToken, EventController.registerForEvent);

module.exports = router;
```

---

### 1.4 Geographic Map Data Endpoint ⏱️ 30 minutes

**Files to Modify:**
- `src/controller/controller.alumni.js`
- `src/routes/routes.alumni.js`

#### Step 1: Add Controller Function
```javascript
// Add to controller.alumni.js

const getAlumniMapData = async (req, res) => {
    try {
        const collegeId = req.admin?.id || req.user?.collegeId;
        
        const query = {
            'location.coordinates.lat': { $exists: true },
            'location.coordinates.lng': { $exists: true }
        };

        const alumni = await AlumniModel.find(query)
            .populate('userId', 'name email')
            .select('userId location graduationYear department degree')
            .lean();

        // Format for map display
        const mapData = alumni.map(a => ({
            id: a._id,
            name: a.userId?.name,
            coordinates: a.location.coordinates,
            city: a.location.city,
            state: a.location.state,
            country: a.location.country,
            graduationYear: a.graduationYear,
            department: a.department
        }));

        res.status(200).json({
            success: true,
            data: mapData,
            count: mapData.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Export
module.exports = {
    // ...existing
    getAlumniMapData
};
```

#### Step 2: Add Route
```javascript
// Add to routes.alumni.js

router.get("/map-data", AuthMiddleware.authenticateToken, AlumniController.getAlumniMapData);
```

---

### 1.5 Real-Time Messaging (Socket.io) ⏱️ 4-5 hours

**Files to Create/Modify:**
- `utils/socket.js` (NEW)
- `app.js` (MODIFY)
- `src/controller/controller.message.js` (MODIFY)

#### Step 1: Install Dependencies
```bash
npm install socket.io
```

#### Step 2: Create Socket Service
```javascript
// Create utils/socket.js

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const ChatModel = require('../src/model/model.chat');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: ['http://localhost:3001', 'http://localhost:3000'],
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
        console.log(`User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Join chat rooms
        socket.on('joinChat', (chatId) => {
            socket.join(`chat:${chatId}`);
        });

        // Send message
        socket.on('sendMessage', async (data) => {
            try {
                const { chatId, message } = data;
                const senderId = socket.userId;

                // Save message to database
                const chat = await ChatModel.findById(chatId);
                if (!chat) {
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }

                const senderType = socket.userType === 'Alumni' ? 'alumni' : 'student';
                
                chat.messages.push({
                    sender: senderType,
                    message,
                    timestamp: new Date()
                });

                await chat.save();

                // Emit to chat room
                io.to(`chat:${chatId}`).emit('newMessage', {
                    chatId,
                    sender: senderType,
                    senderId,
                    message,
                    timestamp: new Date()
                });

            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(`chat:${chatId}`).emit('userTyping', {
                userId: socket.userId,
                isTyping
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
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

module.exports = { initializeSocket, getIO };
```

#### Step 3: Integrate with Express App
```javascript
// Modify app.js

const http = require('http');
const { initializeSocket } = require('./utils/socket');

// ... existing code ...

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// ... existing code ...

// Replace app.listen with server.listen
server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`🔌 Socket.io enabled for real-time features`);
});

module.exports = server;
```

---

## 🟡 **PHASE 2: ENHANCEMENT FEATURES (Week 2)**

### 2.1 Surveys System ⏱️ 4-5 hours

**Files to Create:**
- `src/model/model.survey.js`
- `src/model/model.surveyResponse.js`
- `src/controller/controller.survey.js`
- `src/routes/routes.survey.js`

#### Model Structure
```javascript
// src/model/model.survey.js

const surveySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        questionType: {
            type: String,
            enum: ['text', 'multiple-choice', 'checkbox', 'rating', 'dropdown'],
            required: true
        },
        options: [String], // For multiple-choice, checkbox, dropdown
        required: {
            type: Boolean,
            default: false
        },
        order: Number
    }],
    
    targetAudience: {
        type: String,
        enum: ['all', 'alumni', 'students', 'specific-batch'],
        default: 'all'
    },
    
    specificBatch: Number, // If targetAudience is 'specific-batch'
    
    status: {
        type: String,
        enum: ['draft', 'active', 'closed'],
        default: 'draft'
    },
    
    startDate: Date,
    endDate: Date,
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        required: true
    },
    
    responseCount: {
        type: Number,
        default: 0
    },
    
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
```

```javascript
// src/model/model.surveyResponse.js

const surveyResponseSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        answer: mongoose.Schema.Types.Mixed // Can be string, array, number
    }],
    
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
```

#### Controller & Routes
```javascript
// src/controller/controller.survey.js

const getSurveys = async (req, res) => {
    const surveys = await SurveyModel.find({ status: 'active' });
    res.json({ success: true, data: surveys });
};

const getSurveyById = async (req, res) => {
    const survey = await SurveyModel.findById(req.params.id);
    res.json({ success: true, data: survey });
};

const submitResponse = async (req, res) => {
    const { answers } = req.body;
    const surveyId = req.params.id;
    const userId = req.user.userId;
    
    // Check if already responded
    const existing = await SurveyResponseModel.findOne({ surveyId, userId });
    if (existing) {
        return res.status(400).json({ 
            success: false, 
            message: 'Already responded' 
        });
    }
    
    const response = await SurveyResponseModel.create({
        surveyId,
        userId,
        answers
    });
    
    await SurveyModel.findByIdAndUpdate(surveyId, {
        $inc: { responseCount: 1 }
    });
    
    res.json({ success: true, data: response });
};
```

```javascript
// src/routes/routes.survey.js

const express = require('express');
const SurveyController = require('../controller/controller.survey');
const AuthMiddleware = require('../middleware/middleware.auth');

const router = express.Router();

router.get('/', AuthMiddleware.authenticateToken, SurveyController.getSurveys);
router.get('/:id', AuthMiddleware.authenticateToken, SurveyController.getSurveyById);
router.post('/:id/respond', AuthMiddleware.authenticateToken, SurveyController.submitResponse);

module.exports = router;
```

#### Add to v1.js
```javascript
const surveyRoutes = require('./routes.survey');
v1.use('/surveys', surveyRoutes);
```

---

### 2.2 Newsletters System ⏱️ 3 hours

**Files to Create:**
- `src/model/model.newsletter.js`
- `src/controller/controller.newsletter.js`
- `src/routes/routes.newsletter.js`

#### Model
```javascript
// src/model/model.newsletter.js

const newsletterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    
    subject: {
        type: String,
        required: true
    },
    
    content: {
        type: String,
        required: true
    },
    
    htmlContent: {
        type: String // Rich HTML version
    },
    
    coverImage: {
        type: String // Cloudinary URL
    },
    
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sent'],
        default: 'draft'
    },
    
    scheduledFor: Date,
    
    sentAt: Date,
    
    recipients: {
        type: String,
        enum: ['all', 'alumni', 'students', 'specific-batch'],
        default: 'all'
    },
    
    specificBatch: Number,
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        required: true
    },
    
    stats: {
        sent: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 }
    }
}, { timestamps: true });
```

#### Controller & Routes
```javascript
// src/controller/controller.newsletter.js

const getNewsletters = async (req, res) => {
    const newsletters = await NewsletterModel.find({ status: 'sent' })
        .sort({ sentAt: -1 })
        .select('title subject coverImage sentAt');
    res.json({ success: true, data: newsletters });
};

const getNewsletterById = async (req, res) => {
    const newsletter = await NewsletterModel.findById(req.params.id);
    res.json({ success: true, data: newsletter });
};

module.exports = { getNewsletters, getNewsletterById };
```

```javascript
// src/routes/routes.newsletter.js

const express = require('express');
const NewsletterController = require('../controller/controller.newsletter');
const AuthMiddleware = require('../middleware/middleware.auth');

const router = express.Router();

router.get('/', AuthMiddleware.authenticateToken, NewsletterController.getNewsletters);
router.get('/:id', AuthMiddleware.authenticateToken, NewsletterController.getNewsletterById);

module.exports = router;
```

---

## ✅ **TESTING CHECKLIST**

### Phase 1 Testing

- [ ] Job Applications
  - [ ] Apply to a job
  - [ ] View my applications
  - [ ] View my posted jobs
  - [ ] Check duplicate application prevention

- [ ] Referrals
  - [ ] Request referral
  - [ ] Provide referral
  - [ ] View my referrals (given & received)

- [ ] Events
  - [ ] Register for event
  - [ ] View my events
  - [ ] Check max attendees limit
  - [ ] Verify auth middleware

- [ ] Map Data
  - [ ] Fetch alumni with coordinates
  - [ ] Verify data format for frontend

- [ ] Real-Time Messaging
  - [ ] Connect to Socket.io
  - [ ] Send/receive messages
  - [ ] Typing indicators
  - [ ] Multiple chat rooms

### Phase 2 Testing

- [ ] Surveys
  - [ ] Get active surveys
  - [ ] Submit response
  - [ ] Prevent duplicate submission

- [ ] Newsletters
  - [ ] Get all newsletters
  - [ ] View newsletter content

---

## 🎯 **TIME ESTIMATES**

| Phase | Feature | Time | Complexity |
|-------|---------|------|------------|
| 1 | Job Applications | 2-3h | Low |
| 1 | Job Referrals | 3-4h | Medium |
| 1 | Event Registration | 2h | Low |
| 1 | Map Data Endpoint | 30min | Low |
| 1 | Socket.io Integration | 4-5h | High |
| **Total Phase 1** | | **12-14.5h** | |
| 2 | Surveys | 4-5h | Medium |
| 2 | Newsletters | 3h | Low |
| **Total Phase 2** | | **7-8h** | |
| **Grand Total** | | **19-22.5h** | |

---

## 📝 **NOTES**

1. **Socket.io** is the most complex feature - allocate more time
2. Test each feature immediately after implementation
3. Use Postman collection for API testing
4. Consider creating frontend components in parallel
5. Update API documentation (Swagger) after each feature

---

## 🚀 **DEPLOYMENT CONSIDERATIONS**

- Add `socket.io` to production dependencies
- Configure Socket.io CORS for production frontend URL
- Update environment variables for production
- Load test Socket.io connections
- Set up Redis adapter for Socket.io if scaling horizontally
