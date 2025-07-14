const GoalReview = require('../models/GoalReview');
const Goal = require('../models/Goal');
const User = require('../models/User');
const Team = require('../models/Team');

// Create a goal review cycle (HR Admin assigns a review cycle to a manager)
exports.createGoalReview = async (req, res) => {
  try {
    const { hrAdminId, description, managerId, teamId, goalId, dueDate } = req.body;

    // Validate HR Admin
    const hrAdmin = await User.findById(req.user.id);
    if (!hrAdmin || hrAdmin.role !== 'hr') {
      return res.status(403).json({ message: 'HR Admin access required' });
    }

    // Validate manager
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Validate team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Validate goal
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Create Goal Review Cycle
    const newGoalReview = new GoalReview({
      hrAdminId: req.user.id,
      description,
      managerId,
      teamId,
      goalId,
      dueDate,
      status: 'Pending'
    });

    await newGoalReview.save();
    res.status(201).json({ message: 'Goal Review Cycle created successfully', goalReview: newGoalReview });
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal review cycle', error });
  }
};

// Update a goal review cycle (HR can modify details like deadline, title, team, or goal)
exports.updateGoalReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, dueDate, teamId, goalId } = req.body;

    // Find goal review
    const goalReview = await GoalReview.findById(id);
    if (!goalReview) {
      return res.status(404).json({ message: 'Goal Review Cycle not found' });
    }

    // Update fields
    if (description) goalReview.description = description;
    if (dueDate) goalReview.dueDate = dueDate;
    if (teamId) goalReview.teamId = teamId;
    if (goalId) goalReview.goalId = goalId;

    await goalReview.save();
    res.status(200).json({ message: 'Goal Review Cycle updated successfully', goalReview });
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal review cycle', error });
  }
};

// Delete a goal review cycle (HR can remove it if needed)
exports.deleteGoalReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find goal review
    const goalReview = await GoalReview.findById(id);
    if (!goalReview) {
      return res.status(404).json({ message: 'Goal Review Cycle not found' });
    }

    await GoalReview.findByIdAndDelete(id);
    res.status(200).json({ message: 'Goal Review Cycle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal review cycle', error });
  }
};

// Fetch all goal review cycles assigned by HR
exports.getAllGoalReviews = async (req, res) => {
  try {
    const goalReviews = await GoalReview.find()
      .populate('hrAdminId', 'username')
      .populate('managerId', 'username')
      .populate('teamId', 'teamName')
      .populate('goalId', 'projectTitle');

    res.status(200).json(goalReviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal review cycles', error });
  }
};

// Fetch a specific goal review cycle by ID
exports.getGoalReviewById = async (req, res) => {
  try {
    const goalReview = await GoalReview.findById(req.params.id)
      .populate('hrAdminId', 'username')
      .populate('managerId', 'username')
      .populate('teamId', 'teamName')
      .populate('goalId', 'description');

    if (!goalReview) {
      return res.status(404).json({ message: 'Goal Review Cycle not found' });
    }

    res.status(200).json(goalReview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal review cycle', error });
  }
};

// Manager submits a review for a goal
exports.submitManagerReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId, managerReview, submissionDate } = req.body;

    const goalReview = await GoalReview.findById(id);
    if (!goalReview) {
      return res.status(404).json({ message: 'Goal Review Cycle not found' });
    }

    if (goalReview.managerId.toString() !== managerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    goalReview.managerReview = managerReview;
    goalReview.status = 'Completed';
    goalReview.submissionDate = submissionDate || new Date(); // Store submission date
    
    await goalReview.save();

    res.status(200).json({ 
      message: 'Manager review submitted successfully', 
      goalReview 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting manager review', error });
  }
};