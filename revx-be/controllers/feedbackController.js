const Feedback = require('../models/Feedback');
const SelfAssessment = require('../models/SelfAssessment');

// Manager submits feedback for an employee's self-assessment
const submitFeedback = async (req, res) => {
    try {
        const { selfAssessmentId, feedbackText } = req.body;

        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can submit feedback' });
        }

        const assessment = await SelfAssessment.findById(selfAssessmentId);
        if (!assessment) {
            return res.status(404).json({ message: 'Self-assessment not found' });
        }

        const feedback = new Feedback({
            selfAssessmentId,
            managerId: req.user.id,
            feedbackText
        });

        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Manager edits feedback
const editFeedback = async (req, res) => {
    try {
        const { feedbackText } = req.body;
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Unauthorized to edit this feedback' });
        }

        feedback.feedbackText = feedbackText;
        feedback.updatedAt = Date.now();

        await feedback.save();
        res.json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all feedback given by the logged-in manager
const getManagerFeedbacks = async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can view feedback' });
        }

        const feedbacks = await Feedback.find({ managerId: req.user.id })
            .populate('selfAssessmentId', 'employeeId comments')
            .sort({ createdAt: -1 });

        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get feedback for a specific self-assessment (Employee or Manager)
const getFeedbackByAssessmentId = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ selfAssessmentId: req.params.id })
            .populate('managerId', 'name email');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete feedback (Only the manager who created it can delete)
const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Unauthorized to delete this feedback' });
        }

        await feedback.deleteOne();
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    submitFeedback,
    editFeedback,
    getManagerFeedbacks,
    getFeedbackByAssessmentId,
    deleteFeedback
};
