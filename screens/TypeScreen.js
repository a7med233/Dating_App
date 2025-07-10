import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
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
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TypeScreen = () => {
  const [type, setType] = useState('');
  const [typeVisible, setTypeVisible] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    getRegistrationProgress('Type').then(progressData => {
      if (progressData) {
        setType(progressData.type || '');
        setTypeVisible(progressData.typeVisible !== false);
      }
    });
  }, []);

  const handleNext = () => {
    if (type.trim() === '') {
      setError('Please select your sexuality.');
      return;
    }
    setError('');
    saveRegistrationProgress('Type', {type, typeVisible});
    navigation.navigate('Dating');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const sexualityOptions = [
    { id: 'Straight', label: 'Straight', icon: 'heart-outline', description: 'Attracted to the opposite gender' },
    { id: 'Gay', label: 'Gay', icon: 'male', description: 'Attracted to the same gender' },
    { id: 'Lesbian', label: 'Lesbian', icon: 'female', description: 'Women attracted to women' },
    { id: 'Bisexual', label: 'Bisexual', icon: 'heart-half', description: 'Attracted to multiple genders' },
    { id: 'Pansexual', label: 'Pansexual', icon: 'infinite', description: 'Attracted regardless of gender' },
    { id: 'Asexual', label: 'Asexual', icon: 'close-circle', description: 'Little or no sexual attraction' },
    { id: 'Other', label: 'Other', icon: 'ellipsis-horizontal', description: 'Other sexual orientations' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
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
                <Ionicons name="heart-outline" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Sexuality</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>What's your sexuality?</Text>
              <Text style={styles.subtitle}>
                This helps us show you the most relevant matches. You can change this anytime in your settings.
              </Text>
          </View>

            {/* Sexuality Options */}
            <View style={styles.optionsSection}>
              {sexualityOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setType(option.id)}
                  style={[
                    styles.optionContainer,
                    type === option.id && styles.selectedOption
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIcon,
                      type === option.id && styles.selectedOptionIcon
                    ]}>
                      <Ionicons 
                        name={option.icon} 
                        size={24} 
                        color={type === option.id ? colors.textInverse : colors.textSecondary} 
          />
        </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionLabel,
                        type === option.id && styles.selectedOptionLabel
                      ]}>
                        {option.label}
        </Text>
                      <Text style={[
                        styles.optionDescription,
                        type === option.id && styles.selectedOptionDescription
                      ]}>
                        {option.description}
        </Text>
          </View>
          </View>
                  <View style={[
                    styles.radioButton,
                    type === option.id && styles.selectedRadioButton
                  ]}>
                    {type === option.id && (
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
                    Show sexuality on profile
                  </Text>
                  <Text style={styles.visibilityDescription}>
                    Other users will be able to see your sexuality
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
                Your sexuality helps us provide better matches. You can always update this later in your profile settings.
          </Text>
            </View>

            {/* Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
              disabled={!type.trim()}
              style={[
                styles.continueButton,
                {
                  opacity: !type.trim() ? 0.6 : 1,
                  backgroundColor: !type.trim() ? colors.textTertiary : colors.primary
                }
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

export default TypeScreen;
