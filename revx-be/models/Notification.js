const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'GoalReviewCreated',
      'TaskReviewCreated',
      'GoalReviewSubmitted',
      'TaskReviewSubmitted',
      'Reminder'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId }, // Optional
  entityType: {
    type: String,
    enum: ['GoalReview', 'TaskReview'],
    required: false
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);
