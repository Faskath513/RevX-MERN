const feedbackController = require('../controllers/feedbackController');
const Feedback = require('../models/Feedback');
const SelfAssessment = require('../models/SelfAssessment');

jest.mock('../models/Feedback');
jest.mock('../models/SelfAssessment');

describe('Feedback Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should allow manager to submit feedback', async () => {
      req.user = { id: 'manager1', role: 'manager' };
      req.body = { selfAssessmentId: 'assessment1', feedbackText: 'Well done!' };

      SelfAssessment.findById.mockResolvedValue({ id: 'assessment1' });
      const saveMock = jest.fn();
      Feedback.mockImplementation(() => ({ save: saveMock }));

      await feedbackController.submitFeedback(req, res);

      expect(SelfAssessment.findById).toHaveBeenCalledWith('assessment1');
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Feedback submitted successfully'
      }));
    });

    it('should block non-manager from submitting feedback', async () => {
      req.user = { id: 'emp1', role: 'employee' };
      req.body = { selfAssessmentId: 'assessment1', feedbackText: 'Good' };

      await feedbackController.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only managers can submit feedback' });
    });

    it('should return 404 if self-assessment not found', async () => {
      req.user = { id: 'manager1', role: 'manager' };
      req.body = { selfAssessmentId: 'missing', feedbackText: 'Feedback' };

      SelfAssessment.findById.mockResolvedValue(null);

      await feedbackController.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Self-assessment not found' });
    });
  });

  describe('editFeedback', () => {
    it('should allow manager to edit feedback', async () => {
      const saveMock = jest.fn();
      req = {
        params: { id: 'f1' },
        user: { id: 'manager1', role: 'manager' },
        body: { feedbackText: 'Updated feedback' }
      };

      Feedback.findById.mockResolvedValue({ feedbackText: 'Old', save: saveMock });

      await feedbackController.editFeedback(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Feedback updated successfully'
      }));
    });

    it('should return 404 if feedback not found', async () => {
      req = { params: { id: 'f2' }, user: { role: 'manager' }, body: { feedbackText: 'Text' } };

      Feedback.findById.mockResolvedValue(null);

      await feedbackController.editFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback not found' });
    });

    it('should deny edit for non-manager', async () => {
      req = {
        params: { id: 'f1' },
        user: { id: 'u1', role: 'employee' },
        body: { feedbackText: 'Text' }
      };

      Feedback.findById.mockResolvedValue({});

      await feedbackController.editFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized to edit this feedback' });
    });
  });

  describe('getManagerFeedbacks', () => {
    it('should return feedbacks for manager', async () => {
      req.user = { id: 'manager1', role: 'manager' };

      const mockSort = jest.fn().mockResolvedValue([{ id: 'f1' }]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });

      Feedback.find.mockReturnValue({ populate: mockPopulate });

      await feedbackController.getManagerFeedbacks(req, res);

      expect(res.json).toHaveBeenCalledWith([{ id: 'f1' }]);
    });

    it('should deny access for non-managers', async () => {
      req.user = { role: 'employee' };

      await feedbackController.getManagerFeedbacks(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only managers can view feedback' });
    });
  });

  describe('getFeedbackByAssessmentId', () => {
    it('should return feedback for assessment', async () => {
      req.params = { id: 'assessment1' };

      Feedback.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ id: 'f1', feedbackText: 'Nice' })
      });

      await feedbackController.getFeedbackByAssessmentId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'f1', feedbackText: 'Nice' });
    });

    it('should return 404 if feedback not found', async () => {
      req.params = { id: 'notfound' };
      Feedback.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await feedbackController.getFeedbackByAssessmentId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback not found' });
    });
  });

  describe('deleteFeedback', () => {
    it('should allow manager to delete feedback', async () => {
      const deleteMock = jest.fn();
      req = { params: { id: 'f1' }, user: { id: 'm1', role: 'manager' } };

      Feedback.findById.mockResolvedValue({ deleteOne: deleteMock });

      await feedbackController.deleteFeedback(req, res);

      expect(deleteMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback deleted successfully' });
    });

    it('should return 404 if feedback not found', async () => {
      req = { params: { id: 'f404' }, user: { role: 'manager' } };

      Feedback.findById.mockResolvedValue(null);

      await feedbackController.deleteFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback not found' });
    });

    it('should block non-manager from deleting', async () => {
      req = { params: { id: 'f1' }, user: { role: 'employee' } };

      Feedback.findById.mockResolvedValue({});

      await feedbackController.deleteFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized to delete this feedback' });
    });
  });
});
