const express = require('express');
const router = express.Router();
const { updateUser } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
// Route to update a user by ID (Allowing users to update their own details)
router.put('/update/:id',authenticate,updateUser);
module.exports = router;