const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { PORT } = require('./config');
const v1Routes = require('./src/routes/v1');
const dbConnect = require('./utils/db.js');

const app = express();

// CORS Configuration - STANDARDIZED PORTS
// Frontend: 3001, Backend: 5000
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3001',      // Frontend (PRIMARY)
      'http://127.0.0.1:3001',
      'http://localhost:3000',      // Fallback
      'http://127.0.0.1:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all in development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Key'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/v1', v1Routes);

// Connect to database
dbConnect();

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Alumni Management System API',
    version: 'v1',
    endpoints: '/api/v1',
    port: PORT
  });
});

// Start server - STANDARDIZED PORT 5000
const serverPort = PORT || 5000;
app.listen(serverPort, () => {
  console.log(`🚀 Backend Server: http://localhost:${serverPort}`);
  console.log(`📡 API Base URL: http://localhost:${serverPort}/api/v1`);
  console.log(`🌐 Frontend Expected: http://localhost:3001`);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});