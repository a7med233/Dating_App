import {StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,} from 'react-native';
import React, {useState, useEffect} from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';


const { width, height } = Dimensions.get('window');

const PasswordScreen = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getRegistrationProgress('Password').then((progressData) => {
      if (progressData) {
        setPassword(progressData.password || '');
      }
    });
  }, []);

  const handleNext = () => {
    if (password.trim() === '') {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    saveRegistrationProgress('Password', {password});
    navigation.navigate('Birth');
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
                <MaterialIcons name="lock" size={26} color="black" />
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
              Please choose your password
            </Text>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  secureTextEntry={!showPassword}
                  autoFocus={true}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (text.trim() === '') {
                      setError('Password is required.');
                    } else if (text.length < 6) {
                      setError('Password must be at least 6 characters.');
                    } else {
                      setError('');
                    }
                  }}
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={'#BEBEBE'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Note */}
            <Text style={styles.note}>
              Note: Your details will be safe with us.
            </Text>

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
    marginBottom: spacing.md,
    color: '#000',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: colors.textPrimary,
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.055, 22),
    paddingBottom: 10,
    paddingTop: 5,
    paddingRight: 40, // Space for the eye icon
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: spacing.sm,
    fontSize: Math.min(width * 0.035, 14),
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

export default PasswordScreen;
