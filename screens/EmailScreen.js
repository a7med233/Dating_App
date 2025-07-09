import {StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,} from 'react-native';
import React, {useState,useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {useNavigation} from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import { checkEmailExists } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const EmailScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  useEffect(() => {
    getRegistrationProgress('Email').then((progressData) => {
      if (progressData) {
        setEmail(progressData.email || '');
      }
    });
  }, []);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleNext = async () => {
    if (email.trim() === '') {
      setError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Check if email exists
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setError('This email is already registered. Please use another.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Email check failed:', err);
      setError(err.message || 'Error checking email. Please try again.');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    setError('');
    saveRegistrationProgress('Email', { email });
    navigation.navigate('Password');
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
                <Fontisto name="email" size={26} color="black" />
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
              Please provide a valid email
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              Email verification helps us keep your account secure.{' '}
              <Text style={styles.learnMore}>Learn more</Text>
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                autoFocus={true}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (text.trim() === '') {
                    setError('Email is required.');
                  } else if (!validateEmail(text)) {
                    setError('Please enter a valid email address.');
                  } else {
                    setError('');
                  }
                }}
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor={'#BEBEBE'}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <ErrorMessage message={error} />
            ) : null}

            {/* Note */}
            <Text style={styles.note}>
              Note: You will be asked to verify your email
            </Text>
            
            {/* Next Button */}
            <Pressable
              onPress={handleNext}
              disabled={isLoading}
              style={{backgroundColor: colors.primary, padding: 15, marginTop: spacing.lg, borderRadius: borderRadius.medium, opacity: isLoading ? 0.6 : 1}}>
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.textInverse} />
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.textInverse,
                    fontFamily: typography.fontFamily.semiBold,
                    fontSize: typography.fontSize.md,
                  }}>
                  Continue
                </Text>
              )}
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
    marginBottom: spacing.md,
    color: '#000',
  },
  description: {
    fontSize: Math.min(width * 0.04, 15),
    color: 'gray',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  learnMore: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  textInput: {
    fontSize: Math.min(width * 0.055, 22),
    borderBottomColor: colors.textPrimary,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    color: '#000',
  },
  note: {
    color: 'gray',
    fontSize: Math.min(width * 0.035, 15),
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  nextButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.lg,
  },
});

export default EmailScreen;
