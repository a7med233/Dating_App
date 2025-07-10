import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const AdditionalInfoScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    bio: '',
    height: '',
    languages: [],
    children: '',
    smoking: '',
    drinking: '',
    religion: '',
    occupation: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    getRegistrationProgress('AdditionalInfo').then(progressData => {
      if (progressData) {
        setFormData(progressData);
      }
    });
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLanguage = () => {
    Alert.prompt(
      'Add Language',
      'Enter a language you speak:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (language) => {
            if (language && language.trim()) {
              const newLanguages = [...formData.languages, language.trim()];
              updateFormData('languages', newLanguages);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const removeLanguage = (index) => {
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    updateFormData('languages', newLanguages);
  };

  const handleNext = () => {
    // All fields are optional, so we can proceed without validation
    setError('');
    saveRegistrationProgress('AdditionalInfo', formData);
    navigation.navigate('Photos');
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
        <Text style={styles.fieldLabel}>Languages Spoken (Optional)</Text>
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
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={26}
            color={colors.textPrimary}
          />
        </View>
        <Text style={styles.headerTitle}>Tell us more about yourself</Text>
        <Text style={styles.headerSubtitle}>All fields are optional</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basics Section */}
        {renderSection('Basics', (
          <>
            {renderTextField(
              'Bio',
              formData.bio,
              'bio',
              'Tell us about yourself... (optional)',
              <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />,
              true
            )}
            
            {renderTextField(
              'Height',
              formData.height,
              'height',
              'e.g., 5\'8" or 175 cm (optional)',
              <MaterialCommunityIcons name="human-male-height" size={16} color={colors.textSecondary} />
            )}
            
            {renderTextField(
              'Occupation',
              formData.occupation,
              'occupation',
              'What do you do? (optional)',
              <MaterialCommunityIcons name="briefcase-outline" size={16} color={colors.textSecondary} />
            )}
            
            {renderLanguagesField()}
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
              <MaterialCommunityIcons name="smoking-off" size={16} color={colors.textSecondary} />
            )}
            
            {renderSelectField(
              'Drinking',
              formData.drinking,
              'drinking',
              ['Yes, I drink', 'No, I don\'t drink', 'Occasionally', 'Prefer not to say'],
              <MaterialCommunityIcons name="glass-cocktail" size={16} color={colors.textSecondary} />
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

        {/* Error Message */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Continue</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xlarge,
    borderColor: colors.textPrimary,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: 'white',
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
    borderColor: '#E8E8E8',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
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
  errorText: {
    color: colors.error || '#FF6B6B',
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nextButtonText: {
    color: 'white',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
});

export default AdditionalInfoScreen; 