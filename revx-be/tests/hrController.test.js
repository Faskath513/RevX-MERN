const hrController = require('../controllers/hrController');
const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('../models/Department');
jest.mock('bcryptjs');

describe('HR Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { role: 'hr' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // Create User
  describe('createUser', () => {
    it('should create a new employee successfully', async () => {
      req.body = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee',
        employeeDetails: {
          department: 'dept123'
        }
      };

      // Mock department exists
      Department.findById.mockResolvedValue({ _id: 'dept123' });

      // Mock no existing user
      User.findOne.mockResolvedValue(null);

      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashedPassword');

      // Mock saving the user and returning a new user object with _id
      const saveMock = jest.fn().mockResolvedValue();
      User.mockImplementation(() => ({
        save: saveMock,
        _id: 'newUserId' // Important: Provide fake _id to simulate user save
      }));

      // Call the controller function
      await hrController.createUser(req, res);

      // Validate the expected response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Employee created successfully',
        userId: 'newUserId'
      });
    });
  });

  // Get All Users
  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const fakeUsers = [{ username: 'john' }, { username: 'jane' }];
      User.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeUsers),
      });

      await hrController.getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeUsers);
    });
  });

  // Get User By Id
  describe('getUserById', () => {
    it('should return user if found', async () => {
      req.params.id = 'userId123';
      const fakeUser = { username: 'john' };
      User.findById.mockResolvedValue(fakeUser);

      await hrController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'userId123';
      User.findById.mockResolvedValue(null);

      await hrController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  // Update User
  describe('updateUser', () => {
    it('should update user successfully', async () => {
      req.params.id = 'userId123';
      req.body = { username: 'newName' };

      const fakeUser = {
        username: 'oldName',
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(fakeUser);

      await hrController.updateUser(req, res, next);

      expect(fakeUser.username).toBe('newName');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'userId123';
      User.findById.mockResolvedValue(null);

      await hrController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  // Patch User
  describe('patchUser', () => {
    it('should patch user successfully', async () => {
      req.params.id = 'userId123';
      req.body = { username: 'patchedName' };

      const patchedUser = { username: 'patchedName' };
      User.findByIdAndUpdate.mockResolvedValue(patchedUser);

      await hrController.patchUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User patched successfully',
        user: patchedUser
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'userId123';
      User.findByIdAndUpdate.mockResolvedValue(null);

      await hrController.patchUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  // Delete User
  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      req.params.id = 'userId123';
      User.findByIdAndDelete.mockResolvedValue({ _id: 'userId123' });

      await hrController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'userId123';
      User.findByIdAndDelete.mockResolvedValue(null);

      await hrController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

});