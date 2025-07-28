const Goal = require('../models/Goal');
const User = require('../models/User');
const Team = require('../models/Team');

// Manager creates goal for their team
exports.createGoal = async (req, res) => {
  const { projectTitle, startDate, dueDate, description, teamId } = req.body;

  try {
    // Validate manager exists
    const manager = await User.findById(req.user.id);
    if (!manager || manager.role !== 'manager') {
      return res.status(403).json({ message: 'Manager access required' });
    }

    // Validate team exists and manager is assigned
    const team = await Team.findOne({ 
      _id: teamId
    });
    if (!team) {
      return res.status(404).json({ message: 'Team not found under your management' });
    }

    

    const newGoal = new Goal({
      projectTitle,
      startDate,
      dueDate,
      status: 'scheduled',
      description,
      teamId,
      managerId: req.user.id
    });

    await newGoal.save();
    
    res.status(201).json({ 
      message: 'Goal created successfully', 
      goal: await Goal.findById(newGoal._id)
        .populate('teamId', 'teamName')
        .populate('managerId', 'username')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error });
  }
};

// Get all goals for manager
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ managerId: req.user.id })
      .populate('teamId', 'teamName')
      .populate('managerId', 'username')

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error });
  }
};
// Get all goals for HR
exports.getAllGoalsForHR = async (req, res) => {
  try {
    const goals = await Goal.find()
      .populate('teamId', 'teamName')
      .populate('managerId', 'username');

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all goals for HR', error });
  }
};

// Get a goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.projectId)
      .populate('teamId', 'teamName')
      .populate('managerId', 'username');

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal', error });
  }
};


// Get goals for a specific team
exports.getTeamGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ teamId: req.params.teamId })
      .populate('teamId', 'teamName')
      .populate('managerId', 'username');
      
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team goals', error });
  }
};

// Update goal (manager only)
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      managerId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    // Update other fields
    if (req.body.projectTitle) goal.projectTitle = req.body.projectTitle;
    if (req.body.startDate) goal.startDate = req.body.startDate;
    if (req.body.dueDate) goal.dueDate = req.body.dueDate;
    if (req.body.status) goal.status = req.body.status;
    if (req.body.description) goal.description = req.body.description;

    await goal.save();
    
    res.status(200).json({ 
      message: 'Goal updated successfully',
      goal: await Goal.findById(goal._id)
        .populate('teamId', 'teamName')
        .populate('managerId', 'username')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error });
  }
};

// Delete goal (manager only)
exports.deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      managerId: req.user.id
    });

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }
    
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error });
  }
};
