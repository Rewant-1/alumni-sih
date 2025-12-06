const express = require('express');
const SurveyController = require('../controller/controller.survey');
const AuthMiddleware = require('../middleware/middleware.auth');

const router = express.Router();

// Get all surveys (active by default)
router.get('/', AuthMiddleware.authenticateToken, SurveyController.getSurveys);

// Get my survey responses
router.get('/my/responses', AuthMiddleware.authenticateToken, SurveyController.getMyResponses);

// Get survey by ID
router.get('/:id', AuthMiddleware.authenticateToken, SurveyController.getSurveyById);

// Submit survey response
router.post('/:id/respond', AuthMiddleware.authenticateToken, SurveyController.submitResponse);

module.exports = router;
