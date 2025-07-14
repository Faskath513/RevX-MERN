const Task = require('../models/Task');
const Goal = require('../models/Goal');
const User = require('../models/User');

// Manager or HR assigns a new task to an employee
exports.createTask = async (req, res) => {
  const { projectId, taskTitle, startDate, dueDate, description, employeeId, priority } = req.body;

  try {
    // Validate if the Goal (Project) exists
    const project = await Goal.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: 'Invalid projectId: Goal not found' });
    }

    // Validate if the Employee exists
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({ message: 'Invalid employeeId: Employee not found' });
    }

    // Create new task
    const newTask = new Task({
      projectId,
      taskTitle,
      startDate,
      dueDate,
      status: 'scheduled',
      description,
      managerId: req.user.id, // Task creator
      priority,
      employeeId,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

// Get all tasks (HR/Admin: all, Manager: own)
exports.getAllTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'manager') {
      // Manager can see only tasks they created
      tasks = await Task.find({ managerId: req.user.id })
        .populate('projectId')
        .populate('employeeId')
        .populate('managerId');
    } else if (req.user.role === 'hr' || req.user.role === 'admin') {
      // HR and Admin can see all tasks
      tasks = await Task.find()
        .populate('projectId')
        .populate('employeeId')
        .populate('managerId');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Get all tasks assigned to an employee
exports.getTasksForEmployee = async (req, res) => {
  try {
    const tasks = await Task.find({ employeeId: req.user.id })
      .populate('projectId');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId')
      .populate('employeeId')
      .populate('managerId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    task.updatedAt = Date.now();

    await task.save();
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

// Get all tasks for a specific goal (project)
exports.getTasksByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const goal = await Goal.findById(projectId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal (Project) not found' });
    }

    const tasks = await Task.find({ projectId })
      .populate('employeeId')
      .populate('managerId')
      .populate('projectId');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks for the project', error });
  }
};

// Get the employee assigned to a specific task ID
exports.getEmployeeForTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('employeeId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.employeeId) {
      return res.status(404).json({ message: 'No employee assigned to this task' });
    }

    res.status(200).json(task.employeeId);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee for task', error });
  }
};


exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If status is being updated to completed, set completion date
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
    }

    Object.assign(task, req.body);
    task.updatedAt = Date.now();

    await task.save();
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};