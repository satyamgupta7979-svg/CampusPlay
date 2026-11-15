import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({
    $or: [
      { targetUserIds: userId },
      { targetUserIds: { $size: 0 } },
      ...(req.user.role === 'organizer' ? [{ targetUserIds: { $exists: true } }] : []),
    ],
  }).sort({ createdAt: -1 });

  // Map to identify if read by this specific user
  const formatted = notifications.map((n) => {
    const json = n.toJSON();
    return {
      ...json,
      read: json.readByUserIds?.includes(userId.toString()) || false,
    };
  });

  res.status(200).json({
    success: true,
    count: formatted.length,
    notifications: formatted,
  });
});

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  const userId = req.user._id;
  if (!notification.readByUserIds.some((id) => id.toString() === userId.toString())) {
    notification.readByUserIds.push(userId);
    await notification.save();
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification: notification.toJSON(),
  });
});

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    {
      $or: [
        { targetUserIds: userId },
        { targetUserIds: { $size: 0 } },
      ],
      readByUserIds: { $ne: userId },
    },
    {
      $addToSet: { readByUserIds: userId },
    }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    $or: [
      { targetUserIds: userId },
      { targetUserIds: { $size: 0 } },
    ],
    readByUserIds: { $ne: userId },
  });

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

