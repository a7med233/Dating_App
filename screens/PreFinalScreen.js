import {Pressable, SafeAreaView, StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
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
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import ProfileCard from '../components/ProfileCard';
import Toast from '../components/Toast';

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
      };
      const response = await axios
        .post('http://10.0.2.2:3000/register', payload)
        .then(response => {
          const token = response.data.token;
          AsyncStorage.setItem('token', token);
          setToken(token)
        });
      setToast({ visible: true, message: 'Registration successful!', type: 'success' });
      clearAllScreenData();
    } catch (error) {
      setToast({ visible: true, message: 'Registration failed. Please try again.', type: 'error' });
      console.error('Error registering user:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log('user data', userData);

  if (userDataLoading) {
    return (
      <SafeAreaView style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
        <ActivityIndicator size="large" color="#900C3F" />
        <Text style={{marginTop:16}}>Loading your profile data...</Text>
      </SafeAreaView>
    );
  }

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
        onPress={() => userData ? setPreviewVisible(true) : null}
        style={{backgroundColor: '#581845', padding: 15, marginTop: 20, marginHorizontal: 20, borderRadius: 8}}>
        <Text style={{textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 15}}>
          Preview Profile
        </Text>
      </Pressable>

      <Pressable
        onPress={userData ? registerUser : undefined}
        style={{backgroundColor: '#900C3F', padding: 15, marginTop: 'auto'}}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: 15,
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
          <View style={{backgroundColor:'white',padding:24,borderRadius:12,alignItems:'center',maxWidth:350,maxHeight:'80%'}}>
            <Text style={{fontWeight:'bold',fontSize:18,marginBottom:8}}>Profile Preview</Text>
            <ScrollView style={{width: '100%'}} contentContainerStyle={{alignItems:'center'}}>
              <ProfileCard profile={userData || {}} />
              <Text style={{marginTop:10,fontWeight:'bold'}}>Prompts:</Text>
              {userData?.prompts && userData.prompts.length > 0 ? userData.prompts.map((p, i) => (
                <View key={i} style={{marginVertical:4}}>
                  <Text style={{fontWeight:'600'}}>{p.question}</Text>
                  <Text>{p.answer}</Text>
                </View>
              )) : <Text style={{color:'gray'}}>No prompts answered.</Text>}
              <Text style={{marginTop:10,fontWeight:'bold'}}>Dating Preferences:</Text>
              <Text>{userData?.datingPreferences?.join(', ') || 'None'}</Text>
              <Text style={{marginTop:10,fontWeight:'bold'}}>Looking For:</Text>
              <Text>{userData?.lookingFor || 'Not specified'}</Text>
              <Text style={{marginTop:10,fontWeight:'bold'}}>Location:</Text>
              <Text>{userData?.location || 'Not specified'}</Text>
              <Text style={{marginTop:10,fontWeight:'bold'}}>Hometown:</Text>
              <Text>{userData?.hometown || 'Not specified'}</Text>
            </ScrollView>
            <Pressable onPress={() => setPreviewVisible(false)} style={{backgroundColor:'#900C3F',padding:10,borderRadius:8,marginTop:16}}>
              <Text style={{color:'white',fontWeight:'bold'}}>Close</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
      {loading && (
        <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.2)',justifyContent:'center',alignItems:'center',zIndex:10}}>
          <ActivityIndicator size="large" color="#900C3F" />
        </View>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({});
