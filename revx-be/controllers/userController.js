const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Update user details by ID (users can update their own details, HR can update any)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, employeeDetails, managerDetails, hrDetails } = req.body;

  try {
    const loggedInUser = req.user;
    
    // Authorization check
    if (loggedInUser._id.toString() !== id && loggedInUser.role !== 'hr') {
      return res.status(403).json({ message: 'You can only update your own details unless you are HR' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Basic field updates
    if (username) user.username = username;
    if (email) user.email = email;

    // Password update with hashing
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Role-specific updates with proper validation
    if (employeeDetails && (loggedInUser.role === 'employee' || loggedInUser.role === 'hr')) {
      user.employeeDetails = {
        ...user.employeeDetails, // Preserve existing data
        ...employeeDetails,      // Apply updates
        department: employeeDetails.department 
          ? mongoose.Types.ObjectId(employeeDetails.department) 
          : user.employeeDetails?.department
      };
    }
    
    if (managerDetails && (loggedInUser.role === 'manager' || loggedInUser.role === 'hr')) {
      user.managerDetails = {
        ...user.managerDetails, // Preserve existing data
        ...managerDetails,      // Apply updates
        department: managerDetails.department 
          ? mongoose.Types.ObjectId(managerDetails.department) 
          : user.managerDetails?.department
      };
    }
    
    if (hrDetails && loggedInUser.role === 'hr') {
      user.hrDetails = {
        ...user.hrDetails, // Preserve existing data
        ...hrDetails       // Apply updates
      };
    }

    // Validate before saving
    await user.validate();
    const updatedUser = await user.save();

    // Return the updated user (excluding sensitive data)
    const userToReturn = updatedUser.toObject();
    delete userToReturn.password;
    
    res.status(200).json({ 
      message: 'User updated successfully', 
      user: userToReturn 
    });

  } catch (error) {
    console.error('Error updating user:', error);
    
    // Enhanced error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: error.errors 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate field value',
        field: error.keyValue ? Object.keys(error.keyValue)[0] : 'unknown'
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid ID format',
        path: error.path
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};