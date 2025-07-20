import React, { useEffect, useState, useContext } from 'react';
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
import { getUserDetails, updateProfileVisibility, getRejectedProfiles, unrejectProfile, deactivateAccount, deleteAccount, getAccountStatus } from '../services/api';

import { AuthContext } from '../AuthContext';

const SettingsScreen = (props) => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibilitySettings, setVisibilitySettings] = useState({
    genderVisible: true,
    typeVisible: true,
    lookingForVisible: true,
  });
  const [rejectedProfiles, setRejectedProfiles] = useState([]);
  const [showRejectedProfiles, setShowRejectedProfiles] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [showAccountActions, setShowAccountActions] = useState(false);

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
      fetchRejectedProfiles();
      fetchAccountStatus();
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

  const fetchRejectedProfiles = async () => {
    try {
      const response = await getRejectedProfiles(userId);
      if (response.status === 200) {
        setRejectedProfiles(response.data.rejectedProfiles || []);
      }
    } catch (error) {
      console.error('Error fetching rejected profiles:', error);
    }
  };

  const handleUnreject = async (rejectedUserId, rejectedUserName) => {
    try {
      await unrejectProfile(userId, rejectedUserId);
      setRejectedProfiles(prev => prev.filter(user => user._id !== rejectedUserId));
      Alert.alert('Success', `${rejectedUserName} has been unrejected`);
    } catch (error) {
      console.error('Error unrejecting profile:', error);
      Alert.alert('Error', 'Failed to unreject profile');
    }
  };

  const fetchAccountStatus = async () => {
    try {
      const response = await getAccountStatus(userId);
      if (response.status === 200) {
        setAccountStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching account status:', error);
      // Set default status if API is not available
      setAccountStatus({
        isActive: true,
        isDeleted: false,
        deactivatedAt: null,
        deletedAt: null
      });
    }
  };

  const handleDeactivateAccount = () => {
    Alert.prompt(
      'Deactivate Account',
      'Enter your password to confirm account deactivation. You can reactivate your account by logging in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async (password) => {
            if (!password) {
              Alert.alert('Error', 'Password is required');
              return;
            }
            
            try {
              setLoading(true);
              await deactivateAccount(userId, password);
              await logout();
            } catch (error) {
              console.error('Error deactivating account:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to deactivate account');
              setLoading(false);
            }
          }
        }
      ],
      'secure-text'
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Feature Unavailable',
      'Account deletion is currently being updated. Please try again later or contact support.',
      [{ text: 'OK' }]
    );
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
          <SafeAreaWrapper backgroundColor={colors.background} style={{ flex: 1, backgroundColor: colors.background }}>
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

        <View style={{ marginTop: spacing.xl }}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.md,
          }}>
            Privacy & Safety
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
            <Pressable
              onPress={() => navigation.navigate('BlockedUsers')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.error + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <AntDesign name="closecircle" size={20} color={colors.error} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.fontSize.md,
                    fontFamily: typography.fontFamily.semiBold,
                    color: colors.textPrimary,
                  }}>
                    Blocked Users
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}>
                    Manage users you've blocked
                  </Text>
                </View>
              </View>
              <AntDesign name="right" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Rejected Profiles Section */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.md,
          }}>
            Rejected Profiles
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
            <Pressable
              onPress={() => setShowRejectedProfiles(!showRejectedProfiles)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.warning + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <AntDesign name="closecircle" size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.fontSize.md,
                    fontFamily: typography.fontFamily.semiBold,
                    color: colors.textPrimary,
                  }}>
                    Rejected Profiles ({rejectedProfiles.length})
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}>
                    View and manage rejected profiles
                  </Text>
                </View>
              </View>
              <AntDesign name={showRejectedProfiles ? "up" : "down"} size={16} color={colors.textSecondary} />
            </Pressable>
            
            {showRejectedProfiles && (
              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
                {rejectedProfiles.length === 0 ? (
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    paddingVertical: spacing.md,
                  }}>
                    No rejected profiles
                  </Text>
                ) : (
                  rejectedProfiles.map((user) => (
                    <View key={user._id} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: spacing.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.backgroundSecondary,
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: typography.fontSize.md,
                          fontFamily: typography.fontFamily.semiBold,
                          color: colors.textPrimary,
                        }}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.textSecondary,
                        }}>
                          {user.email}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleUnreject(user._id, user.firstName)}
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          borderRadius: borderRadius.small,
                        }}
                      >
                        <Text style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.textInverse,
                        }}>
                          Unreject
                        </Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.md,
          }}>
            Account Management
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
            <Pressable
              onPress={() => setShowAccountActions(!showAccountActions)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.warning + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <AntDesign name="setting" size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.fontSize.md,
                    fontFamily: typography.fontFamily.semiBold,
                    color: colors.textPrimary,
                  }}>
                    Account Actions
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}>
                    Deactivate or delete your account
                  </Text>
                </View>
              </View>
              <AntDesign name={showAccountActions ? "up" : "down"} size={16} color={colors.textSecondary} />
            </Pressable>
            
            {showAccountActions && (
              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
                <Pressable
                  onPress={handleDeactivateAccount}
                  disabled={loading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.backgroundSecondary,
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.warning + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                  }}>
                    <AntDesign name="pausecircle" size={16} color={colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.fontSize.md,
                      fontFamily: typography.fontFamily.semiBold,
                      color: colors.textPrimary,
                    }}>
                      Deactivate Account
                    </Text>
                    <Text style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}>
                      Temporarily disable your account (can be reactivated by logging in)
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={loading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.error + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                  }}>
                    <AntDesign name="delete" size={16} color={colors.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.fontSize.md,
                      fontFamily: typography.fontFamily.semiBold,
                      color: colors.error,
                    }}>
                      Delete Account
                    </Text>
                    <Text style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}>
                      Permanently delete your account and data
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.md,
          }}>
            Legal & Support
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
            <Pressable
              onPress={() => navigation.navigate('TermsOfUse')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.backgroundSecondary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <AntDesign name="filetext1" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.fontSize.md,
                    fontFamily: typography.fontFamily.semiBold,
                    color: colors.textPrimary,
                  }}>
                    Terms of Use
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}>
                    Read our terms and conditions
                  </Text>
                </View>
              </View>
              <AntDesign name="right" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('PrivacyPolicy')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.backgroundSecondary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.secondary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <AntDesign name="lock" size={20} color={colors.secondary} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.fontSize.md,
                    fontFamily: typography.fontFamily.semiBold,
                    color: colors.textPrimary,
                  }}>
                    Privacy Policy
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}>
                    Learn how we protect your data
                  </Text>
                </View>
              </View>
              <AntDesign name="right" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('SupportChatRoom', { userId })}
              disabled={!userId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.backgroundSecondary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <AntDesign name="customerservice" size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.fontSize.md,
                    fontFamily: typography.fontFamily.semiBold,
                    color: colors.textPrimary,
                  }}>
                    Contact Support
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}>
                    Get help from our support team
                  </Text>
                </View>
              </View>
              <AntDesign name="right" size={16} color={colors.textSecondary} />
            </Pressable>


          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default SettingsScreen; 