import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { updateProfile } from '../services/api';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profile = route?.params?.profile;
  
  const [formData, setFormData] = useState({
    // Basics (read-only)
    firstName: profile?.firstName || '',
    age: profile?.age || '',
    type: profile?.type || '',
    
    // Basics (editable)
    location: profile?.location || '',
    gender: profile?.gender || '',
    lookingFor: profile?.lookingFor || '',
    height: profile?.height || '',
    hometown: profile?.hometown || '',
    languages: profile?.languages || [],
    bio: profile?.bio || '',
    
    // Lifestyle
    children: profile?.children || '',
    smoking: profile?.smoking || '',
    drinking: profile?.drinking || '',
    
    // Beliefs
    religion: profile?.religion || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    getCurrentUserId();
  }, []);

  const getCurrentUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.userId);
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLanguage = () => {
    setShowLanguageModal(true);
  };

  const handleAddLanguage = () => {
    if (newLanguage && newLanguage.trim()) {
      const newLanguages = [...formData.languages, newLanguage.trim()];
      updateFormData('languages', newLanguages);
      setNewLanguage('');
      setShowLanguageModal(false);
    }
  };

  const handleCancelLanguage = () => {
    setNewLanguage('');
    setShowLanguageModal(false);
  };

  const removeLanguage = (index) => {
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    updateFormData('languages', newLanguages);
  };

  const handleSave = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateProfile(currentUserId, formData);
      
      if (response.status === 200) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderReadOnlyField = (label, value, icon) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldIcon}>
          {icon}
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={styles.readOnlyValue}>
        <Text style={styles.readOnlyText}>{value}</Text>
        <Text style={styles.readOnlyNote}>Cannot be changed</Text>
      </View>
    </View>
  );

  const renderTextField = (label, value, field, placeholder, icon, multiline = false) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldIcon}>
          {icon}
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={(text) => updateFormData(field, text)}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        maxLength={multiline ? 500 : undefined}
      />
      {multiline && (
        <Text style={styles.charCount}>{value.length}/500</Text>
      )}
    </View>
  );

  const renderSelectField = (label, value, field, options, icon) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldIcon}>
          {icon}
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              value === option && styles.optionButtonSelected
            ]}
            onPress={() => updateFormData(field, option)}
          >
            <Text style={[
              styles.optionText,
              value === option && styles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLanguagesField = () => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldIcon}>
          <Ionicons name="language-outline" size={16} color={colors.textSecondary} />
        </View>
        <Text style={styles.fieldLabel}>Languages Spoken</Text>
      </View>
      <View style={styles.languagesContainer}>
        {formData.languages.map((language, index) => (
          <View key={index} style={styles.languageTag}>
            <Text style={styles.languageText}>{language}</Text>
            <TouchableOpacity
              style={styles.removeLanguageButton}
              onPress={() => removeLanguage(index)}
            >
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addLanguageButton} onPress={addLanguage}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addLanguageText}>Add Language</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={['white', '#F8F9FA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basics Section */}
        {renderSection('Basics', (
          <>
            {renderReadOnlyField(
              'First Name',
              formData.firstName,
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderReadOnlyField(
              'Age',
              formData.age,
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderReadOnlyField(
              'Type',
              formData.type,
              <MaterialIcons name="category" size={16} color={colors.textSecondary} />
            )}
            
            {renderTextField(
              'Dating Location',
              formData.location,
              'location',
              'Enter your dating location',
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderSelectField(
              'Gender',
              formData.gender,
              'gender',
              ['Male', 'Female', 'Non-binary', 'Other'],
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderSelectField(
              'Looking For',
              formData.lookingFor,
              'lookingFor',
              ['Male', 'Female', 'Everyone'],
              <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderTextField(
              'Height',
              formData.height,
              'height',
              'e.g., 5\'8" or 175 cm',
              <MaterialIcons name="height" size={16} color={colors.textSecondary} />
            )}
            
            {renderTextField(
              'Home Town',
              formData.hometown,
              'hometown',
              'Enter your hometown',
              <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderLanguagesField()}
            
            {renderTextField(
              'Bio',
              formData.bio,
              'bio',
              'Tell us about yourself...',
              <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />,
              true
            )}
          </>
        ))}

        {/* Lifestyle Section */}
        {renderSection('Lifestyle', (
          <>
            {renderSelectField(
              'Children',
              formData.children,
              'children',
              ['Yes, I have children', 'No, I don\'t have children', 'Prefer not to say'],
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderSelectField(
              'Smoking',
              formData.smoking,
              'smoking',
              ['Yes, I smoke', 'No, I don\'t smoke', 'Occasionally', 'Prefer not to say'],
              <MaterialIcons name="smoking-rooms" size={16} color={colors.textSecondary} />
            )}
            
            {renderSelectField(
              'Drinking',
              formData.drinking,
              'drinking',
              ['Yes, I drink', 'No, I don\'t drink', 'Occasionally', 'Prefer not to say'],
              <MaterialIcons name="local-bar" size={16} color={colors.textSecondary} />
            )}
          </>
        ))}

        {/* Beliefs Section */}
        {renderSection('Beliefs', (
          <>
            {renderTextField(
              'Religion',
              formData.religion,
              'religion',
              'Enter your religion (optional)',
              <Ionicons name="church-outline" size={16} color={colors.textSecondary} />
            )}
          </>
        ))}
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelLanguage}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Language</Text>
            <Text style={styles.modalSubtitle}>Enter a language you speak:</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newLanguage}
              onChangeText={setNewLanguage}
              placeholder="e.g., English, Spanish, French..."
              autoFocus={true}
              onSubmitEditing={handleAddLanguage}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={handleCancelLanguage}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButtonAdd, !newLanguage.trim() && styles.modalButtonDisabled]}
                onPress={handleAddLanguage}
                disabled={!newLanguage.trim()}
              >
                <Text style={styles.modalButtonAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'android' ? spacing.md : spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(161, 66, 244, 0.1)',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  readOnlyValue: {
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  readOnlyText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  readOnlyNote: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.cardBackground,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: 'white',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
    marginRight: spacing.xs,
  },
  removeLanguageButton: {
    marginLeft: spacing.xs,
  },
  addLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderStyle: 'dashed',
  },
  addLanguageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.large,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.cardBackground,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalButtonCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  modalButtonAdd: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonAddText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});

export default EditProfileScreen; 