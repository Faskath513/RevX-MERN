const mongoose = require('mongoose');

const goalReviewSchema = new mongoose.Schema({
  hrAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // HR Admin who assigns the review Cycle to Manager 
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The manager assigned to review the goal to hr Admin
    required: true,
  },
  teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true  //Team hasbeen assigned to specific goal and teams are under a manger
    },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal', // Each goal has one review cycle
    required: true,
    unique: true, // Ensures one review per goal
  },
 
  dueDate: {
    type: Date,
    required: true, // The deadline for review
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending', // Tracks if the review is done
  },
  managerReview: {
    type: String,
    trim: true, //Review  from the manager
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  submissionDate: {  // 👈 Add this new field
    type: Date,
    default: null, // Null until review is completed
  },
});

// Middleware to update `updatedAt` before saving
goalReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const GoalReview = mongoose.model('GoalReview', goalReviewSchema);

module.exports = GoalReview;
