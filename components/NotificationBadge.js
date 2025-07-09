import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getNotifications } from '../services/api';

const NotificationBadge = ({ userId, style }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const notifications = await getNotifications(userId);
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge; 