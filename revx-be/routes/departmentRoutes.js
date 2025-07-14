const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const departmentController = require('../controllers/departmentController');

const router = express.Router();

// Create a new department
router.post('/create', authenticate, departmentController.createDepartment);

// Get all departments
router.get('/', authenticate, departmentController.getDepartments);

router.get('/:id', authenticate, departmentController.getDepartmentById);

// Update a department
router.put('/:id', authenticate, departmentController.updateDepartment);

// Delete a department
router.delete('/:id', authenticate, departmentController.deleteDepartment);



module.exports = router;
