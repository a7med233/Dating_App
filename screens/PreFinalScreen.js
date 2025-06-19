import {Pressable, SafeAreaView, StyleSheet, Text, View, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage/lib/commonjs/index.js';
import React, {useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import {useRoute} from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const PreFinalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    getAllUserData();
  }, []);

  console.log('Token:', token);

  useEffect(() => {
    // Check if the token is set and not in loading state
    if (token) {
      // Navigate to the main screen
      navigation.navigate('MainStack', { screen: 'Main' });
    }
  }, [token, navigation]);

  const getAllUserData = async () => {
    try {
      // Define an array to store data for each screen
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Photos',
        'Prompts',
      ]; // Add more screens as needed

      // Define an object to store user data
      let userData = {};

      // Retrieve data for each screen and add it to the user data object
      for (const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName);
        if (screenData) {
          userData = {...userData, ...screenData}; // Merge screen data into user data
        }
      }

      // Return the combined user data
      setUserData(userData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  };

  const clearAllScreenData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Photos',
        'Prompts',
      ];
      // Loop through each screen and remove its data from AsyncStorage
      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }
      console.log('All screen data cleared successfully');
    } catch (error) {
      console.error('Error clearing screen data:', error);
    }
  };

  const registerUser = async () => {
    try {
      setIsLoading(true);
      
      // For now, simulate a successful registration
      // In a real app, you would make an actual API call here
      console.log('Registering user with data:', userData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful registration
      const mockToken = 'mock_token_' + Date.now();
      await AsyncStorage.setItem('token', mockToken);
      setToken(mockToken);
      
      // Clear registration data
      await clearAllScreenData();
      
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Registration Error', 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('user data', userData);
  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{marginTop: 80}}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
          }}>
          All set to register
        </Text>
        <Text
          style={{
            fontSize: 33,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
            marginRight: 10,
            marginTop: 10,
          }}>
          Setting up your profile for you
        </Text>
      </View>

      <View>
        <LottieView
          source={require('../assets/love.json')}
          style={{
            height: 260,
            width: 300,
            alignSelf: 'center',
            marginTop: 40,
            justifyContent: 'center',
          }}
          autoPlay
          loop={true}
          speed={0.7}
        />
      </View>

      <Pressable
        onPress={registerUser}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#ccc' : '#900C3F', 
          padding: 15, 
          marginTop: 'auto',
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 8,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: 15,
          }}>
          {isLoading ? 'Registering...' : 'Finish registering'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({});