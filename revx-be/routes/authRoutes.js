// authRoutes.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { register, login, requestPasswordReset,
    confirmPasswordReset, logout ,changePassword } = require('../controllers/authController'); // Ensure logout is imported

const router = express.Router();

// Register Route - Only HR can create new users (Employee, Manager, or other HRs)
router.post('/register', register);

// Login Route - Any user (Employee, Manager, HR) can log in
router.post('/login', login);

// Forget Password - Request email with reset token
router.post('/request-reset', requestPasswordReset);

// Reset Password - Verify token and set new password
router.post('/reset-password', confirmPasswordReset);

router.post('/change-password', authenticate,changePassword);

// Logout Route - Log out the user (only client-side, no need for token invalidation in JWT)
router.post("/logout", logout); // Ensure logout function is defined in authController

module.exports = router;
