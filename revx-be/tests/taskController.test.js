const taskController = require('../controllers/taskController');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const User = require('../models/User');

jest.mock('../models/Task');
jest.mock('../models/Goal');
jest.mock('../models/User');

describe('Task Controller', () => {
  let req, res;

  // Valid ObjectIds
  const projectId = '5f8d0f3d6f4b3d2a3c6e1a2b';
  const employeeId = '5f8d0f3d6f4b3d2a3c6e1a2c';
  const managerId = '5f8d0f3d6f4b3d2a3c6e1a2d';
  const taskId = '5f8d0f3d6f4b3d2a3c6e1a2e';

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

  // Create Task
  describe('createTask', () => {
    it('should create task successfully with valid data', async () => {
      req.body = {
        projectId,
        taskTitle: 'New Task',
        startDate: '2025-06-01',
        dueDate: '2025-06-05',
        description: 'Task description',
        employeeId,
        priority: 'high'
      };

      // Mocks
      Goal.findById.mockResolvedValue({ _id: projectId });
      User.findById.mockResolvedValue({ _id: employeeId, role: 'employee' });
      
      const mockTask = {
        _id: taskId,
        ...req.body,
        managerId,
        save: jest.fn().mockResolvedValue(true)
      };
      Task.mockImplementation(() => mockTask);

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task created successfully',
        task: mockTask
      });
    });

    it('should reject invalid project ID', async () => {
      Goal.findById.mockResolvedValue(null);
      await taskController.createTask(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // Get All Tasks
  describe('getAllTasks', () => {
    it('should return all tasks with populated data', async () => {
      const mockTasks = [{
        _id: taskId,
        taskTitle: 'Task 1',
        projectId: { _id: projectId },
        employeeId: { username: 'employee1' },
        managerId: { username: 'manager1' }
      }];

      Task.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockTasks)
          })
        })
      });

      await taskController.getAllTasks(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });
  });

  // Get Employee Tasks
  describe('getTasksForEmployee', () => {
    it('should return tasks for current employee', async () => {
      req.user.id = employeeId;
      const mockTasks = [{ 
        _id: taskId, 
        taskTitle: 'Employee Task',
        projectId: { projectTitle: 'Project X' }
      }];

      Task.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });

      await taskController.getTasksForEmployee(req, res);
      expect(Task.find).toHaveBeenCalledWith({ employeeId });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // Get Task By ID
  describe('getTaskById', () => {
    it('should return task details with populated data', async () => {
      req.params.id = taskId;
      const mockTask = {
        _id: taskId,
        taskTitle: 'Specific Task',
        status: 'in-progress',
        projectId: { _id: projectId },
        employeeId: { username: 'employee1' }
      };

      Task.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockTask)
          })
        })
      });

      await taskController.getTaskById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 for non-existent task', async () => {
      req.params.id = taskId;
      Task.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      });
      await taskController.getTaskById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Update Task
  describe('updateTask', () => {
    it('should update task fields successfully', async () => {
      req.params.id = taskId;
      req.body = { status: 'completed', priority: 'low' };

      const mockTask = {
        _id: taskId,
        status: 'scheduled',
        priority: 'medium',
        save: jest.fn().mockResolvedValue(true)
      };

      Task.findById.mockResolvedValue(mockTask);
      await taskController.updateTask(req, res);

      expect(mockTask.status).toBe('completed');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject invalid status update', async () => {
      req.params.id = taskId;
      req.body = { status: 'invalid' };

      const mockTask = {
        _id: taskId,
        status: 'scheduled',
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };

      Task.findById.mockResolvedValue(mockTask);
      await taskController.updateTask(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Delete Task
  describe('deleteTask', () => {
    it('should delete existing task', async () => {
      req.params.id = taskId;
      Task.findByIdAndDelete.mockResolvedValue({ _id: taskId });
      await taskController.deleteTask(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task deleted successfully'
      });
    });

    it('should handle non-existent task deletion', async () => {
      req.params.id = taskId;
      Task.findByIdAndDelete.mockResolvedValue(null);
      await taskController.deleteTask(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task not found'
      });
    });
  });
});
