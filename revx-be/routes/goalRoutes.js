const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  createGoal,
  getTeamGoals,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');

router.post('/create', authenticate, createGoal);
router.get('/', authenticate, getAllGoals);
router.get('/:projectId', authenticate, getGoalById);
router.get('/team/:teamId', authenticate, getTeamGoals);
router.put('/:id', authenticate, updateGoal);
router.delete('/:id', authenticate, deleteGoal);

module.exports = router;
