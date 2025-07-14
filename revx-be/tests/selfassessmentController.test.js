const selfAssessmentController = require('../controllers/selfAssessmentController');
const SelfAssessment = require('../models/SelfAssessment');
const User = require('../models/User');

jest.mock('../models/SelfAssessment');
jest.mock('../models/User');

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
        user: { id: '123', role: 'employee' },
        body: { managerId: '456', taskId: '789', comments: 'Great job' }
      };

      User.findById.mockResolvedValue({ id: '456', role: 'manager' });
      const saveMock = jest.fn();
      SelfAssessment.mockImplementation(() => ({ save: saveMock }));

      await selfAssessmentController.submitAssessment(req, res);

      expect(User.findById).toHaveBeenCalledWith('456');
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Self-assessment submitted successfully'
        })
      );
    });

    it('should block non-employee from submitting', async () => {
      req = {
        user: { id: '123', role: 'manager' },
        body: { managerId: '456', taskId: '789', comments: 'Text' }
      };

      await selfAssessmentController.submitAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only employees can submit assessments'
      });
    });

    it('should return 400 for invalid manager', async () => {
      req = {
        user: { id: '123', role: 'employee' },
        body: { managerId: '999', taskId: '789', comments: 'Text' }
      };

      User.findById.mockResolvedValue(null);

      await selfAssessmentController.submitAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid manager ID'
      });
    });
  });

  describe('editAssessment', () => {
    it('should allow employee to edit their assessment', async () => {
      const saveMock = jest.fn();

      req = {
        params: { id: '1' },
        user: { id: '123', role: 'employee' },
        body: { comments: 'Updated comments' }
      };

      SelfAssessment.findById.mockResolvedValue({
        id: '1',
        employeeId: '123',
        save: saveMock
      });

      await selfAssessmentController.editAssessment(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Self-assessment updated successfully'
      }));
    });

    it('should return 404 if assessment not found', async () => {
      req = {
        params: { id: '1' },
        user: { id: '123', role: 'employee' },
        body: { comments: 'New comment' }
      };

      SelfAssessment.findById.mockResolvedValue(null);

      await selfAssessmentController.editAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Assessment not found' });
    });

    it('should deny edit for non-employee', async () => {
      req = {
        params: { id: '1' },
        user: { id: '123', role: 'manager' },
        body: { comments: 'New comment' }
      };

      SelfAssessment.findById.mockResolvedValue({ id: '1' });

      await selfAssessmentController.editAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized to edit this assessment'
      });
    });
  });

  describe('getManagerAssessments', () => {
    it('should return assessments for manager', async () => {
      req = {
        user: { id: '456', role: 'manager' }
      };

      const mockData = [{ id: '1' }];
      SelfAssessment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockData)
      });

      await selfAssessmentController.getManagerAssessments(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should deny access to non-managers', async () => {
      req = { user: { role: 'employee' } };

      await selfAssessmentController.getManagerAssessments(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only managers can view assessments'
      });
    });
  });

  describe('getEmployeeAssessments', () => {
    it('should return assessments for employee', async () => {
      req = {
        user: { id: '123', role: 'employee' }
      };

      const mockData = [{ id: '1' }];
      SelfAssessment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockData)
      });

      await selfAssessmentController.getEmployeeAssessments(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should deny access to non-employees', async () => {
      req = { user: { role: 'manager' } };

      await selfAssessmentController.getEmployeeAssessments(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only employees can view their own assessments'
      });
    });
  });

  describe('getAssessmentById', () => {
    it('should return assessment if found', async () => {
      req = { params: { id: '1' }, user: { role: 'employee' } };

      const assessment = { id: '1' };
      SelfAssessment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(assessment)
      });

      await selfAssessmentController.getAssessmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(assessment);
    });

    it('should return 404 if not found', async () => {
      req = { params: { id: '1' }, user: { role: 'employee' } };

      SelfAssessment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await selfAssessmentController.getAssessmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Assessment not found' });
    });
  });

  describe('deleteAssessment', () => {
    it('should delete assessment if owned by employee', async () => {
      const deleteOneMock = jest.fn();

      req = {
        params: { id: '1' },
        user: { id: '123', role: 'employee' }
      };

      SelfAssessment.findById.mockResolvedValue({
        id: '1',
        employeeId: '123',
        deleteOne: deleteOneMock
      });

      await selfAssessmentController.deleteAssessment(req, res);

      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Self-assessment deleted successfully' });
    });

    it('should return 403 for non-employee', async () => {
      req = {
        params: { id: '1' },
        user: { role: 'manager' }
      };

      SelfAssessment.findById.mockResolvedValue({ id: '1' });

      await selfAssessmentController.deleteAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized to delete this assessment'
      });
    });

    it('should return 404 if assessment not found', async () => {
      req = {
        params: { id: '1' },
        user: { id: '123', role: 'employee' }
      };

      SelfAssessment.findById.mockResolvedValue(null);

      await selfAssessmentController.deleteAssessment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Assessment not found' });
    });
  });
});
