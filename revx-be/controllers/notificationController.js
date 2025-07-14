const Notification = require('../models/Notification');
const User = require('../models/User');
const GoalReview = require('../models/GoalReview');
const TaskReview = require('../models/TaskReview');


// 1. When GoalReview is created (Notify Manager)
exports.notifyManagerOnGoalReviewCreated = async (goalReview) => {
  try {
    await Notification.create({
      recipientId: goalReview.managerId,
      senderId: goalReview.hrAdminId,
      title: 'New Goal Review Assigned',
      message: `You have been assigned a goal review: "${goalReview.description}". Due: ${goalReview.dueDate?.toDateString() || 'No due date'}`,
      type: 'GoalReviewCreated',
      link: `/GoalReview/${goalReview._id}`
    });
  } catch (err) {
    console.error('Notification Error (notifyManagerOnGoalReviewCreated):', err.message, err);
  }
};

// 2. When TaskReview is created (Notify Employee)
exports.notifyEmployeeOnTaskReviewCreated = async (taskReview) => {
  try {
    await Notification.create({
      recipientId: taskReview.employeeId,
      senderId: taskReview.hrAdminId,
      title: 'New Task Review Assigned',
      message: `You have been assigned a task under goal "${taskReview.goalId}". Due: ${taskReview.dueDate?.toDateString() || 'No due date'}`,
      type: 'TaskReviewCreated',
      link: `/TaskReview/${taskReview._id}`
    });
  } catch (err) {
    console.error('Notification Error (notifyEmployeeOnTaskReviewCreated):', err.message, err);
  }
};

// 3. When GoalReview is submitted (Notify HR)
exports.notifyHROnGoalReviewSubmitted = async (goalReview) => {
  try {
    await Notification.create({
      recipientId: goalReview.hrAdminId,
      senderId: goalReview.managerId,
      title: 'Goal Review Submitted',
      message: `A manager has submitted a review for goal "${goalReview.goalId}".`,
      type: 'GoalReviewSubmitted',
      link: `/GoalReview/${goalReview._id}`
    });
  } catch (err) {
    console.error('Notification Error (notifyHROnGoalReviewSubmitted):', err.message, err);
  }
};

// 4. When TaskReview is submitted (Notify HR)
exports.notifyHROnTaskReviewSubmitted = async (taskReview) => {
  try {
    await Notification.create({
      recipientId: taskReview.hrAdminId,
      senderId: taskReview.employeeId,
      title: 'Task Review Submitted',
      message: `A manager has submitted a task review for task "${taskReview.description}".`,
      type: 'TaskReviewSubmitted',
      link: `/TaskReview/${taskReview._id}`
    });
  } catch (err) {
    console.error('Notification Error (notifyHROnTaskReviewSubmitted):', err.message, err);
  }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username profilePicture')
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Notification Error (getUserNotifications):', error.message, error);
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error('Notification Error (markAsRead):', error.message, error);
    res.status(500).json({ message: 'Error marking notification as read', error });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Notification Error (markAllAsRead):', error.message, error);
    res.status(500).json({ message: 'Error marking all as read', error });
  }
};
