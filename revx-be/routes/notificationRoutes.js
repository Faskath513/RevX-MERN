const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware'); // Adjust based on your auth setup

// 1. Get notifications for logged-in user
router.get('/', authenticate, notificationController.getUserNotifications);

// 2. Mark a single notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// 3. Mark all notifications as read
router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);

// 4. Get unread notification count
router.get('/unread-count', authenticate, notificationController.getUnreadNotificationCount);

// -------------------- New Routes -------------------- //

// 5. Delete a single notification (owned by the user)
router.delete('/:id', authenticate, notificationController.deleteNotification);

// 6. Trigger reminders for due GoalReviews and TaskReviews
// (Optional: protect with admin-only middleware if needed)
router.post('/send-reminders', authenticate, notificationController.sendDueReviewReminders);

module.exports = router;
