import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  // Add a notification
  async addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    this.notifications.unshift(newNotification);
    
    // Keep only the last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Save to AsyncStorage
    await this.saveNotifications();
    
    // Notify listeners
    this.notifyListeners();
    
    return newNotification;
  }

  // Get all notifications
  async getNotifications() {
    if (this.notifications.length === 0) {
      await this.loadNotifications();
    }
    return this.notifications;
  }

  // Get unread notifications
  async getUnreadNotifications() {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read);
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Clear all notifications
  async clearAllNotifications() {
    this.notifications = [];
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Delete a specific notification
  async deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Save notifications to AsyncStorage
  async saveNotifications() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Load notifications from AsyncStorage
  async loadNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  // Add listener for notification changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Helper methods for common notification types
  async addMatchNotification(matchName, matchPhoto) {
    return this.addNotification({
      type: 'match',
      title: 'New Match!',
      message: `You and ${matchName} liked each other!`,
      data: {
        matchName,
        matchPhoto,
        action: 'open_chat',
      },
    });
  }

  async addLikeNotification(likerName, likerPhoto) {
    return this.addNotification({
      type: 'like',
      title: 'New Like',
      message: `${likerName} liked your profile!`,
      data: {
        likerName,
        likerPhoto,
        action: 'view_profile',
      },
    });
  }

  async addMessageNotification(senderName, messagePreview, senderPhoto) {
    return this.addNotification({
      type: 'message',
      title: 'New Message',
      message: `${senderName}: ${messagePreview}`,
      data: {
        senderName,
        messagePreview,
        senderPhoto,
        action: 'open_chat',
      },
    });
  }

  async addSuperLikeNotification(likerName, likerPhoto) {
    return this.addNotification({
      type: 'super_like',
      title: 'Super Like!',
      message: `${likerName} super liked you!`,
      data: {
        likerName,
        likerPhoto,
        action: 'view_profile',
      },
    });
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService; 