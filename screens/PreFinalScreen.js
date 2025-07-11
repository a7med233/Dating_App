import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../AuthContext';

import Toast from '../components/Toast';
import { registerUser as registerUserAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const PreFinalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const { token, isLoading, setToken } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      navigation.navigate('MainStack', { screen: 'Main' });
    }
  }, [token, navigation]);

  useEffect(() => {
    getAllUserData();
  }, []);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    try {
      // Handle DD/MM/YYYY format
      const parts = dateOfBirth.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        const birthDate = new Date(year, month, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age;
      }
      
      // Handle other date formats
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  const getAllUserData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'AdditionalInfo',
        'Photos',
        'Prompts',
      ];

      let userData = {};

      for (const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName);
        if (screenData) {
          userData = { ...userData, ...screenData };
        }
      }

      // Calculate age from date of birth
      if (userData.dateOfBirth) {
        userData.age = calculateAge(userData.dateOfBirth);
      }

      setUserData(userData);
      setUserDataLoading(false);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      setUserData(undefined);
      setUserDataLoading(false);
      return null;
    }
  };

  const clearAllScreenData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Photos',
      ];
      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }
      console.log('All screen data cleared successfully');
    } catch (error) {
      console.error('Error clearing screen data:', error);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      if (!userData) {
        setToast({ visible: true, message: 'User data is missing', type: 'error' });
        setLoading(false);
        return;
      }
      
      if (!termsAgreed || !privacyAgreed) {
        setToast({ visible: true, message: 'Please agree to Terms of Use and Privacy Policy', type: 'error' });
        setLoading(false);
        return;
      }
      
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        email: userData.email,
        password: userData.password,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        type: userData.type,
        location: userData.location,
        hometown: userData.hometown,
        datingPreferences: userData.datingPreferences || [],
        lookingFor: userData.lookingFor,
        imageUrls: userData.imageUrls || [],
        prompts: userData.prompts || [],
        bio: userData.bio || '',
        height: userData.height || '',
        languages: userData.languages || [],
        children: userData.children || '',
        smoking: userData.smoking || '',
        drinking: userData.drinking || '',
        religion: userData.religion || '',
        occupation: userData.occupation || '',
        genderVisible: userData.genderVisible !== false,
        typeVisible: userData.typeVisible !== false,
        lookingForVisible: userData.lookingForVisible !== false,
      };
      
      const response = await registerUserAPI(payload);
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      setToken(token);
      setToast({ visible: true, message: 'Registration successful!', type: 'success' });
      clearAllScreenData();
    } catch (error) {
      console.error('Error registering user:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data. Please check your information.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.message) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        }
      }
      
      setToast({ visible: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (userDataLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your profile data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Ionicons name="checkmark-circle" size={40} color={colors.textInverse} />
              <Text style={styles.headerTitle}>Almost Done!</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>All set to register</Text>
            <Text style={styles.subtitle}>
              Setting up your profile for you. Take a final look before we create your account!
        </Text>
      </View>

          {/* Animation Section */}
          <View style={styles.animationSection}>
        <LottieView
          source={require('../assets/love.json')}
              style={styles.animation}
          autoPlay
          loop={true}
          speed={0.7}
        />
      </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Profile Summary</Text>
            <View style={styles.summaryItems}>
              <View style={styles.summaryItem}>
                <Ionicons name="person" size={16} color={colors.primary} />
                <Text style={styles.summaryText}>
                  {userData?.firstName} {userData?.lastName}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <Text style={styles.summaryText}>
                  {userData?.location || 'Location not set'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="images" size={16} color={colors.primary} />
                <Text style={styles.summaryText}>
                  {userData?.imageUrls?.length || 0} photos uploaded
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                <Text style={styles.summaryText}>
                  {userData?.prompts?.length || 0} prompts answered
                </Text>
              </View>
            </View>
          </View>

          {/* Terms and Privacy Section */}
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Required Agreements</Text>
            
            <View style={styles.termsContainer}>
              <TouchableOpacity
                onPress={() => setTermsAgreed(!termsAgreed)}
                style={styles.termsItem}
              >
                <View style={styles.termsCheckbox}>
                  {termsAgreed ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color={colors.textSecondary} />
                  )}
                </View>
                <View style={styles.termsContent}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text 
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('TermsOfUse')}
                    >
                      Terms of Use
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPrivacyAgreed(!privacyAgreed)}
                style={styles.termsItem}
              >
                <View style={styles.termsCheckbox}>
                  {privacyAgreed ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color={colors.textSecondary} />
                  )}
                </View>
                <View style={styles.termsContent}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text 
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
        onPress={() => userData ? setPreviewVisible(true) : null}
              style={styles.previewButton}
            >
              <Ionicons name="eye-outline" size={20} color={colors.primary} />
              <Text style={styles.previewButtonText}>Preview Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={userData ? registerUser : undefined}
              disabled={loading || !termsAgreed || !privacyAgreed}
              style={[
                styles.registerButton,
                {
                  opacity: (loading || !termsAgreed || !privacyAgreed) ? 0.6 : 1,
                  backgroundColor: (loading || !termsAgreed || !privacyAgreed) ? colors.textTertiary : colors.primary
                }
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <>
                  <Ionicons name="rocket-outline" size={20} color={colors.textInverse} />
                  <Text style={styles.registerButtonText}>Finish Registration</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Your profile will be visible to other users once registration is complete. You can edit your profile anytime from the settings.
        </Text>
          </View>
        </View>
      </ScrollView>

      {/* Profile Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Preview</Text>
              <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Custom Profile Preview */}
              <View style={styles.profilePreview}>
                <View style={styles.profileHeader}>
                  <Image
                    source={{ 
                      uri: userData?.imageUrls?.[0] || 'https://via.placeholder.com/150' 
                    }}
                    style={styles.profileImage}
                  />
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {userData?.firstName} {userData?.lastName}
                    </Text>
                    <Text style={styles.profileAge}>
                      {userData?.age ? `${userData.age} years old` : 'Age not specified'}
                    </Text>
                    <Text style={styles.profileLocation}>
                      {userData?.location || 'Location not specified'}
                    </Text>
                  </View>
                </View>

                {/* Basic Info */}
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Basic Information</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Ionicons name="person" size={14} color={colors.primary} />
                      <Text style={styles.infoLabel}>Gender</Text>
                      <Text style={styles.infoValue}>
                        {userData?.gender || 'Not specified'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="heart" size={14} color={colors.primary} />
                      <Text style={styles.infoLabel}>Type</Text>
                      <Text style={styles.infoValue}>
                        {userData?.type || 'Not specified'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="location" size={14} color={colors.primary} />
                      <Text style={styles.infoLabel}>Hometown</Text>
                      <Text style={styles.infoValue}>
                        {userData?.hometown || 'Not specified'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="search" size={14} color={colors.primary} />
                      <Text style={styles.infoLabel}>Looking For</Text>
                      <Text style={styles.infoValue}>
                        {userData?.lookingFor || 'Not specified'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Additional Info */}
                {(userData?.bio || userData?.height || userData?.occupation || userData?.religion) && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Additional Information</Text>
                    {userData?.bio && (
                      <View style={styles.infoItem}>
                        <Ionicons name="chatbubble" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Bio</Text>
                        <Text style={styles.infoValue}>{userData.bio}</Text>
                      </View>
                    )}
                    {userData?.height && (
                      <View style={styles.infoItem}>
                        <Ionicons name="resize" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Height</Text>
                        <Text style={styles.infoValue}>{userData.height}</Text>
                      </View>
                    )}
                    {userData?.occupation && (
                      <View style={styles.infoItem}>
                        <Ionicons name="briefcase" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Occupation</Text>
                        <Text style={styles.infoValue}>{userData.occupation}</Text>
                      </View>
                    )}
                    {userData?.religion && (
                      <View style={styles.infoItem}>
                        <Ionicons name="church" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Religion</Text>
                        <Text style={styles.infoValue}>{userData.religion}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Lifestyle */}
                {(userData?.children || userData?.smoking || userData?.drinking || userData?.languages?.length > 0) && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Lifestyle</Text>
                    {userData?.children && (
                      <View style={styles.infoItem}>
                        <Ionicons name="people" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Children</Text>
                        <Text style={styles.infoValue}>{userData.children}</Text>
                      </View>
                    )}
                    {userData?.smoking && (
                      <View style={styles.infoItem}>
                        <Ionicons name="flame" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Smoking</Text>
                        <Text style={styles.infoValue}>{userData.smoking}</Text>
                      </View>
                    )}
                    {userData?.drinking && (
                      <View style={styles.infoItem}>
                        <Ionicons name="wine" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Drinking</Text>
                        <Text style={styles.infoValue}>{userData.drinking}</Text>
                      </View>
                    )}
                    {userData?.languages && userData.languages.length > 0 && (
                      <View style={styles.infoItem}>
                        <Ionicons name="language" size={14} color={colors.primary} />
                        <Text style={styles.infoLabel}>Languages</Text>
                        <Text style={styles.infoValue}>{userData.languages.join(', ')}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Photos */}
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Photos</Text>
                  <View style={styles.photoGrid}>
                    {userData?.imageUrls && userData.imageUrls.length > 0 ? (
                      userData.imageUrls.map((url, index) => (
                        <View key={index} style={styles.photoContainer}>
                          <Image
                            source={{ uri: url }}
                            style={styles.photoThumbnail}
                            resizeMode="cover"
                          />
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No photos uploaded</Text>
                    )}
                  </View>
                  {userData?.imageUrls && userData.imageUrls.length > 0 && (
                    <Text style={styles.photoCountText}>
                      {userData.imageUrls.length} photo{userData.imageUrls.length !== 1 ? 's' : ''} uploaded
                    </Text>
                  )}
                </View>

                {/* Dating Preferences */}
                {userData?.datingPreferences && userData.datingPreferences.length > 0 && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Dating Preferences</Text>
                    <View style={styles.preferencesContainer}>
                      {userData.datingPreferences.map((pref, index) => (
                        <View key={index} style={styles.preferenceTag}>
                          <Text style={styles.preferenceText}>{pref}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Prompts</Text>
                {userData?.prompts && userData.prompts.length > 0 ? (
                  userData.prompts.map((p, i) => (
                    <View key={i} style={styles.promptPreview}>
                      <Text style={styles.promptQuestion}>{p.question}</Text>
                      <Text style={styles.promptAnswer}>{p.answer}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No prompts answered.</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={() => setPreviewVisible(false)} 
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalButtonText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingOverlayText}>Creating your account...</Text>
          </View>
        </View>
      )}

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  headerSection: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    elevation: 8,
  },
  headerContent: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 0),
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    left: spacing.lg,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textInverse,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'android' ? 100 : 0,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  animationSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  animation: {
    height: 200,
    width: 250,
  },
  summarySection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryItems: {
    gap: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  actionSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.small,
  },
  previewButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.medium,
  },
  registerButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    margin: Platform.OS === 'android' ? spacing.sm : spacing.md,
    width: width - (Platform.OS === 'android' ? spacing.sm : spacing.md) * 2,
    height: Platform.OS === 'android' ? height * 0.9 : height * 0.95,
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalScroll: {
    flex: 1,
    padding: spacing.lg,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  profilePreview: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileAge: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileLocation: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  previewSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  infoItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.small,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    ...shadows.small,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  preferenceTag: {
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  preferenceText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoContainer: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3, // 3 columns with gaps
    height: 100,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoCountText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  promptPreview: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptQuestion: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  promptAnswer: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  previewText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  noDataText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.lg,
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.large,
  },
  loadingOverlayText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  termsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  termsTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  termsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  termsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  termsCheckbox: {
    marginRight: spacing.md,
  },
  termsContent: {
    flex: 1,
  },
  termsText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  termsLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    textDecorationLine: 'underline',
  },
});

export default PreFinalScreen;
