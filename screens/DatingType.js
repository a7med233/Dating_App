import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { Ionicons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';


const { width, height } = Dimensions.get('window');

const DatingType = () => {
  const [datingPreferences, setDatingPreferences] = useState([]);
  const [error, setError] = useState('');
  const [typeVisible, setTypeVisible] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    getRegistrationProgress('Dating').then(progressData => {
      if (progressData) {
        setDatingPreferences(progressData.datingPreferences || []);
        setTypeVisible(progressData.typeVisible !== false);
      }
    });
  }, []);

  const chooseOption = option => {
    setDatingPreferences([option]);
  };

  const handleNext = () => {
    if (datingPreferences.length === 0) {
      setError('Please select at least one option.');
      return;
    }
    setError('');
    saveRegistrationProgress('Dating', {datingPreferences, typeVisible});
    navigation.navigate('LookingFor');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const datingOptions = [
    { 
      id: 'Male', 
      label: 'Male', 
      icon: 'male', 
      description: 'I want to date men' 
    },
    { 
      id: 'Female', 
      label: 'Female', 
      icon: 'female', 
      description: 'I want to date women' 
    },
    { 
      id: 'Everyone', 
      label: 'Everyone', 
      icon: 'people', 
      description: 'I want to date everyone' 
    },
  ];

  return (
    <SafeAreaWrapper backgroundColor="white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                <Ionicons name="heart" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Dating Preferences</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Who do you want to date?</Text>
              <Text style={styles.subtitle}>
                Select who you're interested in dating.
              </Text>
          </View>

            {/* Dating Options */}
            <View style={styles.optionsSection}>
              {datingOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => chooseOption(option.id)}
                  style={[
                    styles.optionContainer,
                    datingPreferences.includes(option.id) && styles.selectedOption
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIcon,
                      datingPreferences.includes(option.id) && styles.selectedOptionIcon
                    ]}>
                      <Ionicons 
                        name={option.icon} 
                        size={24} 
                        color={datingPreferences.includes(option.id) ? colors.textInverse : colors.textSecondary} 
          />
        </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionLabel,
                        datingPreferences.includes(option.id) && styles.selectedOptionLabel
                      ]}>
                        {option.label}
        </Text>
                      <Text style={[
                        styles.optionDescription,
                        datingPreferences.includes(option.id) && styles.selectedOptionDescription
                      ]}>
                        {option.description}
        </Text>
          </View>
          </View>
                                     <View style={[
                     styles.radioButton,
                     datingPreferences.includes(option.id) && styles.selectedRadioButton
                   ]}>
                     {datingPreferences.includes(option.id) && (
                       <View style={styles.radioButtonInner} />
                     )}
          </View>
                </TouchableOpacity>
              ))}
        </View>

            {/* Visibility Toggle */}
            <View style={styles.visibilitySection}>
              <TouchableOpacity
          onPress={() => setTypeVisible(!typeVisible)}
                style={styles.visibilityContainer}
              >
                <View style={styles.checkboxContainer}>
                  <Ionicons 
                    name={typeVisible ? "checkbox" : "square-outline"} 
                    size={24} 
            color={typeVisible ? colors.primary : colors.textSecondary} 
          />
                </View>
                <View style={styles.visibilityTextContainer}>
                  <Text style={[
                    styles.visibilityLabel,
                    typeVisible && styles.visibilityLabelActive
                  ]}>
                    Show dating preferences on profile
                  </Text>
                  <Text style={styles.visibilityDescription}>
                    Other users will be able to see who you're interested in dating
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Your dating preferences help us show you people you're interested in. You can always update this later in your settings.
          </Text>
            </View>

            {/* Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
              disabled={datingPreferences.length === 0}
              style={[
                styles.continueButton,
                {
                  opacity: datingPreferences.length === 0 ? 0.6 : 1,
                  backgroundColor: datingPreferences.length === 0 ? colors.textTertiary : colors.primary
                }
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  optionsSection: {
    marginBottom: spacing.xl,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  selectedOptionIcon: {
    backgroundColor: colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  selectedOptionLabel: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  selectedOptionDescription: {
    color: colors.primary + 'CC',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  visibilitySection: {
    marginBottom: spacing.xl,
  },
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxContainer: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  visibilityTextContainer: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  visibilityLabelActive: {
    color: colors.textPrimary,
  },
  visibilityDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  errorText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
    flex: 1,
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
    marginBottom: spacing.xl,
  },
  infoText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: Platform.OS === 'android' ? 20 : 0,
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
});

export default DatingType;
