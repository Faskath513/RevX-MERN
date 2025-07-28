const mongoose = require('mongoose');

const SelfAssessmentSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        ref: 'Task',
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    feedback: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback'
    },
    comments: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'completed'],
        default: 'submitted'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Add indexes for better performance
SelfAssessmentSchema.index({ comments: 'text' });
SelfAssessmentSchema.index({ managerId: 1 });
SelfAssessmentSchema.index({ employeeId: 1 });
SelfAssessmentSchema.index({ taskId: 1 });

module.exports = mongoose.model('SelfAssessment', SelfAssessmentSchema);