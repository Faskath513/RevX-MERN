const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const goalReviewController = require('../controllers/goalReviewController');

// HR Admin creates a goal review cycle
router.post('/create', authenticate, goalReviewController.createGoalReview);

// HR/Admin updates a goal review cycle
router.put('/:id', authenticate, goalReviewController.updateGoalReview);

// HR/Admin deletes a goal review cycle
router.delete('/:id', authenticate, goalReviewController.deleteGoalReview);

// Get all goal review cycles
router.get('/', authenticate, goalReviewController.getAllGoalReviews);

// Get a specific goal review cycle by ID
router.get('/:id', authenticate, goalReviewController.getGoalReviewById);

// Manager submits a review for a goal
router.put('/:id/review', authenticate, goalReviewController.submitManagerReview);

module.exports = router;
