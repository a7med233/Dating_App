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
      setToken(token)
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setLoginError('Invalid email or password.');
        } else if (error.response.status === 403) {
          setLoginError(error.response.data.message || 'Your account has been banned. Please contact support.');
        } else if (error.response.status === 500) {
          setLoginError('Server error. Please try again later.');
        } else {
          setLoginError('Login failed. Please try again.');
        }
      } else if (error.message) {
        if (error.message.includes('Network error')) {
          setLoginError('Network error. Please check your internet connection.');
        } else if (error.message.includes('timeout')) {
          setLoginError('Request timeout. Please try again.');
        } else {
          setLoginError('Login failed. Please try again.');
        }
      } else {
        setLoginError('Network error. Please try again.');
      }
    }
  };
  
  const createAccount = () => {
    setOption('Create account');
    navigation.navigate('Basic');
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
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
              {/* Heart + Flame Icon */}
              <View style={styles.iconContainer}>
                <Entypo name="heart" size={40} color={colors.textInverse} />
                <MaterialIcons 
                  name="local-fire-department" 
                  size={35} 
                  color={colors.warmOrange} 
                  style={styles.flameIcon}
                />
              </View>
              <Text style={styles.appName}>lashwa</Text>
              <Text style={styles.tagline}>Designed to be deleted</Text>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Brand Container */}
            <ThemedCard variant="elevated" padding="large" margin="medium">
              <View style={styles.brandContainer}>
                <Image
                  style={styles.brandLogo}
                  source={{
                    uri: 'https://branditechture.agency/brand-logos/wp-content/uploads/wpdm-cache/Hinge-App-900x0.png',
                  }}
                />
              </View>
            </ThemedCard>

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

                  {/* Contact Support Button */}
                  <GradientButton
                    title="Contact Support"
                    onPress={() => navigation.navigate('SupportChatRoom', { userId: null })}
                    variant="outline"
                    style={styles.supportButton}
                  />
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
                  title="Create account"
                  onPress={createAccount}
                  variant={option == 'Create account' ? 'primary' : 'outline'}
                  style={styles.actionButton}
                  gradient={option == 'Create account' ? 'primary' : undefined}
                />

                <GradientButton
                  title="Sign In"
                  onPress={signInUser}
                  variant={option == 'Sign In' ? 'primary' : 'outline'}
                  style={styles.actionButton}
                  gradient={option == 'Sign In' ? 'primary' : undefined}
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
    height: 280,
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  flameIcon: {
    marginLeft: -10,
    marginTop: -5,
  },
  appName: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textInverse,
    letterSpacing: 2,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textInverse,
    opacity: 0.9,
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  brandContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
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
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    color: colors.textPrimary,
    marginVertical: spacing.sm,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
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
    fontFamily: typography.fontFamily.regular,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  errorContainer: {
    minHeight: 40,
    justifyContent: 'center',
    marginTop: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  supportButton: {
    marginTop: spacing.lg,
    width: '100%',
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
    marginTop: spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
    maxWidth: 300,
  },
});
