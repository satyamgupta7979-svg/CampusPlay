import api from './api';
import type { Notice } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notice[]> {
    const res = await api.get<{ success: boolean; count: number; notifications: Notice[] }>('/notifications');
    return res.notifications;
  },

  async markAsRead(id: string): Promise<Notice> {
    const res = await api.patch<{ success: boolean; message: string; notification: Notice }>(
      `/notifications/${id}/read`
    );
    return res.notification;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ success: boolean; unreadCount: number }>('/notifications/unread-count');
    return res.unreadCount;
  },
};

export default notificationService;

