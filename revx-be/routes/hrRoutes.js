const express = require('express');
const hrController = require('../controllers/hrController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to ensure authentication
router.use(authenticate);

// Create a new user (Only HR)
router.post('/create', hrController.createUser);

// Fetch all users (Only HR)
router.get('/all', hrController.getAllUsers);

// Fetch user details by ID
router.get('/fetch/:id', hrController.getUserById);

// Update a user by ID (Only HR)
router.put('/update/:id', hrController.updateUser);

// Patch (partial update) a user by ID (Only HR)
router.patch('/patch/:id', hrController.patchUser);

// Delete a user by ID (Only HR)
router.delete('/delete/:id', hrController.deleteUser);

module.exports = router;
