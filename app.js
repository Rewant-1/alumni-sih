const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { PORT } = require('./config');
const v1Routes = require('./src/routes/v1');
const dbConnect = require('./utils/db.js');
const logger = require('./utils/logger');
const { swaggerUi, swaggerSpec } = require('./utils/swagger');
const { initializeSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

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
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL      // Production frontend URL
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked origin: ${origin}`);
      // Only allow all in development
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Key'],
  credentials: true
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const { generalLimiter } = require('./src/middleware/middleware.rateLimit');
app.use('/api/', generalLimiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Alumni System API Docs'
}));

// API Routes
app.use('/api/v1', v1Routes);

// Connect to database
dbConnect();

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Alumni Management System API',
    version: 'v1',
    endpoints: '/api/v1',
    port: PORT
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'healthy',
    service: 'Alumni Management System API',
    version: 'v1',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    healthCheck.database = {
      status: dbStatus[dbState],
      connected: dbState === 1
    };

    if (dbState !== 1) {
      healthCheck.status = 'degraded';
      healthCheck.success = false;
      return res.status(503).json(healthCheck);
    }

    res.json(healthCheck);
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.success = false;
    healthCheck.error = error.message;
    logger.error('Health check failed:', error);
    res.status(503).json(healthCheck);
  }
});

// Initialize Socket.io
initializeSocket(server);
logger.info('🔌 Socket.io initialized for real-time features');

// Start server - STANDARDIZED PORT 5000
const serverPort = PORT || 5000;
server.listen(serverPort, () => {
  logger.info(`🚀 Backend Server: http://localhost:${serverPort}`);
  logger.info(`📡 API Base URL: http://localhost:${serverPort}/api/v1`);
  logger.info(`🌐 Frontend Expected: http://localhost:3001`);
  logger.info(`🔌 Socket.io: Enabled for real-time messaging`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = server;