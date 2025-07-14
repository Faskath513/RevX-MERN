const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'employee',
          employeeDetails: { department: 'Engineering' },
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.prototype.save = jest.fn().mockResolvedValue();

      await authController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: 'testuser' }, { email: 'test@example.com' }] });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('registered successfully') }));
    });

    it('should not register if username or email exists', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123', role: 'employee' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findOne.mockResolvedValue({ username: 'testuser' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username or Email already exists' });
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const req = { body: { username: 'testuser', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const fakeUser = {
        _id: 'userId123',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'employee',
        employeeDetails: { department: 'Engineering' },
      };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'fake-jwt-token',
        username: 'testuser',
        role: 'employee',
      }));
    });

    it('should return 400 if user not found', async () => {
      const req = { body: { username: 'testuser', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    });

    it('should return 400 if password is incorrect', async () => {
      const req = { body: { username: 'testuser', password: 'wrongpassword' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const fakeUser = { username: 'testuser', password: 'hashedPassword', role: 'employee', employeeDetails: {} };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', newPassword: 'newpassword123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const fakeUser = { username: 'testuser', email: 'test@example.com', save: jest.fn() };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await authController.resetPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser', email: 'test@example.com' });
      expect(fakeUser.password).toBe('newHashedPassword');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successful' });
    });

    it('should return 400 if user not found', async () => {
      const req = { body: { username: 'wronguser', email: 'wrong@example.com', newPassword: 'newpassword123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findOne.mockResolvedValue(null);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with the provided username and email not found' });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = {};
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authController.logout(req, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        'authToken=; Max-Age=0; path=/; HttpOnly; SameSite=Strict'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});