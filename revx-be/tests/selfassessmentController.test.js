const selfAssessmentController = require('../controllers/selfAssessmentController');
const SelfAssessment = require('../models/SelfAssessment');
const User = require('../models/User');
const Task = require('../models/Task');
const Feedback = require('../models/Feedback');

jest.mock('../models/SelfAssessment');
jest.mock('../models/User');
jest.mock('../models/Task');
jest.mock('../models/Feedback');

const validObjectId = '507f1f77bcf86cd799439011';
const validTaskId = '507f1f77bcf86cd799439012';
const validManagerId = '507f1f77bcf86cd799439013';
const validFeedbackId = '507f1f77bcf86cd799439014';

describe('SelfAssessment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('submitAssessment', () => {
    it('should allow employee to submit assessment to valid manager', async () => {
      req = {
        user: { id: validObjectId, role: 'employee' },
        body: { taskId: validTaskId, comments: 'Great job' }
      };

      Task.findOne.mockResolvedValue({
        _id: validTaskId,
        employeeId: validObjectId,
        status: 'completed',
        managerId: validManagerId
      });
      SelfAssessment.findOne.mockResolvedValue(null);
      const saveMock = jest.fn();
      SelfAssessment.mockImplementation(() => ({ save: saveMock }));

      await selfAssessmentController.submitAssessment(req, res);

      expect(Task.findOne).toHaveBeenCalledWith({
        _id: validTaskId,
        employeeId: validObjectId,
        status: 'completed'
      });
      expect(SelfAssessment.findOne).toHaveBeenCalledWith({
        taskId: validTaskId,
        employeeId: validObjectId
      });
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Self-assessment submitted successfully',
          success: true
        })
      );
    });

    it('should block non-employee from submitting', async () => {
      req = {
        user: { id: validObjectId, role: 'manager' },
        body: { taskId: validTaskId, comments: 'Text' }
      };

      await selfAssessmentController.submitAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only employees can submit assessments'
      });
    });

    it('should return 404 for invalid or incomplete task', async () => {
      req = {
        user: { id: validObjectId, role: 'employee' },
        body: { taskId: validTaskId, comments: 'Text' }
      };

      Task.findOne.mockResolvedValue(null);

      await selfAssessmentController.submitAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found or not assigned to you, or task not completed'
      });
    });
  });

  describe('editAssessment', () => {
    it('should allow employee to edit their assessment', async () => {
      const saveMock = jest.fn();
      req = {
        params: { id: validObjectId },
        user: { id: validObjectId, role: 'employee' },
        body: { comments: 'Updated comments' }
      };
      SelfAssessment.findById.mockResolvedValue({
        _id: validObjectId,
        employeeId: validObjectId,
        comments: 'Old comments',
        save: saveMock
      });
      await selfAssessmentController.editAssessment(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Assessment updated successfully',
        success: true
      }));
    });
    it('should return 404 if assessment not found', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validObjectId, role: 'employee' },
        body: { comments: 'New comment' }
      };
      SelfAssessment.findById.mockResolvedValue(null);
      await selfAssessmentController.editAssessment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Assessment not found' });
    });
    it('should deny edit for non-owner', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validManagerId, role: 'employee' },
        body: { comments: 'New comment' }
      };
      SelfAssessment.findById.mockResolvedValue({
        _id: validObjectId,
        employeeId: validObjectId
      });
      await selfAssessmentController.editAssessment(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authorized to edit this assessment' });
    });
  });

  describe('getManagerAssessments', () => {
    it('should return assessments for manager', async () => {
      req = {
        user: { id: validManagerId, role: 'manager' }
      };
      const mockAssessments = [{
        _id: validObjectId,
        employeeId: { _id: validObjectId, name: 'Emp', email: 'emp@mail.com' },
        taskId: { _id: validTaskId, taskTitle: 'Task', dueDate: '2024-01-01', status: 'completed' },
        toObject: function() { return this; }
      }];
      SelfAssessment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAssessments)
      });
      Feedback.findOne.mockResolvedValue(null);
      await selfAssessmentController.getManagerAssessments(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        assessments: expect.any(Array)
      }));
    });

    it('should deny access to non-managers', async () => {
      req = { user: { id: validObjectId, role: 'employee' } };

      await selfAssessmentController.getManagerAssessments(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Only managers can view assessments' });
    });
  });

  describe('getEmployeeAssessments', () => {
    it('should return assessments for employee', async () => {
      req = {
        user: { id: validObjectId, role: 'employee' }
      };
      const completedTasks = [{ _id: validTaskId, taskTitle: 'Task', dueDate: '2024-01-01' }];
      const submittedAssessments = [{
        _id: validObjectId,
        taskId: { _id: validTaskId, taskTitle: 'Task', dueDate: '2024-01-01' },
        feedback: null
      }];
      Task.find.mockReturnValue({ select: jest.fn().mockResolvedValue(completedTasks) });
      SelfAssessment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(submittedAssessments)
      });
      await selfAssessmentController.getEmployeeAssessments(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        submittedAssessments: expect.any(Array),
        pendingTasks: expect.any(Array)
      }));
    });

    it('should deny access to non-employees', async () => {
      req = { user: { id: validManagerId, role: 'manager' } };

      await selfAssessmentController.getEmployeeAssessments(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Only employees can view their own assessments' });
    });
  });

  describe('getAssessmentById', () => {
    it('should return assessment if found', async () => {
      req = { params: { id: validObjectId }, user: { id: validObjectId, role: 'employee' } };
      const assessment = {
        _id: validObjectId,
        employeeId: { _id: validObjectId, name: 'Emp', email: 'emp@mail.com' },
        managerId: { _id: validManagerId, name: 'Mgr', email: 'mgr@mail.com' },
        taskId: { _id: validTaskId, taskTitle: 'Task', dueDate: '2024-01-01', status: 'completed' },
        feedback: null
      };
      // Mock chained populate
      const populateMock = jest.fn().mockReturnThis();
      SelfAssessment.findById.mockReturnValue({
        populate: populateMock,
        then: undefined,
        // Simulate await
        async then(resolve) { resolve(assessment); }
      });
      // Actually, controller uses await query, so we can just mock as async function
      SelfAssessment.findById.mockImplementation(() => {
        const chain = {
          populate: function() { return chain; },
          then: undefined,
          async then(resolve) { resolve(assessment); }
        };
        return chain;
      });
      await selfAssessmentController.getAssessmentById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        assessment: expect.any(Object)
      }));
    });
    it('should return 404 if not found', async () => {
      req = { params: { id: validObjectId }, user: { id: validObjectId, role: 'employee' } };
      // Mock chained populate returning null
      SelfAssessment.findById.mockImplementation(() => {
        const chain = {
          populate: function() { return chain; },
          then: undefined,
          async then(resolve) { resolve(null); }
        };
        return chain;
      });
      await selfAssessmentController.getAssessmentById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Assessment not found' });
    });
  });

  describe('deleteAssessment', () => {
    it('should delete assessment if owned by employee', async () => {
      const deleteOneMock = jest.fn();
      req = {
        params: { id: validObjectId },
        user: { id: validObjectId, role: 'employee' }
      };
      SelfAssessment.findById.mockResolvedValue({
        _id: validObjectId,
        employeeId: validObjectId,
        deleteOne: deleteOneMock
      });
      await selfAssessmentController.deleteAssessment(req, res);
      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Self-assessment deleted successfully' });
    });
    it('should return 403 for non-employee', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validManagerId, role: 'manager' }
      };
      SelfAssessment.findById.mockResolvedValue({
        _id: validObjectId,
        employeeId: validObjectId
      });
      await selfAssessmentController.deleteAssessment(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized to delete this assessment' });
    });
    it('should return 404 if assessment not found', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validObjectId, role: 'employee' }
      };
      SelfAssessment.findById.mockResolvedValue(null);
      await selfAssessmentController.deleteAssessment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Assessment not found' });
    });
  });
});
