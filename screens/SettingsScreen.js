import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const SettingsScreen = (props) => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
        }
      } catch (error) {
        console.error('Failed to decode userId:', error);
      }
    };
    fetchUserId();
  }, []);

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: typography.fontSize.xxl, fontFamily: typography.fontFamily.bold, marginBottom: spacing.lg }}>Settings</Text>
      <Text style={{ fontSize: typography.fontSize.md, color: 'gray', marginBottom: spacing.xxl }}>Settings screen coming soon!</Text>
      <CustomButton onPress={() => navigation.navigate('SupportChatRoom', { userId })} disabled={!userId}>
        Contact Support
      </CustomButton>
      <CustomButton onPress={() => navigation.goBack()}>Back</CustomButton>
    </SafeAreaWrapper>
  );
};

export default SettingsScreen; 