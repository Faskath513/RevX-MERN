const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  createTask,
  getTasksForEmployee,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProjectId, 
  getEmployeeForTask
} = require('../controllers/taskController');

const router = express.Router();

// Create a new task (Manager assigns task)
router.post('/create', authenticate, createTask);

// Get all tasks (Admin/Manager)
router.get('/all', authenticate, getAllTasks);

// Get tasks assigned to the logged-in employee
router.get('/', authenticate, getTasksForEmployee);

//Get all tasks for a specific project/goal by project ID
router.get('/project/:projectId', authenticate, getTasksByProjectId);

// Get a single task by ID
router.get('/:id', authenticate, getTaskById);

//Get employee assigned to a specific task
router.get('/task/:taskId/employee', authenticate, getEmployeeForTask);


// Update a task
router.put('/:id', authenticate, updateTask);

// Delete a task
router.delete('/:id', authenticate, deleteTask);

module.exports = router;