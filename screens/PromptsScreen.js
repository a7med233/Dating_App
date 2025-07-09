import {Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,} from 'react-native';
import React, {useState, useEffect} from 'react';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getRegistrationProgress, saveRegistrationProgress} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerUser} from '../services/api';
import {StackActions} from '@react-navigation/native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const PromptsScreen = () => {
  const route = useRoute();

  console.log('he', route?.params?.PromptsScreen);
  const navigation = useNavigation();
  const [userData, setUserData] = useState();
  const [error, setError] = useState('');
  const [prompts, setPrompts] = useState([]);

  const getAllUserData = async () => {
    try {
      const nameData = await getRegistrationProgress('Name');
      const emailData = await getRegistrationProgress('Email');
      const passwordData = await getRegistrationProgress('Password');
      const birthData = await getRegistrationProgress('Birth');
      const locationData = await getRegistrationProgress('Location');
      const genderData = await getRegistrationProgress('Gender');
      const hometownData = await getRegistrationProgress('Hometown');
      const lookingForData = await getRegistrationProgress('LookingFor');
      const typeData = await getRegistrationProgress('Type');
      const promptsData = await getRegistrationProgress('Prompts');
      const photoData = await getRegistrationProgress('Photo');

      const allData = {
        name: nameData,
        email: emailData,
        password: passwordData,
        birth: birthData,
        location: locationData,
        gender: genderData,
        hometown: hometownData,
        lookingFor: lookingForData,
        type: typeData,
        prompts: promptsData,
        photo: photoData,
      };

      console.log('All registration data:', allData);
      setUserData(allData);
      if (promptsData) {
        setPrompts(promptsData.prompts || []);
      }
      return allData;
    } catch (error) {
      console.error('Error getting all user data:', error);
      return null;
    }
  };

  // Update local state when prompts are received from route params
  useEffect(() => {
    if (route?.params?.prompts) {
      setPrompts(route.params.prompts);
    }
  }, [route?.params?.prompts]);

  const registerUserHandler = async userData => {
    try {
      const payload = {
        ...userData,
        prompts: userData.prompts || [],
      };
      const response = await registerUser(payload);
      const token = response.data.token;
      AsyncStorage.setItem('token', token);
      clearAllScreenData();
      navigation.replace('Main');
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const handleNext = () => {
    const currentPrompts = route?.params?.prompts || prompts;
    if (currentPrompts.length === 0) {
      setError('Please add at least one prompt.');
      return;
    }
    setError('');
    saveRegistrationProgress('Prompts', {prompts: currentPrompts});
    navigation.navigate('PreFinal');
  };
  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.content}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: borderRadius.xlarge,
              borderColor: colors.textPrimary,
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesign name="eye" size={22} color="black" />
          </View>
          <Image
            style={{width: 100, height: 40}}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>
        <Text
          style={{
            fontSize: typography.fontSize.xxxl,
            fontFamily: typography.fontFamily.bold,
            fontFamily: 'GeezaPro-Bold',
            marginTop: spacing.md,
          }}>
          Write your profile answers
        </Text>

        <View style={{marginTop: spacing.lg, flexDirection: 'column', gap: 20}}>
          {/* Show existing prompts */}
          {route?.params?.prompts && route.params.prompts.length > 0 && (
            route.params.prompts.map((item, index) => (
              <Pressable
                key={`prompt-${index}-${item?.question}`}
                onPress={() => navigation.navigate('ShowPrompts', { prompts: route.params.prompts })}
                style={{
                  borderColor: '#707070',
                  borderWidth: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: borderRadius.medium,
                  height: 70,
                }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.semiBold,
                    fontStyle: 'italic',
                    fontSize: typography.fontSize.md,
                  }}>
                  {item?.question}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.semiBold,
                    fontStyle: 'italic',
                    fontSize: typography.fontSize.md,
                    marginTop: spacing.xs,
                  }}>
                  {item?.answer}
                </Text>
              </Pressable>
            ))
          )}
          
          {/* Show placeholder prompts for adding more (up to 3 total) */}
          {(!route?.params?.prompts || route.params.prompts.length < 3) && (
            <View>
              {Array.from({ length: 3 - (route?.params?.prompts?.length || 0) }).map((_, index) => (
                <Pressable
                  key={`prompt-placeholder-${index}`}
                  onPress={() => navigation.navigate('ShowPrompts', { 
                    prompts: route?.params?.prompts || [] 
                  })}
                  style={{
                    borderColor: '#707070',
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderStyle: 'dashed',
                    borderRadius: borderRadius.medium,
                    height: 70,
                    marginBottom: index < 2 ? 15 : 0,
                  }}>
                  <Text
                    style={{
                      color: 'gray',
                      fontFamily: typography.fontFamily.semiBold,
                      fontStyle: 'italic',
                      fontSize: typography.fontSize.md,
                    }}>
                    Select a Prompt
                  </Text>
                  <Text
                    style={{
                      color: 'gray',
                      fontFamily: typography.fontFamily.semiBold,
                      fontStyle: 'italic',
                      fontSize: typography.fontSize.md,
                      marginTop: spacing.xs,
                    }}>
                    And write your own answer
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{marginTop: spacing.xl, marginLeft: 'auto'}}>
          <AntDesign
            name="arrow-right-circle"
            size={45}
            color="colors.primary"
            style={{alignSelf: 'center', marginTop: spacing.lg}}
          />
        </TouchableOpacity>
        {error ? (
          <Text style={{ color: 'red', marginTop: spacing.sm }}>{error}</Text>
        ) : null}
      </View>
    </SafeAreaWrapper>
  );
};

export default PromptsScreen;

const styles = StyleSheet.create({
  content: {
    marginHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20,
    flex: 1,
  },
});
