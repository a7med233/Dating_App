import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, {useState,useEffect,useContext} from 'react';
import { Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext';
import { loginUser } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const route = useRoute();
  console.log(route)
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [option, setOption] = useState('Create account');
  const { token, isLoading,setToken } = useContext(AuthContext);
  const [loginError, setLoginError] = useState('');

  console.log(token)

  useEffect(() => {
    // Check if the token is set and not in loading state
    if (token) {
      // Navigate to the main screen
      navigation.navigate('MainStack', { screen: 'Main' });
    }
  }, [token, navigation]);
  
  const signInUser = async() => {
    setOption('Sign In');
    setLoginError('');
    
    // Validate inputs before making API call
    if (!email.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }
    
    if (!password.trim()) {
      setLoginError('Please enter your password.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    
    try {
      const user = {
        email: email.trim(),
        password: password,
      };
      const response = await loginUser(user);
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      setToken(token);
      
      // Clear any previous errors on successful login
      setLoginError('');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || '';
        
        switch (status) {
          case 400:
            setLoginError('Please check your email and password format.');
            break;
          case 401:
            // Use the specific message from the backend
            if (errorMessage.includes('Invalid email or password')) {
              setLoginError('Email or password is incorrect. Please try again.');
            } else if (errorMessage.includes('Invalid password')) {
              setLoginError('Password is incorrect. Please try again.');
            } else {
              setLoginError(errorMessage || 'Email or password is incorrect. Please try again.');
            }
            break;
          case 403:
            if (errorMessage.toLowerCase().includes('banned') || errorMessage.toLowerCase().includes('suspended')) {
              setLoginError('Your account has been suspended. Please contact support for assistance.');
        } else {
              setLoginError('Access denied. Please contact support.');
            }
            break;
          case 404:
            setLoginError('Account not found. Please check your email or create a new account.');
            break;
          case 429:
            setLoginError('Too many login attempts. Please wait a few minutes before trying again.');
            break;
          case 500:
            setLoginError('Server error. Please try again in a few minutes.');
            break;
          default:
            setLoginError(errorMessage || 'Login failed. Please try again.');
        }
      } else if (error.message) {
        if (error.message.includes('Network error') || error.message.includes('fetch')) {
          setLoginError('No internet connection. Please check your network and try again.');
        } else if (error.message.includes('timeout')) {
          setLoginError('Request timed out. Please check your connection and try again.');
        } else if (error.message.includes('Failed to fetch')) {
          setLoginError('Unable to connect to server. Please try again later.');
        } else {
          setLoginError('Login failed. Please try again.');
        }
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    }
  };
  
  const createAccount = () => {
    setOption('Create account');
    navigation.navigate('BasicInfo');
  };
  
  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };
    loginUser(user).then(response => {
      const token = response.data.token;
      AsyncStorage.setItem('auth', token);
      router.replace('/(authenticate)/select');
    });
  };
  
  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
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
            <View style={styles.logoContainer}>
              {/* Lashwa Logo */}
              <Image 
                source={require('../assets/lashwa_white_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
                />
              <Text style={styles.tagline}>Designed to be deleted</Text>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Form Section */}
            <View style={styles.formSection}>
              {option == 'Sign In' ? (
                <>
                  {/* Email Input */}
                  <ThemedCard variant="outlined" padding="medium" margin="small">
                    <View style={styles.inputContainer}>
                      <MaterialIcons
                        style={styles.inputIcon}
                        name="email"
                        size={24}
                        color={colors.primary}
                      />
                      <TextInput
                        value={email}
                        onChangeText={text => setEmail(text)}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textTertiary}
                        style={styles.textInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </ThemedCard>

                  {/* Password Input */}
                  <ThemedCard variant="outlined" padding="medium" margin="small">
                    <View style={styles.inputContainer}>
                      <AntDesign
                        style={styles.inputIcon}
                        name="lock1"
                        size={24}
                        color={colors.primary}
                      />
                      <TextInput
                        value={password}
                        onChangeText={text => setPassword(text)}
                        secureTextEntry={true}
                        placeholder="Enter your password"
                        style={styles.textInput}
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="none"
                      />
                    </View>
                  </ThemedCard>

                  {/* Remember Me & Forgot Password */}
                  <View style={styles.rememberForgotContainer}>
                    <Text style={styles.rememberText}>Keep me logged in</Text>
                    <Text style={styles.forgotPasswordText}>Forgot Password</Text>
                  </View>

                  {/* Error Message */}
                  <View style={styles.errorContainer}>
                    {loginError ? (
                      <Text style={styles.errorText}>{loginError}</Text>
                    ) : (
                      <Text style={styles.errorText}>&nbsp;</Text>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.animationContainer}>
                  <LottieView
                    source={require('../assets/login.json')}
                    style={styles.animation}
                    autoPlay
                    loop={true}
                    speed={0.7}
                  />
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Sign In"
                  onPress={signInUser}
                  variant={option == 'Sign In' ? 'primary' : 'outline'}
                  size="medium"
                  style={styles.actionButton}
                  gradient={option == 'Sign In' ? 'primary' : undefined}
                />

                <GradientButton
                  title="Create account"
                  onPress={createAccount}
                  variant={option == 'Create account' ? 'primary' : 'outline'}
                  size="medium"
                  style={styles.actionButton}
                  gradient={option == 'Create account' ? 'primary' : undefined}
                />

                <GradientButton
                  title="Contact Support"
                  onPress={() => navigation.navigate('SupportChatRoom', { userId: null })}
                  variant="outline"
                  size="medium"
                  style={styles.supportButton}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 260,
    height: 110,
    marginBottom: spacing.md,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textInverse,
    opacity: 0.95,
    textAlign: 'center',
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  formSection: {
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  inputIcon: {
    marginRight: spacing.md,
    opacity: 0.8,
  },
  textInput: {
    color: colors.textPrimary,
    marginVertical: spacing.xs,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    paddingVertical: spacing.xs,
  },
  rememberForgotContainer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  rememberText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  errorContainer: {
    minHeight: 40,
    justifyContent: 'center',
    marginTop: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    paddingHorizontal: spacing.xs,
  },
  supportButton: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 300,
  },
  animationContainer: {
    marginTop: spacing.xl,
  },
  animation: {
    height: 200,
    width: 300,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    width: '100%',
    maxWidth: 300,
  },
});
