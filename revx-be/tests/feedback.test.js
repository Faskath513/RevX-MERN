const feedbackController = require('../controllers/feedbackController');
const Feedback = require('../models/Feedback');
const SelfAssessment = require('../models/SelfAssessment');

jest.mock('../models/Feedback');
jest.mock('../models/SelfAssessment');

const validObjectId = '507f1f77bcf86cd799439011';
const validManagerId = '507f1f77bcf86cd799439012';
const validEmployeeId = '507f1f77bcf86cd799439013';
const validAssessmentId = '507f1f77bcf86cd799439014';

let req, res;

beforeEach(() => {
  req = {};
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  jest.clearAllMocks();
});

describe('feedbackController', () => {
  describe('submitFeedback', () => {
    it('should allow manager to submit feedback for a valid assessment', async () => {
      req = {
        user: { id: validManagerId, role: 'manager' },
        body: { selfAssessmentId: validAssessmentId, feedbackText: 'Good job' }
      };
      const selfAssessmentSaveMock = jest.fn();
      const feedbackSaveMock = jest.fn();
      // Mock the chainable populate for SelfAssessment.findById
      const selfAssessmentObj = {
        _id: validAssessmentId,
        managerId: validManagerId,
        status: 'submitted',
        save: selfAssessmentSaveMock,
        feedback: undefined,
        populate: function() { return this; }
      };
      SelfAssessment.findById.mockReturnValue(selfAssessmentObj);
      Feedback.findOne.mockResolvedValue(null);
      Feedback.mockImplementation(() => ({ save: feedbackSaveMock }));
      await feedbackController.submitFeedback(req, res);
      expect(feedbackSaveMock).toHaveBeenCalled();
      expect(selfAssessmentSaveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Feedback submitted successfully',
          feedback: expect.any(Object),
          assessment: expect.any(Object)
        })
      );
    });
    it('should block non-manager from submitting feedback', async () => {
      req = {
        user: { id: validEmployeeId, role: 'employee' },
        body: { selfAssessmentId: validAssessmentId, feedbackText: 'Text' }
      };
      await feedbackController.submitFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only managers can submit feedback' });
    });
    it('should return 400 if required fields are missing', async () => {
      req = {
        user: { id: validManagerId, role: 'manager' },
        body: { selfAssessmentId: '', feedbackText: '' }
      };
      await feedbackController.submitFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Self assessment ID and feedback text are required' });
    });
    it('should return 404 if self-assessment not found or not valid', async () => {
      req = {
        user: { id: validManagerId, role: 'manager' },
        body: { selfAssessmentId: validAssessmentId, feedbackText: 'Text' }
      };
      // Mock the chainable populate for SelfAssessment.findById to return null
      const selfAssessmentObj = {
        populate: function() { return this; }
      };
      SelfAssessment.findById.mockReturnValue(selfAssessmentObj);
      // Simulate .populate() chain but no valid selfAssessment
      selfAssessmentObj.managerId = undefined;
      selfAssessmentObj.status = undefined;
      selfAssessmentObj.save = undefined;
      Feedback.findOne.mockResolvedValue(null);
      await feedbackController.submitFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Self-assessment not found' });
    });
    it('should return 400 if feedback already exists', async () => {
      req = {
        user: { id: validManagerId, role: 'manager' },
        body: { selfAssessmentId: validAssessmentId, feedbackText: 'Text' }
      };
      const selfAssessmentSaveMock = jest.fn();
      const selfAssessmentObj = {
        _id: validAssessmentId,
        managerId: validManagerId,
        status: 'submitted',
        save: selfAssessmentSaveMock,
        feedback: undefined,
        populate: function() { return this; }
      };
      SelfAssessment.findById.mockReturnValue(selfAssessmentObj);
      Feedback.findOne.mockResolvedValue({ _id: validObjectId });
      await feedbackController.submitFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback already exists for this assessment' });
    });
  });

  describe('editFeedback', () => {
    it('should allow manager to edit their feedback', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validManagerId, role: 'manager' },
        body: { feedbackText: 'Updated feedback' }
      };
      const saveMock = jest.fn();
      Feedback.findById.mockResolvedValue({
        _id: validObjectId,
        managerId: validManagerId,
        feedbackText: 'Old feedback',
        status: 'submitted',
        save: saveMock
      });
      await feedbackController.editFeedback(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Feedback updated successfully',
        feedback: expect.any(Object)
      }));
    });
    it('should return 400 if feedbackText is missing', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validManagerId, role: 'manager' },
        body: { feedbackText: '' }
      };
      await feedbackController.editFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback text is required' });
    });
    it('should return 404 if feedback not found', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validManagerId, role: 'manager' },
        body: { feedbackText: 'Text' }
      };
      Feedback.findById.mockResolvedValue(null);
      await feedbackController.editFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback not found' });
    });
    it('should return 403 if not authorized', async () => {
      req = {
        params: { id: validObjectId },
        user: { id: validEmployeeId, role: 'employee' },
        body: { feedbackText: 'Text' }
      };
      Feedback.findById.mockResolvedValue({
        _id: validObjectId,
        managerId: validManagerId
      });
      await feedbackController.editFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized to edit this feedback' });
    });
  });

  describe('getManagerFeedbacks', () => {
    it('should return pending assessments and given feedbacks for manager', async () => {
      req = { user: { id: validManagerId, role: 'manager' } };
      const pendingAssessments = [{ _id: validAssessmentId }];
      const givenFeedbacks = [{ _id: validObjectId }];
      SelfAssessment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(pendingAssessments)
      });
      Feedback.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(givenFeedbacks)
      });
      await feedbackController.getManagerFeedbacks(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ pendingAssessments, givenFeedbacks });
    });
    it('should deny access to non-managers', async () => {
      req = { user: { id: validEmployeeId, role: 'employee' } };
      await feedbackController.getManagerFeedbacks(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only managers can view feedback' });
    });
  });

  describe('getFeedbackByAssessmentId', () => {
    it('should return feedback for a specific assessment', async () => {
      req = { params: { id: validAssessmentId }, user: { id: validManagerId, role: 'manager' } };
      Feedback.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: validObjectId,
          feedbackText: 'Great work',
          managerId: validManagerId
        })
      });
      await feedbackController.getFeedbackByAssessmentId(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: validObjectId, feedbackText: 'Great work' });
    });
    it('should return 404 if feedback not found', async () => {
      req = { params: { id: validAssessmentId }, user: { id: validManagerId, role: 'manager' } };
      Feedback.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await feedbackController.getFeedbackByAssessmentId(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback not found' });
    });
  });

  describe('getFeedbackBySelfAssessmentId', () => {
    it('should return feedback for authorized user', async () => {
      req = { params: { id: validAssessmentId }, user: { id: validEmployeeId, role: 'employee' } };
      SelfAssessment.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        async then(resolve) {
          resolve({
            _id: validAssessmentId,
            employeeId: { _id: validEmployeeId, name: 'Emp', email: 'emp@mail.com' },
            managerId: { _id: validManagerId, name: 'Mgr', email: 'mgr@mail.com' }
          });
        }
      });
      Feedback.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: validObjectId, feedbackText: 'Good' }) });
      await feedbackController.getFeedbackBySelfAssessmentId(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, feedback: expect.any(Object) }));
    });
    it('should return 404 if self-assessment not found', async () => {
      req = { params: { id: validAssessmentId }, user: { id: validEmployeeId, role: 'employee' } };
      SelfAssessment.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        async then(resolve) { resolve(null); }
      });
      await feedbackController.getFeedbackBySelfAssessmentId(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Self assessment not found' });
    });
    it('should return 403 if not authorized', async () => {
      req = { params: { id: validAssessmentId }, user: { id: 'unauth', role: 'employee' } };
      SelfAssessment.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        async then(resolve) {
          resolve({
            _id: validAssessmentId,
            employeeId: { _id: validEmployeeId, name: 'Emp', email: 'emp@mail.com' },
            managerId: { _id: validManagerId, name: 'Mgr', email: 'mgr@mail.com' }
          });
        }
      });
      await feedbackController.getFeedbackBySelfAssessmentId(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to view this feedback' });
    });
  });

  describe('deleteFeedback', () => {
    it('should allow manager to delete their feedback', async () => {
      req = { params: { id: validObjectId }, user: { id: validManagerId, role: 'manager' } };
      const deleteOneMock = jest.fn();
      Feedback.findById.mockResolvedValue({
        _id: validObjectId,
        managerId: validManagerId,
        selfAssessmentId: validAssessmentId,
        deleteOne: deleteOneMock
      });
      SelfAssessment.findByIdAndUpdate.mockResolvedValue({});
      await feedbackController.deleteFeedback(req, res);
      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback deleted successfully' });
    });
    it('should return 404 if feedback not found', async () => {
      req = { params: { id: validObjectId }, user: { id: validManagerId, role: 'manager' } };
      Feedback.findById.mockResolvedValue(null);
      await feedbackController.deleteFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback not found' });
    });
    it('should return 403 if not authorized', async () => {
      req = { params: { id: validObjectId }, user: { id: validEmployeeId, role: 'employee' } };
      Feedback.findById.mockResolvedValue({
        _id: validObjectId,
        managerId: validManagerId
      });
      await feedbackController.deleteFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized to delete this feedback' });
    });
  });
});
