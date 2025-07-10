import React, { useState, useEffect } from 'react';
import {View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import NotificationCenter from '../components/NotificationCenter';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { useTabBar } from '../context/TabBarContext';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { updateCounts } = useTabBar();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <NotificationCenter 
        isVisible={true}
        onClose={() => navigation.goBack()}
        userId={userId}
        onCountUpdate={(count) => updateCounts({ notifications: count })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default NotificationsScreen; 