const goalController = require('../controllers/goalController');
const Goal = require('../models/Goal');
const User = require('../models/User');
const Team = require('../models/Team');

jest.mock('../models/Goal');
jest.mock('../models/User');
jest.mock('../models/Team');

describe('Goal Controller', () => {
  let req, res;

  // Valid ObjectIds
  const managerId = '5f8d0f3d6f4b3d2a3c6e1a2b';
  const teamId = '5f8d0f3d6f4b3d2a3c6e1a2c';
  const goalId = '5f8d0f3d6f4b3d2a3c6e1a2d';

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: managerId }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  // Create Goal
  describe('createGoal', () => {
    it('should create goal successfully', async () => {
      req.body = {
        projectTitle: 'New Project',
        startDate: '2025-06-01',
        dueDate: '2025-07-01',
        description: 'Project description',
        teamId
      };

      // Mocks
      User.findById.mockResolvedValue({ _id: managerId, role: 'manager' });
      Team.findOne.mockResolvedValue({ _id: teamId });
      const mockSave = jest.fn().mockResolvedValue({ _id: goalId });
      Goal.mockImplementation(() => ({ save: mockSave }));
      
      // Mock populate chain
      const mockPopulated = {
        _id: goalId,
        projectTitle: 'New Project',
        teamId: { teamName: 'Dev Team' },
        managerId: { username: 'manager1' }
      };
      Goal.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPopulated)
        })
      });

      await goalController.createGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Goal created successfully',
        goal: mockPopulated
      });
    });

    it('should reject non-manager users', async () => {
      User.findById.mockResolvedValue({ role: 'employee' });
      await goalController.createGoal(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // Get All Goals
  describe('getAllGoals', () => {
    it('should return manager goals', async () => {
      const mockGoals = [{
        _id: goalId,
        projectTitle: 'Project 1',
        teamId: { teamName: 'Team A' }
      }];

      Goal.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGoals)
        })
      });

      await goalController.getAllGoals(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoals);
    });
  });

  // Get Goal By ID
  describe('getGoalById', () => {
    it('should return goal details', async () => {
      req.params.projectId = goalId;
      const mockGoal = {
        _id: goalId,
        projectTitle: 'Project X',
        status: 'scheduled'
      };

      Goal.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGoal)
        })
      });

      await goalController.getGoalById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // Get Team Goals
  describe('getTeamGoals', () => {
    it('should return team-specific goals', async () => {
      req.params.teamId = teamId;
      const mockGoals = [{
        _id: goalId,
        teamId: { teamName: 'Team B' }
      }];

      Goal.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGoals)
        })
      });

      await goalController.getTeamGoals(req, res);
      expect(Goal.find).toHaveBeenCalledWith({ teamId });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // Update Goal
  describe('updateGoal', () => {
    it('should update goal successfully', async () => {
      req.params.id = goalId;
      req.body = { projectTitle: 'Updated Title', status: 'in-progress' };

      const mockGoal = {
        _id: goalId,
        managerId,
        save: jest.fn().mockResolvedValue(true)
      };

      Goal.findOne.mockResolvedValue(mockGoal);
      
      // Mock populate after update
      const mockPopulated = {
        ...mockGoal,
        projectTitle: 'Updated Title',
        status: 'in-progress'
      };
      Goal.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPopulated)
        })
      });

      await goalController.updateGoal(req, res);
      expect(mockGoal.projectTitle).toBe('Updated Title');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // Delete Goal
  describe('deleteGoal', () => {
    it('should delete authorized goal', async () => {
      req.params.id = goalId;
      Goal.findOneAndDelete.mockResolvedValue({ _id: goalId });
      
      await goalController.deleteGoal(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject unauthorized deletion', async () => {
      Goal.findOneAndDelete.mockResolvedValue(null);
      await goalController.deleteGoal(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
