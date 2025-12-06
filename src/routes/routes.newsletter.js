const express = require('express');
const NewsletterController = require('../controller/controller.newsletter');
const AuthMiddleware = require('../middleware/middleware.auth');

const router = express.Router();

// Get all newsletters
router.get('/', AuthMiddleware.authenticateToken, NewsletterController.getNewsletters);

// Get featured newsletters
router.get('/featured', AuthMiddleware.authenticateToken, NewsletterController.getFeaturedNewsletters);

// Get newsletter by ID
router.get('/:id', AuthMiddleware.authenticateToken, NewsletterController.getNewsletterById);

// Add comment to newsletter
router.post('/:id/comment', AuthMiddleware.authenticateToken, NewsletterController.addComment);

module.exports = router;
