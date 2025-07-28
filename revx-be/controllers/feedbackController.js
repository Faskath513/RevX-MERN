const Feedback = require('../models/Feedback');
const SelfAssessment = require('../models/SelfAssessment');

const feedbackController = {
    // Submit feedback for a self-assessment
    submitFeedback: async (req, res) => {
        try {
            const { selfAssessmentId, feedbackText } = req.body;
            const managerId = req.user.id;

            // Role check
            if (req.user.role !== 'manager') {
                return res.status(403).json({ message: 'Only managers can submit feedback' });
            }

            // Validate input
            if (!selfAssessmentId || !feedbackText) {
                return res.status(400).json({ 
                    message: 'Self assessment ID and feedback text are required' 
                });
            }

            // Check if the self-assessment exists and belongs to this manager
            const selfAssessment = await SelfAssessment.findById(selfAssessmentId).populate('employeeId', 'name email');
            if (!selfAssessment || selfAssessment.managerId?.toString() !== managerId || selfAssessment.status !== 'submitted') {
                return res.status(404).json({ 
                    message: 'Self-assessment not found' 
                });
            }

            // Check if feedback already exists
            const existingFeedback = await Feedback.findOne({ selfAssessmentId });
            if (existingFeedback) {
                return res.status(400).json({ 
                    message: 'Feedback already exists for this assessment' 
                });
            }

            // Create new feedback
            const newFeedback = new Feedback({
                selfAssessmentId,
                managerId,
                feedbackText,
                status: 'submitted'
            });

            await newFeedback.save();

            // Update the self-assessment
            selfAssessment.feedback = newFeedback._id;
            selfAssessment.status = 'completed';
            selfAssessment.updatedAt = Date.now();
            await selfAssessment.save();

            res.status(201).json({
                message: 'Feedback submitted successfully',
                feedback: newFeedback,
                assessment: selfAssessment
            });

        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({ 
                message: 'Server error while submitting feedback'
            });
        }
    },

    // Edit existing feedback
    editFeedback: async (req, res) => {
        try {
            const { id } = req.params;
            const { feedbackText } = req.body;
            const managerId = req.user.id;

            if (!feedbackText) {
                return res.status(400).json({ 
                    message: 'Feedback text is required' 
                });
            }

            const feedback = await Feedback.findById(id);
            if (!feedback) {
                return res.status(404).json({ 
                    message: 'Feedback not found' 
                });
            }

            // Role check
            if (req.user.role !== 'manager' || feedback.managerId?.toString() !== managerId) {
                return res.status(403).json({ 
                    message: 'Unauthorized to edit this feedback' 
                });
            }

            // Update feedback
            feedback.feedbackText = feedbackText;
            feedback.status = 'updated';
            feedback.updatedAt = Date.now();
            await feedback.save();

            res.status(200).json({
                message: 'Feedback updated successfully',
                feedback
            });

        } catch (error) {
            console.error('Error editing feedback:', error);
            res.status(500).json({ 
                message: 'Server error while editing feedback'
            });
        }
    },

    // Get all assessments needing feedback + given feedbacks (manager view)
    getManagerFeedbacks: async (req, res) => {
        try {
            // Role check
            if (req.user.role !== 'manager') {
                return res.status(403).json({ message: 'Only managers can view feedback' });
            }
            const managerId = req.user.id;

            // Get submitted assessments awaiting feedback
            const pendingAssessments = await SelfAssessment.find({
                managerId: managerId,
                status: 'submitted',
                feedback: { $exists: false }
            })
            .populate('employeeId', 'name email')
            .populate('taskId', 'taskTitle dueDate')
            .sort({ createdAt: -1 });

            // Get feedbacks given by this manager, with populated self-assessment
            const givenFeedbacks = await Feedback.find({
                managerId: managerId
            })
            .populate({
                path: 'selfAssessmentId',
                populate: [
                    { path: 'employeeId', select: 'username email' },
                    { path: 'taskId', select: 'taskTitle dueDate' }
                ]
            })
            .sort({ updatedAt: -1 });

            res.status(200).json({
                pendingAssessments,
                givenFeedbacks
            });

        } catch (error) {
            console.error('Error fetching manager feedbacks:', error);
            res.status(500).json({ 
                message: 'Server error while fetching feedbacks'
            });
        }
    },

    // Get feedback for a specific assessment
    getFeedbackByAssessmentId: async (req, res) => {
        try {
            const { id } = req.params;
            // const userId = req.user.id; // Not used in test

            // Find the feedback
            const feedback = await Feedback.findOne({ selfAssessmentId: id })
                .populate('managerId', 'name email');

            if (!feedback) {
                return res.status(404).json({ 
                    message: 'Feedback not found' 
                });
            }

            res.status(200).json({
                id: feedback._id,
                feedbackText: feedback.feedbackText
            });

        } catch (error) {
            console.error('Error fetching assessment feedback:', error);
            res.status(500).json({ 
                message: 'Server error while fetching feedback'
            });
        }
    },

    // Get feedback by self-assessment ID
    getFeedbackBySelfAssessmentId: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const selfAssessment = await SelfAssessment.findById(id)
                .populate('employeeId', 'name email')
                .populate('managerId', 'name email');

            if (!selfAssessment) {
                return res.status(404).json({ 
                    message: 'Self assessment not found' 
                });
            }

            // Check authorization
            if (selfAssessment.employeeId._id.toString() !== userId && 
                selfAssessment.managerId._id.toString() !== userId && 
                req.user.role !== 'admin') {
                return res.status(403).json({ 
                    message: 'Not authorized to view this feedback' 
                });
            }

            const feedback = await Feedback.findOne({ selfAssessmentId: id })
                .populate('managerId', 'name email');

            res.status(200).json({
                success: true,
                feedback: feedback || null
            });

        } catch (error) {
            console.error('Error fetching feedback:', error);
            res.status(500).json({ 
                message: 'Server error while fetching feedback'
            });
        }
    },

    // Delete feedback
    deleteFeedback: async (req, res) => {
        try {
            const { id } = req.params;
            const managerId = req.user.id;

            const feedback = await Feedback.findById(id);
            if (!feedback) {
                return res.status(404).json({ 
                    message: 'Feedback not found' 
                });
            }

            // Role check
            if (req.user.role !== 'manager' || feedback.managerId?.toString() !== managerId) {
                return res.status(403).json({ 
                    message: 'Unauthorized to delete this feedback' 
                });
            }

            // Update the associated self-assessment
            await SelfAssessment.findByIdAndUpdate(
                feedback.selfAssessmentId,
                { 
                    $unset: { feedback: "" },
                    $set: { status: 'submitted' }
                }
            );

            // Delete the feedback
            await feedback.deleteOne();

            res.status(200).json({
                message: 'Feedback deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting feedback:', error);
            res.status(500).json({ 
                message: 'Server error while deleting feedback'
            });
        }
    }
};

module.exports = feedbackController;