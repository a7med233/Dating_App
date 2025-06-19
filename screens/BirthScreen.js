import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';

const BirthScreen = () => {
  const navigation = useNavigation();
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleDayChange = text => {
    setDay(text);
    if (text.length == 2) {
      monthRef.current.focus();
    }
  };

  const handleMonthChange = text => {
    setMonth(text);
    if (text.length == 2) {
      yearRef.current.focus();
    }
  };

  const handleYearChange = text => {
    setYear(text);
  };
  useEffect(() => {
    // Fetch the registration progress data for the "Birth" screen
    getRegistrationProgress('Birth').then(progressData => {
      if (progressData) {
        const {dateOfBirth} = progressData;
        // Split the date of birth string into day, month, and year
        const [dayValue, monthValue, yearValue] = dateOfBirth.split('/');
        // Set the values in the component state
        setDay(dayValue);
        setMonth(monthValue);
        setYear(yearValue);
      }
    });
  }, []);

  const isValidDate = (d, m, y) => {
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (!day || !month || !year) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    // Check for valid day in month
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const isOldEnough = (y, m, d) => {
    const today = new Date();
    const birthDate = new Date(y, m - 1, d);
    const age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleNext = () => {
    if (day.trim() === '' || month.trim() === '' || year.trim() === '') {
      setError('All fields are required.');
      return;
    }
    if (!isValidDate(day, month, year)) {
      setError('Please enter a valid date.');
      return;
    }
    if (!isOldEnough(year, month, day)) {
      setError('You must be at least 18 years old.');
      return;
    }
    setError('');
    const dateOfBirth = `${day}/${month}/${year}`;
    saveRegistrationProgress('Birth', {dateOfBirth});
    navigation.navigate('Location');
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
            <MaterialCommunityIcons
              name="cake-variant-outline"
              size={26}
              color="black"
            />
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
          What's your date of birth?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 80,
            justifyContent: 'center',
          }}>
          {/* Day Input Field */}
          <TextInput
            autoFocus={true}
            style={{
              borderBottomWidth: 1,
              borderColor: 'black',
              padding: 10,
              width: 50,
              fontSize: day ? 20 : 20,
              fontFamily: 'GeezaPro-Bold',
            }}
            placeholder="DD"
            keyboardType="numeric"
            maxLength={2}
            onChangeText={handleDayChange}
            value={day}
          />

          {/* Month Input Field */}
          <TextInput
            ref={monthRef}
            style={{
              borderBottomWidth: 1,
              borderColor: 'black',
              padding: 10,
              width: 60,
              fontSize: month ? 20 : 20,
              fontFamily: 'GeezaPro-Bold',
            }}
            placeholder="MM"
            keyboardType="numeric"
            maxLength={2}
            onChangeText={handleMonthChange}
            value={month}
          />

          {/* Year Input Field */}
          <TextInput
            ref={yearRef}
            style={{
              borderBottomWidth: 1,
              borderColor: 'black',
              padding: 10,
              width: 75,
              fontSize: year ? 20 : 20,
              fontFamily: 'GeezaPro-Bold',
            }}
            placeholder="YYYY"
            keyboardType="numeric"
            maxLength={4}
            onChangeText={handleYearChange}
            value={year}
          />
        </View>
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
        {error ? (
          <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default BirthScreen;

const styles = StyleSheet.create({});
