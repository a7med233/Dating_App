import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const BirthScreen = () => {
  const navigation = useNavigation();
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleDayChange = text => {
    setDay(text);
    if (text.length == 2) {
      monthRef.current.focus();
    }
  };

  const handleMonthChange = text => {
    setMonth(text);
    if (text.length == 2) {
      yearRef.current.focus();
    }
  };

  const handleYearChange = text => {
    setYear(text);
  };
  
  useEffect(() => {
    // Fetch the registration progress data for the "Birth" screen
    getRegistrationProgress('Birth').then(progressData => {
      if (progressData) {
        const {dateOfBirth} = progressData;
        // Split the date of birth string into day, month, and year
        const [dayValue, monthValue, yearValue] = dateOfBirth.split('/');
        // Set the values in the component state
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
    // Check for valid day in month
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

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="cake-variant-outline"
                  size={26}
                  color="black"
                />
              </View>
              <Image
                style={styles.logo}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
                }}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>
              What's your date of birth?
            </Text>

            {/* Date Input Fields */}
            <View style={styles.dateInputContainer}>
              {/* Day Input Field */}
              <TextInput
                autoFocus={true}
                style={styles.dayInput}
                placeholder="DD"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={handleDayChange}
                value={day}
              />

              {/* Month Input Field */}
              <TextInput
                ref={monthRef}
                style={styles.monthInput}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={handleMonthChange}
                value={month}
              />

              {/* Year Input Field */}
              <TextInput
                ref={yearRef}
                style={styles.yearInput}
                placeholder="YYYY"
                keyboardType="numeric"
                maxLength={4}
                onChangeText={handleYearChange}
                value={year}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Next Button */}
            <Pressable
              onPress={handleNext}
              style={{backgroundColor: colors.primary, padding: 15, marginTop: spacing.lg, borderRadius: borderRadius.medium}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.textInverse,
                  fontFamily: typography.fontFamily.semiBold,
                  fontSize: typography.fontSize.md,
                }}>
                Continue
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 90 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xlarge,
    borderColor: colors.textPrimary,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logo: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: Math.min(width * 0.06, 25),
    fontFamily: typography.fontFamily.bold,
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    marginBottom: spacing.xxl,
    color: '#000',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: spacing.xl,
  },
  dayInput: {
    borderBottomWidth: 1,
    borderColor: colors.textPrimary,
    padding: 10,
    width: Math.min(width * 0.15, 60),
    fontSize: Math.min(width * 0.05, 20),
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    textAlign: 'center',
    color: '#000',
  },
  monthInput: {
    borderBottomWidth: 1,
    borderColor: colors.textPrimary,
    padding: 10,
    width: Math.min(width * 0.15, 60),
    fontSize: Math.min(width * 0.05, 20),
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    textAlign: 'center',
    color: '#000',
  },
  yearInput: {
    borderBottomWidth: 1,
    borderColor: colors.textPrimary,
    padding: 10,
    width: Math.min(width * 0.2, 80),
    fontSize: Math.min(width * 0.05, 20),
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    textAlign: 'center',
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginTop: spacing.sm,
    fontSize: Math.min(width * 0.035, 14),
    textAlign: 'center',
  },
  nextButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.lg,
  },
});

export default BirthScreen;
