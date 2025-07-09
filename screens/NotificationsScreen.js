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
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const NotificationsScreen = () => {
  const navigation = useNavigation();
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
    <SafeAreaWrapper backgroundColor={colors.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      <NotificationCenter 
        isVisible={true}
        onClose={() => navigation.goBack()}
        userId={userId}
      />
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
});

export default NotificationsScreen; 