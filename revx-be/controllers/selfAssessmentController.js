const SelfAssessment = require('../models/SelfAssessment');
const Task = require('../models/Task');
const Feedback = require('../models/Feedback');

const selfAssessmentController = {
    submitAssessment: async (req, res) => {
        try {
            const { taskId, comments } = req.body;
            const employeeId = req.user.id;

            if (req.user.role !== 'employee') {
                return res.status(403).json({
                    success: false,
                    message: 'Only employees can submit assessments'
                });
            }

            if (!taskId) {
                return res.status(400).json({
                    success: false,
                    message: 'Task ID is required'
                });
            }

            const task = await Task.findOne({
                _id: taskId,
                employeeId: employeeId,
                status: 'completed'
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found or not assigned to you, or task not completed'
                });
            }

            // Verify manager exists on the task
            if (!task.managerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Task does not have a valid manager assigned'
                });
            }

            const existingAssessment = await SelfAssessment.findOne({
                taskId: taskId,
                employeeId: employeeId
            });

            if (existingAssessment) {
                return res.status(400).json({
                    success: false,
                    message: 'Self-assessment already submitted for this task'
                });
            }

            const newAssessment = new SelfAssessment({
                employeeId: employeeId,
                managerId: task.managerId,
                taskId: taskId,
                comments: comments,
                updatedAt: Date.now()
            });

            await newAssessment.save();

            res.status(201).json({
                success: true,
                message: 'Self-assessment submitted successfully',
                assessment: newAssessment
            });

        } catch (error) {
            console.error('Error submitting self-assessment:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },

    editAssessment: async (req, res) => {
        try {
            const { id } = req.params;
            const { comments } = req.body;
            const employeeId = req.user.id;

            const assessment = await SelfAssessment.findById(id);

            if (!assessment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assessment not found'
                });
            }

            if (assessment.employeeId.toString() !== employeeId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to edit this assessment'
                });
            }

            assessment.comments = comments || assessment.comments;
            assessment.updatedAt = Date.now();
            await assessment.save();

            res.status(200).json({
                success: true,
                message: 'Assessment updated successfully',
                assessment
            });

        } catch (error) {
            console.error('Error editing self-assessment:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },

    getManagerAssessments: async (req, res) => {
        try {
            const managerId = req.user.id;

            if (req.user.role !== 'manager') {
                return res.status(403).json({
                    success: false,
                    message: 'Only managers can view assessments'
                });
            }

            const assessments = await SelfAssessment.find({ managerId })
                .populate({
                    path: 'employeeId',
                    select: 'name email'
                })
                .populate({
                    path: 'taskId',
                    select: 'taskTitle dueDate status'
                })
                .sort({ createdAt: -1 });

            // Enrich with feedback information
            const enrichedAssessments = await Promise.all(
                assessments.map(async (assessment) => {
                    const feedback = await Feedback.findOne({
                        selfAssessmentId: assessment._id
                    });
                    return {
                        ...assessment.toObject(),
                        feedback: feedback || null,
                        feedbackStatus: feedback ? 'submitted' : 'pending'
                    };
                })
            );

            res.status(200).json({
                success: true,
                assessments: enrichedAssessments
            });

        } catch (error) {
            console.error('Error getting manager assessments:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },

    getAssessmentById: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            let query = SelfAssessment.findById(id);
            query = query.populate({
                path: 'employeeId',
                select: 'name email'
            })
                .populate({
                    path: 'taskId',
                    select: 'taskTitle dueDate status'
                })
                .populate({
                    path: 'managerId',
                    select: 'name email'
                })
                .populate({
                    path: 'feedback'
                });
            const assessment = await query;

            if (!assessment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assessment not found'
                });
            }

            if (assessment.employeeId._id && assessment.employeeId._id.toString() !== userId &&
                assessment.managerId._id && assessment.managerId._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this assessment'
                });
            }

            res.status(200).json({
                success: true,
                assessment
            });

        } catch (error) {
            console.error('Error getting assessment by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },

    deleteAssessment: async (req, res) => {
        try {
            const { id } = req.params;
            const employeeId = req.user.id;

            const assessment = await SelfAssessment.findById(id);

            if (!assessment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assessment not found'
                });
            }

            if (assessment.employeeId.toString() !== employeeId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to delete this assessment'
                });
            }

            // Delete associated feedback if exists
            if (assessment.feedback) {
                await Feedback.findByIdAndDelete(assessment.feedback);
            }

            await assessment.deleteOne();

            res.status(200).json({
                success: true,
                message: 'Self-assessment deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting assessment:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },

    getEmployeeAssessments: async (req, res) => {
        try {
            const employeeId = req.user.id;

            if (req.user.role !== 'employee') {
                return res.status(403).json({
                    success: false,
                    message: 'Only employees can view their own assessments'
                });
            }

            const completedTasks = await Task.find({
                employeeId: employeeId,
                status: 'completed'
            }).select('_id taskTitle dueDate projectId') // Add projectId here
                .populate({
                    path: 'projectId',
                    select: 'projectTitle'
                });

            const submittedAssessments = await SelfAssessment.find({ employeeId })
                .populate({
                    path: 'taskId',
                    select: 'taskTitle dueDate projectId',
                    populate: { path: 'projectId', select: 'projectTitle' }
                })
                .populate({
                    path: 'feedback'
                })
                .sort({ createdAt: -1 });

            const submittedTaskIds = submittedAssessments.map(a => a.taskId._id.toString());
            const pendingTasks = completedTasks.filter(
                task => !submittedTaskIds.includes(task._id.toString())
            );

            res.status(200).json({
                success: true,
                submittedAssessments,
                pendingTasks
            });

        } catch (error) {
            console.error('Error getting employee assessments:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
};

module.exports = selfAssessmentController;