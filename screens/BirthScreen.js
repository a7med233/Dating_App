import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useRef, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';


const { width, height } = Dimensions.get('window');

const BirthScreen = () => {
  const navigation = useNavigation();
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());

  const handleDayChange = text => {
    const numericText = text.replace(/[^0-9]/g, '');
    setDay(numericText);
    if (numericText.length === 2) {
      monthRef.current.focus();
    }
  };

  const handleMonthChange = text => {
    const numericText = text.replace(/[^0-9]/g, '');
    setMonth(numericText);
    if (numericText.length === 2) {
      yearRef.current.focus();
    }
  };

  const handleYearChange = text => {
    const numericText = text.replace(/[^0-9]/g, '');
    setYear(numericText);
  };

  const handleDatePickerChange = (event, date) => {
    if (Platform.OS === 'android') {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const dayValue = date.getDate().toString().padStart(2, '0');
      const monthValue = (date.getMonth() + 1).toString().padStart(2, '0');
      const yearValue = date.getFullYear().toString();
      setDay(dayValue);
      setMonth(monthValue);
      setYear(yearValue);
      setError('');
    }
    } else {
      // iOS: Update temp date for preview
      if (date) {
        setTempDate(date);
      }
    }
  };

  const confirmDateSelection = () => {
    setSelectedDate(tempDate);
    const dayValue = tempDate.getDate().toString().padStart(2, '0');
    const monthValue = (tempDate.getMonth() + 1).toString().padStart(2, '0');
    const yearValue = tempDate.getFullYear().toString();
    setDay(dayValue);
    setMonth(monthValue);
    setYear(yearValue);
    setError('');
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setTempDate(selectedDate);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(selectedDate);
    setShowDatePicker(true);
  };
  
  useEffect(() => {
    getRegistrationProgress('Birth').then(progressData => {
      if (progressData) {
        const {dateOfBirth} = progressData;
        const [dayValue, monthValue, yearValue] = dateOfBirth.split('/');
        setDay(dayValue);
        setMonth(monthValue);
        setYear(yearValue);
      }
    });
  }, []);

  const isValidDate = (d, m, y) => {
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (!day || !month || !year) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const isOldEnough = (y, m, d) => {
    const today = new Date();
    const birthDate = new Date(y, m - 1, d);
    const age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleNext = () => {
    if (day.trim() === '' || month.trim() === '' || year.trim() === '') {
      setError('All fields are required.');
      return;
    }
    if (!isValidDate(day, month, year)) {
      setError('Please enter a valid date.');
      return;
    }
    if (!isOldEnough(year, month, day)) {
      setError('You must be at least 18 years old.');
      return;
    }
    setError('');
    const dateOfBirth = `${day}/${month}/${year}`;
    saveRegistrationProgress('Birth', {dateOfBirth});
    navigation.navigate('Location');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getAge = () => {
    if (day && month && year && isValidDate(day, month, year)) {
      const today = new Date();
      const birthDate = new Date(year, month - 1, day);
      const age = today.getFullYear() - birthDate.getFullYear();
      const mDiff = today.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    }
    return null;
  };

  const age = getAge();

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
                <Ionicons name="calendar-outline" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Birthday</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>When's your birthday?</Text>
              <Text style={styles.subtitle}>
                We need this to verify your age and show you relevant matches.
            </Text>
            </View>

            {/* Date Picker Button */}
            <View style={styles.datePickerSection}>
              <TouchableOpacity
              onPress={openDatePicker}
                style={[
                  styles.datePickerButton,
                  day && month && year && { borderColor: colors.primary, backgroundColor: colors.primary + '05' }
                ]}
              >
                <Ionicons 
                  name="calendar-outline" 
                size={24}
                  color={day && month && year ? colors.primary : colors.textSecondary} 
              />
                <Text style={[
                  styles.datePickerText,
                  day && month && year && { color: colors.primary, fontFamily: typography.fontFamily.semiBold }
                ]}>
                {day && month && year ? `${day}/${month}/${year}` : 'Select your date of birth'}
              </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Age Display */}
              {age && (
                <View style={styles.ageContainer}>
                  <Ionicons name="person-outline" size={16} color={colors.success} />
                  <Text style={styles.ageText}>You are {age} years old</Text>
                </View>
              )}
            </View>

            {/* Manual Input Option */}
            <View style={styles.manualInputSection}>
            <Text style={styles.orText}>or enter manually:</Text>

            {/* Date Input Fields */}
            <View style={styles.dateInputContainer}>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Day</Text>
              <TextInput
                style={styles.dayInput}
                placeholder="DD"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={handleDayChange}
                value={day}
                    placeholderTextColor={colors.textTertiary}
              />
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Month</Text>
              <TextInput
                ref={monthRef}
                style={styles.monthInput}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={handleMonthChange}
                value={month}
                    placeholderTextColor={colors.textTertiary}
              />
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                ref={yearRef}
                style={styles.yearInput}
                placeholder="YYYY"
                keyboardType="numeric"
                maxLength={4}
                onChangeText={handleYearChange}
                value={year}
                    placeholderTextColor={colors.textTertiary}
              />
                </View>
              </View>
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
                You must be at least 18 years old to use this app. Your age will be visible to other users.
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={!day.trim() || !month.trim() || !year.trim() || !isValidDate(day, month, year) || !isOldEnough(year, month, day)}
              style={[
                styles.continueButton,
                {
                  opacity: (!day.trim() || !month.trim() || !year.trim() || !isValidDate(day, month, year) || !isOldEnough(year, month, day)) ? 0.6 : 1,
                  backgroundColor: (!day.trim() || !month.trim() || !year.trim() || !isValidDate(day, month, year) || !isOldEnough(year, month, day)) ? colors.textTertiary : colors.primary
                }
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal - iOS Only */}
      {showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            activeOpacity={1} 
            onPress={cancelDateSelection}
          />
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={cancelDateSelection} style={styles.headerButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={confirmDateSelection} style={styles.headerButton}>
                <Text style={styles.confirmButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDatePickerChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.datePicker}
            />
          </View>
        </View>
      )}

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
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
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
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
  datePickerSection: {
    marginBottom: spacing.xl,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  datePickerText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.success + '20',
  },
  ageText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
  },
  manualInputSection: {
    marginBottom: spacing.xl,
  },
  orText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.medium,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dayInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
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
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg, // Account for home indicator
    ...shadows.large,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  datePickerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  datePicker: {
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
});

export default BirthScreen;
