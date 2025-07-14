const TaskReview = require('../models/TaskReview');
const Goal = require('../models/Goal');
const User = require('../models/User');
const Team = require('../models/Team');
const Department = require('../models/Department');
const Task = require('../models/Task');

// HR creates a Task Review Cycle
exports.createTaskReview = async (req, res) => {
  try {
    const {
      departmentId,
      teamId,
      projectId,
      taskId,
      description,
      dueDate,
      employeeId
    } = req.body;

    // Check if requester is HR
    const hrAdmin = await User.findById(req.user.id);
    if (!hrAdmin || hrAdmin.role !== 'hr') {
      return res.status(403).json({ message: 'HR Admin access required' });
    }

    // Validate references
    const [department, team, goal, task, employee] = await Promise.all([
      Department.findById(departmentId),
      Team.findById(teamId),
      Goal.findById(projectId),
      Task.findById(taskId),
      User.findById(employeeId)
    ]);

    if (!department) return res.status(404).json({ message: 'Department not found' });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Create Task Review
    const taskReview = new TaskReview({
      hrAdminId: req.user.id,
      departmentId,
      teamId,
      projectId,
      taskId,
      description,
      employeeId,
      dueDate,
      status: 'Pending'
    });

    await taskReview.save();
    res.status(201).json({ message: 'Task Review created successfully', taskReview });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task review', error });
  }
};

// HR updates a Task Review Cycle
exports.updateTaskReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      dueDate,
      teamId,
      projectId,
      taskId,
      departmentId,
      employeeId
    } = req.body;

    const taskReview = await TaskReview.findById(id);
    if (!taskReview) return res.status(404).json({ message: 'Task Review not found' });

    // Update fields only if provided
    if (description) taskReview.description = description;
    if (dueDate) taskReview.dueDate = dueDate;

    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      taskReview.teamId = teamId;
    }

    if (projectId) {
      const goal = await Goal.findById(projectId);
      if (!goal) return res.status(404).json({ message: 'Goal not found' });
      taskReview.projectId = projectId;
    }

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) return res.status(404).json({ message: 'Department not found' });
      taskReview.departmentId = departmentId;
    }

    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      taskReview.taskId = taskId;
    }

    if (employeeId) {
      const employee = await User.findById(employeeId);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      taskReview.employeeId = employeeId;
    }

    await taskReview.save();
    res.status(200).json({ message: 'Task Review updated successfully', taskReview });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task review', error });
  }
};

// HR deletes a Task Review Cycle
exports.deleteTaskReview = async (req, res) => {
  try {
    const { id } = req.params;

    const taskReview = await TaskReview.findById(id);
    if (!taskReview) return res.status(404).json({ message: 'Task Review not found' });

    await TaskReview.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task review', error });
  }
};

// HR gets all Task Review Cycles
exports.getAllTaskReviews = async (req, res) => {
  try {
    const taskReviews = await TaskReview.find()
      .populate('hrAdminId', 'username')
      .populate('departmentId', 'departmentName')
      .populate('teamId', 'teamName')
      .populate('projectId', 'projectTitle')
      .populate('taskId', 'taskTitle')
      .populate('employeeId', 'username');

    res.status(200).json(taskReviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task reviews', error });
  }
};

// HR or Employee gets a single Task Review by ID
exports.getTaskReviewById = async (req, res) => {
  try {
    const taskReview = await TaskReview.findById(req.params.id)
      .populate('hrAdminId', 'username')
      .populate('departmentId', 'departmentName')
      .populate('teamId', 'teamName')
      .populate('projectId', 'projectTitle')
      .populate('taskId', 'taskTitle')
      .populate('employeeId', 'username');

    if (!taskReview) return res.status(404).json({ message: 'Task Review not found' });

    res.status(200).json(taskReview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task review', error });
  }
};

// Employee submits a Task Review
exports.submitEmployeeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeReview } = req.body;

    const taskReview = await TaskReview.findById(id);
    if (!taskReview) return res.status(404).json({ message: 'Task Review not found' });

    if (taskReview.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: Not assigned to this task' });
    }

    taskReview.employeeReview = employeeReview;
    taskReview.status = 'Completed';
    taskReview.submissionDate = new Date();

    await taskReview.save();
    res.status(200).json({ message: 'Task review submitted successfully', taskReview });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting task review', error });
  }
};

// HR views all employee-submitted reviews
exports.getAllEmployeeReviews = async (req, res) => {
  try {
    const hrAdmin = await User.findById(req.user.id);
    if (!hrAdmin || hrAdmin.role !== 'hr') {
      return res.status(403).json({ message: 'HR Admin access required' });
    }

    const reviews = await TaskReview.find({ employeeReview: { $exists: true, $ne: null } })
      .populate('employeeId', 'username')
      .populate('taskId', 'taskTitle')
      .select('taskId employeeId employeeReview submissionDate');

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee reviews', error });
  }
};
