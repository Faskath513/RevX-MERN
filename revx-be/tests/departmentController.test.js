const departmentController = require('../controllers/departmentController');
const Department = require('../models/Department');
const mongoose = require('mongoose');

jest.mock('../models/Department');

describe('Department Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { 
      body: {}, 
      params: {}, 
      user: { id: 'hrUserId123' } 
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // Create Department
  describe('createDepartment', () => {
    it('should create a new department successfully', async () => {
      req.body = {
        departmentName: 'Engineering',
        description: 'Software development team'
      };

      const mockDepartment = {
        _id: 'dept123',
        departmentName: 'Engineering',
        description: 'Software development team',
        createdBy: 'hrUserId123',
        save: jest.fn().mockResolvedValue(true)
      };

      Department.mockImplementation(() => mockDepartment);

      await departmentController.createDepartment(req, res);

      expect(Department).toHaveBeenCalledWith({
        departmentName: 'Engineering',
        description: 'Software development team',
        createdBy: 'hrUserId123'
      });
      expect(mockDepartment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Department created successfully',
        department: mockDepartment
      });
    });

    it('should handle errors when creating department', async () => {
      req.body = {
        departmentName: 'Engineering',
        description: 'Software development team'
      };

      const error = new Error('Database error');
      Department.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error)
      }));

      await departmentController.createDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating department',
        error: error
      });
    });
  });

  // Get All Departments
  describe('getDepartments', () => {
    it('should return all departments', async () => {
      const mockDepartments = [
        { departmentName: 'Engineering' },
        { departmentName: 'HR' }
      ];

      Department.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDepartments)
      });

      await departmentController.getDepartments(req, res);

      expect(Department.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDepartments);
    });

    it('should handle errors when fetching departments', async () => {
      const error = new Error('Database error');
      Department.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error)
      });

      await departmentController.getDepartments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching departments',
        error: error
      });
    });
  });

  // Get Department By ID
  describe('getDepartmentById', () => {
    it('should return department if found', async () => {
      req.params.id = 'dept123';
      const mockDepartment = { 
        _id: 'dept123', 
        departmentName: 'Engineering' 
      };

      Department.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDepartment)
      });

      await departmentController.getDepartmentById(req, res);

      expect(Department.findById).toHaveBeenCalledWith('dept123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDepartment);
    });

    it('should return 404 if department not found', async () => {
      req.params.id = 'dept123';
      Department.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await departmentController.getDepartmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Department not found' 
      });
    });

    it('should handle errors when fetching department', async () => {
      req.params.id = 'dept123';
      const error = new Error('Database error');
      Department.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error)
      });

      await departmentController.getDepartmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching department',
        error: error
      });
    });
  });

  // Update Department
  describe('updateDepartment', () => {
    it('should update department successfully', async () => {
      req.params.id = 'dept123';
      req.body = {
        departmentName: 'Engineering Updated',
        description: 'Updated description'
      };

      const mockDepartment = {
        _id: 'dept123',
        departmentName: 'Engineering',
        description: 'Original description',
        save: jest.fn().mockResolvedValue(true)
      };

      Department.findById.mockResolvedValue(mockDepartment);

      await departmentController.updateDepartment(req, res);

      expect(mockDepartment.departmentName).toBe('Engineering Updated');
      expect(mockDepartment.description).toBe('Updated description');
      expect(mockDepartment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Department updated successfully',
        department: mockDepartment
      });
    });

    it('should return 404 if department not found', async () => {
      req.params.id = 'dept123';
      Department.findById.mockResolvedValue(null);

      await departmentController.updateDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Department not found' 
      });
    });

    it('should handle errors when updating department', async () => {
      req.params.id = 'dept123';
      req.body = { departmentName: 'Engineering Updated' };
      const error = new Error('Database error');

      Department.findById.mockResolvedValue({
        _id: 'dept123',
        departmentName: 'Engineering',
        save: jest.fn().mockRejectedValue(error)
      });

      await departmentController.updateDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error updating department',
        error: error
      });
    });
  });

  // Delete Department
  describe('deleteDepartment', () => {
    it('should delete department successfully', async () => {
      req.params.id = 'dept123';
      const mockDepartment = { _id: 'dept123' };
      Department.findByIdAndDelete.mockResolvedValue(mockDepartment);

      await departmentController.deleteDepartment(req, res);

      expect(Department.findByIdAndDelete).toHaveBeenCalledWith('dept123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Department deleted successfully'
      });
    });

    it('should return 404 if department not found', async () => {
      req.params.id = 'dept123';
      Department.findByIdAndDelete.mockResolvedValue(null);

      await departmentController.deleteDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Department not found' 
      });
    });

    it('should handle errors when deleting department', async () => {
      req.params.id = 'dept123';
      const error = new Error('Database error');
      Department.findByIdAndDelete.mockRejectedValue(error);

      await departmentController.deleteDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error deleting department',
        error: error
      });
    });
  });
});