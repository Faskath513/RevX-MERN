const express = require('express');
const router = express.Router();
const selfAssessmentController = require('../controllers/selfAssessmentController');
const { authenticate } = require('../middleware/authMiddleware');

// Employee submits a self-assessment
router.post('/submit', authenticate, selfAssessmentController.submitAssessment);

// Employee edits their own assessment
router.put('/edit/:id', authenticate, selfAssessmentController.editAssessment);

// Manager views all self-assessments submitted to them
router.get('/manager', authenticate, selfAssessmentController.getManagerAssessments);

// Employee or Manager views a specific self-assessment
router.get('/:id', authenticate, selfAssessmentController.getAssessmentById);

// Employee deletes their own self-assessment
router.delete('/delete/:id', authenticate, selfAssessmentController.deleteAssessment);

// Employee views all their own self-assessments
router.get('/employee/mine', authenticate, selfAssessmentController.getEmployeeAssessments);

module.exports = router;