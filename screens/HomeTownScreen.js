import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { Ionicons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';


const { width, height } = Dimensions.get('window');

const HomeTownScreen = () => {
  const [hometown, setHometown] = useState('');
    const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        getRegistrationProgress('Hometown').then(progressData => {
          if (progressData) {
            setHometown(progressData.hometown || '');
          }
        });
      }, []);
    
      const handleNext = () => {
        if (hometown.trim() === '') {
          setError('Please enter your hometown.');
          return;
        }
        setError('');
        saveRegistrationProgress('Hometown', {hometown});
    navigation.navigate('AdditionalInfo');
      };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTextChange = (text) => {
            setHometown(text);
            if (text.trim() === '') {
              setError('Please enter your hometown.');
            } else {
              setError('');
            }
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background} edges={['top', 'left', 'right']}>
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
                <Ionicons name="location" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Hometown</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Where's your hometown?</Text>
              <Text style={styles.subtitle}>
                This helps us show you people from your area or with similar backgrounds.
              </Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons 
                    name="location-outline" 
                    size={20} 
                    color={isFocused ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <TextInput
                  value={hometown}
                  onChangeText={handleTextChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={[
                    styles.textInput,
                    isFocused && styles.textInputFocused
                  ]}
                  placeholder="Enter your hometown"
                  placeholderTextColor={colors.textTertiary}
          autoFocus={true}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
        />
              </View>
              
              {/* Error Message */}
        {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
                </View>
        ) : null}
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Your hometown helps us connect you with people from similar areas or backgrounds. This can be a great conversation starter!
              </Text>
            </View>

            {/* Examples Section */}
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Examples:</Text>
              <View style={styles.examplesContainer}>
                <View style={styles.exampleChip}>
                  <Text style={styles.exampleText}>New York, NY</Text>
                </View>
                <View style={styles.exampleChip}>
                  <Text style={styles.exampleText}>Los Angeles, CA</Text>
                </View>
                <View style={styles.exampleChip}>
                  <Text style={styles.exampleText}>Chicago, IL</Text>
                </View>
                <View style={styles.exampleChip}>
                  <Text style={styles.exampleText}>Miami, FL</Text>
                </View>
              </View>
            </View>

            {/* Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
              disabled={!hometown.trim()}
              style={[
                styles.continueButton,
                {
                  opacity: !hometown.trim() ? 0.6 : 1,
                  backgroundColor: !hometown.trim() ? colors.textTertiary : colors.primary
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
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  inputIconContainer: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  textInputFocused: {
    borderColor: colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
  examplesSection: {
    marginBottom: spacing.xl,
  },
  examplesTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  exampleChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
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

export default HomeTownScreen;