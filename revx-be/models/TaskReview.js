const mongoose = require('mongoose');

const taskReviewSchema = new mongoose.Schema({
  hrAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // HR Admin who assigns the task review
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', // Department involved in the task
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', // Team assigned to the task
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal', // Related goal for this task
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // Related goal for this task
    required: true,
    unique: true, // Ensures one review per task
  },
  description: {
    type: String,
    required: true,
    trim: true, // Task description
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Employee assigned the task
    required: true,
  },
  dueDate: {
    type: Date,
    required: true, // Deadline for task review
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  },
  employeeReview: {
    type: String,
    trim: true, // Review submitted by the employee
  },
  submissionDate: {
    type: Date,
    default: null, // Set when employee submits review
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` before saving
taskReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const TaskReview = mongoose.model('TaskReview', taskReviewSchema);

module.exports = TaskReview;
