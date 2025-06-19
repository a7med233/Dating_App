import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import React, {useState, useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';

const PasswordScreen = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
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
          Please choose your password
        </Text>

        <TextInput
          secureTextEntry={true}
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
          style={{
            width: 340,
            marginVertical: 10,
            fontSize: password ? 22 : 22,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            fontFamily: 'GeezaPro-Bold',
          }}
          placeholder="Enter your password"
          placeholderTextColor={'#BEBEBE'}
        />
        {error ? (
          <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>
        ) : null}
        <Text style={{color: 'gray', fontSize: 15, marginTop: 7}}>
          Note: Your details will be safe with us.
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

export default PasswordScreen;

const styles = StyleSheet.create({});
