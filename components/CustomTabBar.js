import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../theme/colors';
import { getUserMatches, fetchReceivedLikes, getNotifications } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useTabBar } from '../context/TabBarContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { counts, updateCounts } = useTabBar();
  const [userId, setUserId] = useState(null);
  const refreshCountsRef = useRef(null);

  useEffect(() => {
    getCurrentUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCounts();
    }
  }, [userId]);

  // Refresh counts when tab changes
  useEffect(() => {
    if (userId) {
      fetchCounts();
    }
  }, [state.index, userId]);

  // Expose refresh function to context
  useEffect(() => {
    if (refreshCountsRef.current) {
      refreshCountsRef.current = fetchCounts;
    }
  }, [userId]);

  const getCurrentUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  };

  const fetchCounts = async () => {
    try {
      // Fetch likes count
      try {
        const likesResponse = await fetchReceivedLikes(userId);
        const likesCount = likesResponse.data.likes?.length || 0;
        updateCounts({ likes: likesCount });
      } catch (error) {
        console.error('Error fetching likes count:', error);
      }

      // Fetch matches count
      try {
        const matchesResponse = await getUserMatches(userId);
        const matchesCount = matchesResponse.data.matches?.length || 0;
        updateCounts({ matches: matchesCount });
      } catch (error) {
        console.error('Error fetching matches count:', error);
      }

      // Fetch notifications count
      try {
        const notificationsResponse = await getNotifications(userId);
        const unreadNotifications = notificationsResponse.data.notifications?.filter(n => !n.read) || [];
        updateCounts({ notifications: unreadNotifications.length });
      } catch (error) {
        console.error('Error fetching notifications count:', error);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const renderTabIcon = (routeName, focused) => {
    const iconColor = focused ? 'white' : '#989898';
    const iconSize = 30;

    switch (routeName) {
      case 'Home':
        return (
          <MaterialCommunityIcons 
            name="alpha" 
            size={35} 
            color={iconColor} 
          />
        );
      case 'Likes':
        return (
          <View style={styles.iconContainer}>
            <Entypo name="heart" size={iconSize} color={iconColor} />
            {counts.likes > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {counts.likes > 99 ? '99+' : counts.likes}
                </Text>
              </View>
            )}
          </View>
        );
      case 'Chat':
        return (
          <View style={styles.iconContainer}>
            <MaterialIcons name="chat-bubble-outline" size={iconSize} color={iconColor} />
            {counts.matches > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {counts.matches > 99 ? '99+' : counts.matches}
                </Text>
              </View>
            )}
          </View>
        );
      case 'Notifications':
        return (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={focused ? "notifications" : "notifications-outline"} 
              size={iconSize} 
              color={iconColor} 
            />
            {counts.notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {counts.notifications > 99 ? '99+' : counts.notifications}
                </Text>
              </View>
            )}
          </View>
        );
      case 'Profile':
        return (
          <Ionicons name="person-circle-outline" size={iconSize} color={iconColor} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {renderTabIcon(route.name, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#101010',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    ...shadows.small,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
});

export default CustomTabBar; 