import {StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,} from 'react-native';
import React, {useState, useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';


const { width, height } = Dimensions.get('window');

const NameScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  
  useEffect(() => {
    getRegistrationProgress('Name').then(progressData => {
      if (progressData) {
        setFirstName(progressData.firstName || '');
        setLastName(progressData.lastName || '');
      }
    });
  }, []);

  const handleNext = () => {
    if (firstName.trim() === '') {
      setError('First name is required.');
      return;
    }
    setError('');
    saveRegistrationProgress('Name', { firstName, lastName });
    navigation.navigate('Email');
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
            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              NO BACKGROUND CHECKS ARE CONDUCTED
            </Text>

            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="newspaper-variant-outline"
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
              What's your name?
            </Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <TextInput
                autoFocus={true}
                value={firstName}
                onChangeText={text => {
                  setFirstName(text);
                  if (text.trim() === '') {
                    setError('First name is required.');
                  } else {
                    setError('');
                  }
                }}
                style={styles.textInput}
                placeholder="First name (required)"
                placeholderTextColor={'#BEBEBE'}
                autoCapitalize="words"
                autoCorrect={false}
              />
              
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.textInput}
                placeholder="Last name"
                placeholderTextColor={'#BEBEBE'}
                autoCapitalize="words"
                autoCorrect={false}
              />
              
              <Text style={styles.optionalText}>
                Last name is optional.
              </Text>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  disclaimer: {
    textAlign: 'center',
    color: 'gray',
    fontSize: Math.min(width * 0.035, 14),
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    marginBottom: spacing.xl,
    color: '#000',
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
    marginBottom: spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif',
    color: '#000',
  },
  optionalText: {
    fontSize: Math.min(width * 0.035, 15),
    color: 'gray',
    fontFamily: typography.fontFamily.medium,
    marginTop: -10,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: 'red',
    marginTop: spacing.sm,
    fontSize: Math.min(width * 0.035, 14),
  },
  nextButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.lg,
  },
});

export default NameScreen;
