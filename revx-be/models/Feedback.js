const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    selfAssessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SelfAssessment',
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feedbackText: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'updated'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Add text index for search functionality
FeedbackSchema.index({ feedbackText: 'text' });

module.exports = mongoose.model('Feedback', FeedbackSchema);