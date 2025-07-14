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
    comments: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('SelfAssessment', SelfAssessmentSchema);
