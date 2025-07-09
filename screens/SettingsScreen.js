import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AntDesign } from '@expo/vector-icons';
import { getUserDetails, updateProfileVisibility } from '../services/api';

const SettingsScreen = (props) => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibilitySettings, setVisibilitySettings] = useState({
    genderVisible: true,
    typeVisible: true,
    lookingForVisible: true,
  });

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

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(userId);
      if (response.status === 200) {
        const userData = response.data.user;
        setUserProfile(userData);
        setVisibilitySettings({
          genderVisible: userData.genderVisible !== false,
          typeVisible: userData.typeVisible !== false,
          lookingForVisible: userData.lookingForVisible !== false,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (field, value) => {
    try {
      setLoading(true);
      const updateData = { [field]: value };
      
      const response = await updateProfileVisibility(userId, updateData);
      if (response.status === 200) {
        setVisibilitySettings(prev => ({
          ...prev,
          [field]: value
        }));
        Alert.alert('Success', 'Visibility setting updated successfully');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      Alert.alert('Error', 'Failed to update visibility setting');
    } finally {
      setLoading(false);
    }
  };

  const VisibilityToggle = ({ title, description, field, value, onToggle }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.backgroundSecondary,
    }}>
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <Text style={{
          fontSize: typography.fontSize.md,
          fontFamily: typography.fontFamily.semiBold,
          color: colors.textPrimary,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          marginTop: spacing.xs,
        }}>
          {description}
        </Text>
      </View>
      <Pressable
        onPress={() => onToggle(field, !value)}
        disabled={loading}
        style={{
          opacity: loading ? 0.5 : 1,
        }}
      >
        <AntDesign 
          name={value ? "checksquare" : "checksquareo"} 
          size={28} 
          color={value ? colors.primary : colors.textSecondary} 
        />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.backgroundSecondary,
        }}>
          <Pressable onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
            <AntDesign name="arrowleft" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={{
            fontSize: typography.fontSize.xl,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
          }}>
            Profile Settings
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.md,
          }}>
            Profile Visibility
          </Text>
          
          <View style={{
            backgroundColor: colors.textInverse,
            borderRadius: borderRadius.medium,
            marginHorizontal: spacing.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <VisibilityToggle
              title="Gender"
              description="Show your gender on your profile"
              field="genderVisible"
              value={visibilitySettings.genderVisible}
              onToggle={updateVisibility}
            />
            
            <VisibilityToggle
              title="Sexuality"
              description="Show your sexuality on your profile"
              field="typeVisible"
              value={visibilitySettings.typeVisible}
              onToggle={updateVisibility}
            />
            
            <VisibilityToggle
              title="Dating Intentions"
              description="Show what you're looking for on your profile"
              field="lookingForVisible"
              value={visibilitySettings.lookingForVisible}
              onToggle={updateVisibility}
            />
          </View>
        </View>

        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.lg }}>
          <CustomButton onPress={() => navigation.navigate('SupportChatRoom', { userId })} disabled={!userId}>
            Contact Support
          </CustomButton>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default SettingsScreen; 