const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/authMiddleware');

// Manager submits feedback for a self-assessment
router.post('/submit', authenticate, feedbackController.submitFeedback);

// Manager edits their feedback
router.put('/edit/:id', authenticate, feedbackController.editFeedback);

// Manager views all feedback they have given
router.get('/manager', authenticate, feedbackController.getManagerFeedbacks);

// Employee or Manager views feedback for a specific self-assessment
router.get('/:id', authenticate, feedbackController.getFeedbackByAssessmentId);

// Manager deletes their own feedback
router.delete('/delete/:id', authenticate, feedbackController.deleteFeedback);

module.exports = router;
