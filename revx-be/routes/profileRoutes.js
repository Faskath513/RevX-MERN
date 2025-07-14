const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { uploadProfilePicture, getProfilePicture } = require('../controllers/profileController');

router.post('/upload-profile-picture', authenticate, uploadProfilePicture);
router.get('/:id/profile-picture', authenticate, getProfilePicture);

module.exports = router;