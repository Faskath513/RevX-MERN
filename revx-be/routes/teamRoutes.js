const express = require('express');
const {authenticate} = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

const router =express.Router();

// Create a new team
router.post('/create', authenticate, teamController.createTeam);

// Get all teams
router.get('/', authenticate, teamController.getTeams);

router.get('/:id', authenticate, teamController.getTeamById);

// Get teams by manager ID
router.get('/by-manager/:managerId', authenticate, teamController.getTeamsByManagerId);

// Update a team
router.put('/:id', authenticate, teamController.updateTeam);

// Delete a team
router.delete('/:id', authenticate, teamController.deleteTeam);

module.exports = router;