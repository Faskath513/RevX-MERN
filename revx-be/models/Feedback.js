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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
