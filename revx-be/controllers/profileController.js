const User = require('../models/User');
const upload = require('../config/storageConfig');  // Multer configuration

exports.uploadProfilePicture = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        try {
            // Find the user by their ID
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Store the uploaded image as binary data directly in MongoDB
            user.profilePicture = {
                data: req.file.buffer,  // Directly store the file buffer in MongoDB
                contentType: req.file.mimetype  // Store the file's MIME type
            };

            // Save the updated user document
            await user.save();

            res.status(200).json({
                message: 'Profile picture uploaded and saved in MongoDB successfully',
            });
        } catch (error) {
            console.error('Error saving profile picture:', error);
            res.status(500).json({ error: 'Failed to update profile picture' });
        }
    });
};
exports.getProfilePicture = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.profilePicture) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }

        // Set the appropriate response type and send the image data as a response
        res.set('Content-Type', user.profilePicture.contentType);  // Set the image MIME type
        res.status(200).send(user.profilePicture.data);  // Send the image as binary data
    } catch (error) {
        console.error('Error retrieving profile picture:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};