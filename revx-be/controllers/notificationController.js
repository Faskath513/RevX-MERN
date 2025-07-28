const Notification = require('../models/Notification');
const User = require('../models/User');
const GoalReview = require('../models/GoalReview');
const TaskReview = require('../models/TaskReview');

// ENV or fallback for system sender
const SYSTEM_SENDER_ID = process.env.SYSTEM_SENDER_ID || '67a30304b58fe979f1fb4f37';

// 1. Notify Manager on GoalReview creation
exports.notifyManagerOnGoalReviewCreated = async (goalReview) => {
  try {
    // Check if the goalReview object has a valid managerId
    if (!goalReview.managerId) {
      console.warn('No manager assigned to this GoalReview. Notification not sent.');
      return;
    }

    // Send notification only to the assigned manager
    await Notification.create({
      recipientId: goalReview.managerId, // Only this manager gets notified
      senderId: goalReview.hrAdminId,
      title: 'New Goal Review Assigned',
      message: `You have been assigned a goal review: "${goalReview.description}". Due: ${goalReview.dueDate?.toDateString() || 'No due date'}`,
      type: 'GoalReviewCreated',
      link: `/goalReview/${goalReview._id}`, // Adjusted for front-end routing (optional)
      relatedEntityId: goalReview._id,
      entityType: 'GoalReview'
    });

    console.log(`Notification sent to Manager (ID: ${goalReview.managerId}) for GoalReview ${goalReview._id}`);
  } catch (err) {
    console.error('Notification Error (notifyManagerOnGoalReviewCreated):', err.message, err);
  }
};


// 2. Notify Employee on TaskReview creation
exports.notifyEmployeeOnTaskReviewCreated = async (taskReview) => {
  try {
    // Ensure employeeId is present
    if (!taskReview.employeeId) {
      console.warn('No employee assigned to this TaskReview. Notification not sent.');
      return;
    }

    await Notification.create({
      recipientId: taskReview.employeeId, // Only the assigned employee gets this
      senderId: taskReview.hrAdminId,
      title: 'New Task Review Assigned',
      message: `You have been assigned a new task review related to goal "${taskReview.goalId}". Due: ${taskReview.dueDate?.toDateString() || 'No due date'}`,
      type: 'TaskReviewCreated',
      link: `/taskReview/${taskReview._id}`, // Front-end path (adjust if needed)
      relatedEntityId: taskReview._id,
      entityType: 'TaskReview'
    });

    console.log(`Notification sent to Employee (ID: ${taskReview.employeeId}) for TaskReview ${taskReview._id}`);
  } catch (err) {
    console.error('Notification Error (notifyEmployeeOnTaskReviewCreated):', err.message, err);
  }
};


// 3. Notify HR on GoalReview submission
exports.notifyHROnGoalReviewSubmitted = async (goalReview) => {
  try {
    // Fetch populated manager username and goal projectTitle
    const populatedGoalReview = await GoalReview.findById(goalReview._id)
      .populate('managerId', 'username')
      .populate('goalId', 'projectTitle');

    const managerName = populatedGoalReview.managerId.username;
    const goalTitle = populatedGoalReview.goalId.projectTitle;

    await Notification.create({
      recipientId: populatedGoalReview.hrAdminId,
      senderId: populatedGoalReview.managerId._id,
      title: 'Goal Review Submitted',
      message: `${managerName} has submitted a review for goal "${goalTitle}".`,
      type: 'GoalReviewSubmitted',
      link: `api/GoalReviews/${populatedGoalReview._id}`,
      relatedEntityId: populatedGoalReview._id,
      entityType: 'GoalReview'
    });
  } catch (err) {
    console.error('Notification Error (notifyHROnGoalReviewSubmitted):', err.message, err);
  }
};


// 4. Notify HR on TaskReview submission
exports.notifyHROnTaskReviewSubmitted = async (taskReview) => {
  try {
    // Fetch related employee and task
    const populatedReview = await TaskReview.findById(taskReview._id)
      .populate('employeeId', 'username')
      .populate('taskId', 'taskTitle'); 
      

    const employeeName = populatedReview.employeeId.username;
    const taskName = populatedReview.taskId.taskTitle;

    await Notification.create({
      recipientId: populatedReview.hrAdminId,
      senderId: populatedReview.employeeId._id,
      title: 'Task Review Submitted',
      message: `${employeeName} has submitted a task review for task "${taskName}".`,
      type: 'TaskReviewSubmitted',
      link: `api/TaskReviews/${populatedReview._id}`,
      relatedEntityId: populatedReview._id,
      entityType: 'TaskReview'
    });
  } catch (err) {
    console.error('Notification Error (notifyHROnTaskReviewSubmitted):', err.message, err);
  }
};


// 5. Get all notifications for logged-in user
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

// 6. Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to mark this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Notification Error (markAsRead):', error.message, error);
    res.status(500).json({ message: 'Error marking as read', error });
  }
};

// 7. Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Notification Error (markAllAsRead):', error.message, error);
    res.status(500).json({ message: 'Error marking all as read', error });
  }
};

// 8. Delete user's own notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own notifications' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Notification Error (deleteNotification):', error.message, error);
    res.status(500).json({ message: 'Error deleting notification', error });
  }
};

// 9. Get unread notification countA manager has submitted a review for goal 
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      isRead: false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('Notification Error (getUnreadNotificationCount):', error.message, error);
    res.status(500).json({ message: 'Error fetching unread count', error });
  }
};

// 10. Reminder for due GoalReview and TaskReview
exports.sendDueReviewReminders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goalReviews = await GoalReview.find({ dueDate: today, status: 'Pending' })
      .populate('teamId', 'teamName')
      .populate('managerId');
    const taskReviews = await TaskReview.find({ dueDate: today, status: 'Pending' })
      .populate('goalId', 'projectTitle')
      .populate('employeeId');

    const notifications = [];

    for (const review of goalReviews) {
      const message = `Reminder: Your goal review for team "${review.teamId?.teamName || 'Unknown'}" is due today.`;
      const notification = new Notification({
        recipientId: review.managerId?._id,
        senderId: SYSTEM_SENDER_ID,
        title: 'Goal Review Reminder',
        message,
        type: 'Reminder',
        entityType: 'GoalReview',
        relatedEntityId: review._id,
        link: `/GoalReview/${review._id}`
      });

      await notification.save();
      notifications.push(notification);
    }

    for (const review of taskReviews) {
      const message = `Reminder: Your task review under goal "${review.goalId?.projectTitle || 'Unknown'}" is due today.`;
      const notification = new Notification({
        recipientId: review.employeeId?._id,
        senderId: SYSTEM_SENDER_ID,
        title: 'Task Review Reminder',
        message,
        type: 'Reminder',
        entityType: 'TaskReview',
        relatedEntityId: review._id,
        link: `/TaskReview/${review._id}`
      });

      await notification.save();
      notifications.push(notification);
    }

    res.status(200).json({
      message: 'Reminders sent successfully',
      count: notifications.length
    });
  } catch (error) {
    console.error('Notification Error (sendDueReviewReminders):', error.message, error);
    res.status(500).json({ message: 'Error sending reminders', error });
  }
};
