import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState,useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {useNavigation} from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import { checkEmailExists } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const EmailScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
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
    // Check if email exists
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setError('This email is already registered. Please use another.');
        return;
      }
    } catch (err) {
      setError('Error checking email. Please try again.');
      return;
    }
    setError('');
    saveRegistrationProgress('Email', { email });
    navigation.navigate('Password');
  };
  return (
    <SafeAreaView  style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{marginTop: 90, marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderColor: 'black',
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Fontisto name="email" size={26} color="black" />
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
            fontSize: 25,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginTop: 15,
          }}>
          Please provide a valid email
        </Text>

        <Text style={{marginTop: 30, fontSize: 15, color: 'gray'}}>
          Email verification helps us keep your account secure.{' '}
          <Text style={{color: '#581845', fontWeight: '500'}}>Learn more</Text>
        </Text>
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
          style={{
            width: 340,
            marginVertical: 10,
            fontSize: email ? 22 : 22,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            fontFamily: 'GeezaPro-Bold',
          }}
          placeholder="Enter your email"
          placeholderTextColor={'#BEBEBE'}
        />
        {error ? (
          <ErrorMessage message={error} />
        ) : null}
        <Text style={{color: 'gray', fontSize: 15, marginTop: 7}}>
          Note: You will be asked to verify your email
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{marginTop: 30, marginLeft: 'auto'}}>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={45}
            color="#581845"
            style={{alignSelf: 'center', marginTop: 20}}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({});
