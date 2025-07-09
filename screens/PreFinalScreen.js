import {Pressable,  StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import React, {useContext, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../AuthContext';
import ProfileCard from '../components/ProfileCard';
import Toast from '../components/Toast';
import { registerUser as registerUserAPI } from '../services/api';

const PreFinalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [userDataLoading, setUserDataLoading] = useState(true);

  const { token, isLoading,setToken } = useContext(AuthContext);

  console.log(token)

  useEffect(() => {
    // Check if the token is set and not in loading state
    if (token) {
      // Navigate to the main screen
      navigation.navigate('MainStack', { screen: 'Main' });
    }
  }, [token, navigation]);

  useEffect(() => {
    getAllUserData();
  }, []);

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
      setUserDataLoading(false);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      setUserData(undefined);
      setUserDataLoading(false);
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
      setLoading(true);
      if (!userData) {
        setToast({ visible: true, message: 'User data is missing', type: 'error' });
        setLoading(false);
        return;
      }
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        email: userData.email,
        password: userData.password,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        type: userData.type,
        location: userData.location,
        hometown: userData.hometown,
        datingPreferences: userData.datingPreferences || [],
        lookingFor: userData.lookingFor,
        imageUrls: userData.imageUrls || [],
        prompts: userData.prompts || [],
        // Visibility settings
        genderVisible: userData.genderVisible !== false,
        typeVisible: userData.typeVisible !== false,
        lookingForVisible: userData.lookingForVisible !== false,
      };
      
      const response = await registerUserAPI(payload);
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      setToken(token);
      setToast({ visible: true, message: 'Registration successful!', type: 'success' });
      clearAllScreenData();
    } catch (error) {
      console.error('Error registering user:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data. Please check your information.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.message) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        }
      }
      
      setToast({ visible: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  console.log('user data', userData);

  if (userDataLoading) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background} style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:colors.textInverse}}>
        <ActivityIndicator size="large" color="colors.primary" />
        <Text style={{marginTop: spacing.md}}>Loading your profile data...</Text>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <View style={{marginTop: spacing.xxl}}>
        <Text
          style={{
            fontSize: typography.fontSize.display,
            fontFamily: typography.fontFamily.bold,
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
          }}>
          All set to register
        </Text>
        <Text
          style={{
            fontSize: typography.fontSize.display,
            fontFamily: typography.fontFamily.bold,
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
            marginRight: 10,
            marginTop: spacing.md,
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
            marginTop: spacing.xxl,
            justifyContent: 'center',
          }}
          autoPlay
          loop={true}
          speed={0.7}
        />
      </View>

      <Pressable
        onPress={() => userData ? setPreviewVisible(true) : null}
                  style={{backgroundColor: colors.primary, padding: 15, marginTop: spacing.lg, marginHorizontal: 20, borderRadius: borderRadius.small}}>
        <Text style={{textAlign: 'center', color: colors.textInverse, fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.md}}>
          Preview Profile
        </Text>
      </Pressable>

      <Pressable
        onPress={userData ? registerUser : undefined}
                  style={{backgroundColor: colors.primary, padding: 15, marginTop: 'auto'}}>
        <Text
          style={{
            textAlign: 'center',
            color: colors.textInverse,
            fontFamily: typography.fontFamily.semiBold,
            fontSize: typography.fontSize.md,
          }}>
          Finish registering
        </Text>
      </Pressable>

      <Modal
        visible={previewVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPressOut={() => setPreviewVisible(false)}>
          <View style={{backgroundColor:'#fff',padding:24,borderRadius: borderRadius.medium,alignItems:'center',maxWidth:350,maxHeight:'80%'}}>
            <Text style={{fontFamily: typography.fontFamily.bold,fontSize: typography.fontSize.lg,marginBottom: spacing.sm}}>Profile Preview</Text>
            <ScrollView style={{width: '100%'}} contentContainerStyle={{alignItems:'center'}}>
              <ProfileCard profile={userData || {}} />
              <Text style={{marginTop: spacing.md,fontFamily: typography.fontFamily.bold}}>Prompts:</Text>
              {userData?.prompts && userData.prompts.length > 0 ? userData.prompts.map((p, i) => (
                <View key={i} style={{marginVertical:4}}>
                  <Text style={{fontFamily: typography.fontFamily.semiBold}}>{p.question}</Text>
                  <Text>{p.answer}</Text>
                </View>
              )) : <Text style={{color:'gray'}}>No prompts answered.</Text>}
              <Text style={{marginTop: spacing.md,fontFamily: typography.fontFamily.bold}}>Dating Preferences:</Text>
              <Text>{userData?.datingPreferences?.join(', ') || 'None'}</Text>
              <Text style={{marginTop: spacing.md,fontFamily: typography.fontFamily.bold}}>Looking For:</Text>
              <Text>{userData?.lookingFor || 'Not specified'}</Text>
              <Text style={{marginTop: spacing.md,fontFamily: typography.fontFamily.bold}}>Location:</Text>
              <Text>{userData?.location || 'Not specified'}</Text>
              <Text style={{marginTop: spacing.md,fontFamily: typography.fontFamily.bold}}>Hometown:</Text>
              <Text>{userData?.hometown || 'Not specified'}</Text>
            </ScrollView>
            <Pressable onPress={() => setPreviewVisible(false)} style={{backgroundColor:colors.primary,padding:10,borderRadius: borderRadius.small,marginTop: spacing.md}}>
              <Text style={{color:colors.textInverse,fontFamily: typography.fontFamily.bold}}>Close</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
      {loading && (
        <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.2)',justifyContent:'center',alignItems:'center',zIndex:10}}>
          <ActivityIndicator size="large" color="colors.primary" />
        </View>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaWrapper>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({});
