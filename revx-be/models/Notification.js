const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // The user (Manager, Employee, or HR) who receives this notification
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // The user who triggered the notification (HR or Manager or Employee)
  },
  type: {
    type: String,
    enum: ['GoalReviewCreated', 'TaskReviewCreated', 'GoalReviewSubmitted', 'TaskReviewSubmitted'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);