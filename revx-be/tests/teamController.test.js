const teamController = require('../controllers/teamController');
const Team = require('../models/Team');
const User = require('../models/User');
const Department = require('../models/Department');

jest.mock('../models/Team');
jest.mock('../models/User');
jest.mock('../models/Department');

describe('Team Controller', () => {
  let req, res, next;

  // Example valid ObjectIds
  const validUserId1 = '5f8d0f3d6f4b3d2a3c6e1a2b';
  const validUserId2 = '5f8d0f3d6f4b3d2a3c6e1a2c';
  const validDeptId = '5f8d0f3d6f4b3d2a3c6e1a2d';
  const validTeamId = '5f8d0f3d6f4b3d2a3c6e1a2e';

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: validUserId1 },
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // Create Team
  describe('createTeam', () => {
    it('should create a new team with valid members and department', async () => {
      req.body = {
        teamName: 'Alpha Team',
        members: [validUserId1, validUserId2],
        departmentId: validDeptId
      };

      // Mocks for User and Department
      User.find.mockResolvedValue([{_id: validUserId1}, {_id: validUserId2}]);
      Department.findById.mockResolvedValue({_id: validDeptId});

      // Mock Team constructor and save
      Team.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: validTeamId })
      }));

      // Mock chained populate for Team.findById(...).populate().populate()
      const mockPopulatedTeam = {
        _id: validTeamId,
        teamName: 'Alpha Team',
        members: [{ username: 'john' }, { username: 'jane' }],
        departmentId: { departmentName: 'Engineering' }
      };
      Team.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPopulatedTeam)
        })
      });

      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team created successfully',
        team: mockPopulatedTeam
      });
    });

    it('should reject invalid member IDs', async () => {
      req.body = {
        teamName: 'Invalid Team',
        members: [validUserId1, 'invalidUserId']
      };

      User.find.mockResolvedValue([{_id: validUserId1}]);
      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid member IDs'
      });
    });

    it('should reject invalid department ID format', async () => {
      req.body = {
        teamName: 'Alpha Team',
        members: [validUserId1],
        departmentId: 'invalidDeptId'
      };

      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid department ID'
      });
    });

    it('should reject non-existent department', async () => {
      req.body = {
        teamName: 'Alpha Team',
        members: [validUserId1],
        departmentId: validDeptId
      };

      User.find.mockResolvedValue([{_id: validUserId1}]);
      Department.findById.mockResolvedValue(null);

      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Department not found'
      });
    });
  });

  // Get Teams
  describe('getTeams', () => {
    it('should return all teams with populated data', async () => {
      const mockTeams = [{
        _id: validTeamId,
        teamName: 'Alpha Team',
        members: [{_id: validUserId1, username: 'john', email: 'john@example.com', role: 'employee'}],
        departmentId: {departmentName: 'Engineering'},
        createdBy: {username: 'hruser'}
      }];

      // Mock chained populates
      Team.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockTeams)
          })
        })
      });

      await teamController.getTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTeams);
    });

    it('should filter by department', async () => {
      req.query.departmentId = validDeptId;

      const mockTeams = [];
      Team.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockTeams)
          })
        })
      });

      await teamController.getTeams(req, res);

      expect(Team.find).toHaveBeenCalledWith({ departmentId: validDeptId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTeams);
    });
  });

  // Update Team
  describe('updateTeam', () => {
    it('should update team details successfully', async () => {
      req.params.id = validTeamId;
      req.body = {
        teamName: 'Updated Team',
        members: [validUserId2],
        departmentId: validDeptId
      };

      const mockTeam = {
        _id: validTeamId,
        teamName: 'Original Team',
        members: [],
        departmentId: null,
        save: jest.fn().mockResolvedValue({
          _id: validTeamId,
          teamName: 'Updated Team',
          members: [validUserId2],
          departmentId: validDeptId
        })
      };

      User.find.mockResolvedValue([{_id: validUserId2}]);
      Department.findById.mockResolvedValue({_id: validDeptId});
      Team.findById.mockResolvedValue(mockTeam);

      // Mock populate for response
      const mockPopulated = {
        _id: validTeamId,
        teamName: 'Updated Team',
        members: [{_id: validUserId2, username: 'jane'}],
        departmentId: {departmentName: 'Engineering'}
      };
      Team.findById.mockReturnValueOnce(mockTeam).mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPopulated)
        })
      });

      await teamController.updateTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team updated successfully',
        team: mockPopulated
      });
    });

    it('should return 404 if team not found', async () => {
      req.params.id = validTeamId;
      Team.findById.mockResolvedValue(null);

      await teamController.updateTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team not found'
      });
    });

    it('should return 400 if invalid member IDs', async () => {
      req.params.id = validTeamId;
      req.body = { members: [validUserId1, 'invalidUserId'] };

      Team.findById.mockResolvedValue({
        _id: validTeamId,
        teamName: 'Team',
        members: [],
        save: jest.fn()
      });
      User.find.mockResolvedValue([{_id: validUserId1}]);

      await teamController.updateTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid member IDs'
      });
    });

    it('should return 400 if invalid department ID format', async () => {
      req.params.id = validTeamId;
      req.body = { departmentId: 'invalidDeptId' };

      Team.findById.mockResolvedValue({
        _id: validTeamId,
        teamName: 'Team',
        members: [],
        save: jest.fn()
      });

      await teamController.updateTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid department ID'
      });
    });

    it('should return 400 if department not found', async () => {
      req.params.id = validTeamId;
      req.body = { departmentId: validDeptId };

      Team.findById.mockResolvedValue({
        _id: validTeamId,
        teamName: 'Team',
        members: [],
        save: jest.fn()
      });
      Department.findById.mockResolvedValue(null);

      await teamController.updateTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Department not found'
      });
    });
  });

  // Get Team By ID
  describe('getTeamById', () => {
    it('should return team details with populated data', async () => {
      req.params.id = validTeamId;

      const mockPopulatedTeam = {
        _id: validTeamId,
        teamName: 'Alpha Team',
        members: [{_id: validUserId1, username: 'john', email: 'john@example.com', role: 'employee'}],
        departmentId: {departmentName: 'Engineering'},
        createdBy: {username: 'hruser'}
      };

      // Mock chained populates
      Team.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockPopulatedTeam)
          })
        })
      });

      await teamController.getTeamById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPopulatedTeam);
    });

    it('should reject invalid team ID format', async () => {
      req.params.id = 'invalid';

      await teamController.getTeamById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid team ID format'
      });
    });

    it('should return 404 if team not found', async () => {
      req.params.id = validTeamId;

      // Mock chained populates returning null
      Team.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      });

      await teamController.getTeamById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team not found'
      });
    });
  });

  // Delete Team
  describe('deleteTeam', () => {
    it('should delete an existing team', async () => {
      req.params.id = validTeamId;
      Team.findByIdAndDelete.mockResolvedValue({ _id: validTeamId });

      await teamController.deleteTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team deleted successfully'
      });
    });

    it('should handle non-existent team deletion', async () => {
      req.params.id = validTeamId;
      Team.findByIdAndDelete.mockResolvedValue(null);

      await teamController.deleteTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team not found'
      });
    });
  });
});
