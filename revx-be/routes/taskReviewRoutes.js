const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const taskReviewController = require('../controllers/taskReviewController');

//HR/Admin creates a task review cycle
router.post('/create', authenticate, taskReviewController.createTaskReview);

//HR/Admin updates a task review cycle
router.put('/:id', authenticate, taskReviewController.updateTaskReview);

//HR/Admin deletes a task review cycle
router.delete('/:id', authenticate, taskReviewController.deleteTaskReview);

//HR/Admin gets all task review cycles
router.get('/', authenticate, taskReviewController.getAllTaskReviews);

//HR/Admin or Employee gets a specific task review by ID
router.get('/view/:id', authenticate, taskReviewController.getTaskReviewById);

//Employee fetches their own task review cycles
router.get('/my-reviews', authenticate, taskReviewController.getMyTaskReviews);

//Employee submits their review
router.put('/:id/submit', authenticate, taskReviewController.submitEmployeeReview);

//HR/Admin views all submitted employee reviews
router.get('/submitted/reviews', authenticate, taskReviewController.getAllEmployeeReviews);

module.exports = router;
