const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const taskReviewController = require('../controllers/taskReviewController');

// HR Admin creates a task review cycle
router.post('/create', authenticate, taskReviewController.createTaskReview);

// HR/Admin updates a task review cycle
router.put('/:id', authenticate, taskReviewController.updateTaskReview);

// HR/Admin deletes a task review cycle
router.delete('/:id', authenticate, taskReviewController.deleteTaskReview);

// Get all task review cycles
router.get('/', authenticate, taskReviewController.getAllTaskReviews);

// Get a specific task review cycle by ID
router.get('/:id', authenticate, taskReviewController.getTaskReviewById);

// Employee submits their task review
router.put('/:id/submit', authenticate, taskReviewController.submitEmployeeReview);

// HR views all submitted employee reviews
router.get('/submitted/reviews', authenticate, taskReviewController.getAllEmployeeReviews);

module.exports = router;
