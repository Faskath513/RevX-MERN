// controllers/selfAssessmentController.js
const SelfAssessment = require('../models/SelfAssessment');
const User = require('../models/User');

// Submit Self-Assessment (Employee -> Manager)
const submitAssessment = async (req, res) => {
    try {
        const { managerId, taskId, comments } = req.body;

        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Only employees can submit assessments' });
        }

        const manager = await User.findById(managerId);
        if (!manager || manager.role !== 'manager') {
            return res.status(400).json({ message: 'Invalid manager ID' });
        }

        // const task = await User.findById(taskId);
        // if (!task !== 'task') {
        //     return res.status(400).json({ message: 'Task not selected' });
        // }

        const assessment = new SelfAssessment({
            employeeId: req.user.id,
            managerId: managerId,
            taskId,
            comments
        });

        await assessment.save();
        res.status(201).json({ message: 'Self-assessment submitted successfully', assessment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Edit Self-Assessment (Employee)
const editAssessment = async (req, res) => {
    try {
        const { comments } = req.body;
        const assessment = await SelfAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Unauthorized to edit this assessment' });
        }

        assessment.comments = comments;
        assessment.updatedAt = Date.now();

        await assessment.save();
        res.json({ message: 'Self-assessment updated successfully', assessment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Assessments for Manager
const getManagerAssessments = async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can view assessments' });
        }

        const assessments = await SelfAssessment.find({ managerId: req.user.id })
            .populate('employeeId', 'name email')
            .sort({ createdAt: -1 });

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Single Assessment by ID (Employee or Manager)
const getAssessmentById = async (req, res) => {
    try {
        const assessment = await SelfAssessment.findById(req.params.id).populate('employeeId', 'name email');

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        if (req.user.role === 'employee') {
            return res.status(200).json(assessment);
        }

        if (req.user.role === 'manager') {
            return res.status(200).json(assessment);
        }

         res.status(403).json({ message: 'Unauthorized to view this assessment' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Self-Assessments for the Logged-in Employee
const getEmployeeAssessments = async (req, res) => {
    try {
        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Only employees can view their own assessments' });
        }

        const assessments = await SelfAssessment.find({ employeeId: req.user.id })
            .populate('managerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Delete Self-Assessment (Only Employee Can Delete Their Own)
const deleteAssessment = async (req, res) => {
    try {
        const assessment = await SelfAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Unauthorized to delete this assessment' });
        }

        await assessment.deleteOne();
        res.json({ message: 'Self-assessment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Exporting all functions at once using module.exports
module.exports = {
    submitAssessment,
    editAssessment,
    getManagerAssessments,
    getAssessmentById,
    deleteAssessment,
    getEmployeeAssessments,
};

