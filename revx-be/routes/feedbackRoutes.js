const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/authMiddleware');

// Manager submits feedback for a self-assessment
router.post('/submit', authenticate, feedbackController.submitFeedback);

// Manager edits their feedback
router.put('/edit/:id', authenticate, feedbackController.editFeedback);

// Manager views all feedback (pending and given)
router.get('/manager', authenticate, feedbackController.getManagerFeedbacks);

// View feedback for a specific self-assessment
router.get('/assessment/:id', authenticate, feedbackController.getFeedbackByAssessmentId);

// Get feedback by self-assessment ID
router.get('/self-assessment/:id', authenticate, feedbackController.getFeedbackBySelfAssessmentId);

// Manager deletes their feedback
router.delete('/delete/:id', authenticate, feedbackController.deleteFeedback);

module.exports = router;