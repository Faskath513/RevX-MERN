const TaskReview = require('../models/TaskReview');
const Goal = require('../models/Goal');
const User = require('../models/User');
const Team = require('../models/Team');
const Department = require('../models/Department');
const Task = require('../models/Task');
const {
  notifyEmployeeOnTaskReviewCreated,
  notifyHROnTaskReviewSubmitted
} = require('../controllers/notificationController');

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

    const hrAdmin = await User.findById(req.user.id);
    if (!hrAdmin || hrAdmin.role !== 'hr') {
      return res.status(403).json({ message: 'HR Admin access required' });
    }

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

    const taskReview = new TaskReview({
      hrAdminId: req.user.id,
      departmentId,
      teamId,
      projectId,
      taskId,
      description,
      employeeId,
      dueDate,
      taskDueDate: task.dueDate, // Store the task's actual due date
      status: 'Pending'
    });

    await taskReview.save();
    await notifyEmployeeOnTaskReviewCreated(taskReview);

    res.status(201).json({ message: 'Task Review created successfully', taskReview });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task review', error });
  }
};

// HR updates a Task Review Cycle (preserve past data if not updated)
exports.updateTaskReview = async (req, res) => {
  try {
    // Only HR can update
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. Only HR can update task review cycles.' });
    }

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

    if (description !== undefined) taskReview.description = description;
    if (dueDate !== undefined) taskReview.dueDate = dueDate;

    if (teamId !== undefined && teamId !== taskReview.teamId.toString()) {
      const team = await Team.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      taskReview.teamId = teamId;
    }

    if (projectId !== undefined && projectId !== taskReview.projectId.toString()) {
      const goal = await Goal.findById(projectId);
      if (!goal) return res.status(404).json({ message: 'Goal not found' });
      taskReview.projectId = projectId;
    }

    if (departmentId !== undefined && departmentId !== taskReview.departmentId.toString()) {
      const department = await Department.findById(departmentId);
      if (!department) return res.status(404).json({ message: 'Department not found' });
      taskReview.departmentId = departmentId;
    }

    if (taskId !== undefined && taskId !== taskReview.taskId.toString()) {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      taskReview.taskId = taskId;
      taskReview.taskDueDate = task.dueDate; // Update taskDueDate if taskId changes
    }

    if (employeeId !== undefined && employeeId !== taskReview.employeeId.toString()) {
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
    // Check if the user is an HR admin
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Unauthorized: Only HR can delete task reviews' });
    }

    const { id } = req.params;

    const taskReview = await TaskReview.findById(id);
    if (!taskReview) {
      return res.status(404).json({ message: 'Task Review not found' });
    }

    await TaskReview.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task review', error });
  }
};


// HR gets all Task Review Cycles
exports.getAllTaskReviews = async (req, res) => {
  try {
    const hrAdmin = await User.findById(req.user.id);
    if (!hrAdmin || hrAdmin.role !== 'hr') {
      return res.status(403).json({ message: 'HR Admin access required' });
    }

    const taskReviews = await TaskReview.find()
      .populate('hrAdminId', 'username')
      .populate('departmentId', 'departmentName')
      .populate('teamId', 'teamName')
      .populate('projectId', 'projectTitle')
      .populate('taskId', 'taskTitle dueDate')
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
      .populate('taskId', 'taskTitle dueDate')
      .populate('employeeId', 'username');

    if (!taskReview) return res.status(404).json({ message: 'Task Review not found' });

    if (
      req.user.role !== 'hr' &&
      taskReview.employeeId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json(taskReview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task review', error });
  }
};

// Employee views only their Task Reviews
exports.getMyTaskReviews = async (req, res) => {
  try {
    const employee = await User.findById(req.user.id);
    if (!employee || employee.role !== 'employee') {
      return res.status(403).json({ message: 'Employee access required' });
    }

    const myReviews = await TaskReview.find({ employeeId: req.user.id })
      .populate('taskId', 'taskTitle dueDate')
      .populate('projectId', 'projectTitle')
      .populate('departmentId', 'departmentName')
      .populate('teamId', 'teamName')
      .populate('hrAdminId', 'username');

    res.status(200).json(myReviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your task reviews', error });
  }
};

// Employee submits review (only for their own task)
exports.submitEmployeeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeReview } = req.body;

    const taskReview = await TaskReview.findById(id);
    if (!taskReview) return res.status(404).json({ message: 'Task Review not found' });

    if (taskReview.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: Not your review' });
    }

    taskReview.employeeReview = employeeReview;
    taskReview.status = 'Completed';
    taskReview.submissionDate = new Date();

    await taskReview.save();
    await notifyHROnTaskReviewSubmitted(taskReview);

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
      .populate('taskId', 'taskTitle dueDate')
      .select('taskId employeeId employeeReview submissionDate');

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee reviews', error });
  }
};
