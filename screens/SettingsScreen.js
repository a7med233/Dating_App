import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>
      <Text style={{ fontSize: 16, color: 'gray', marginBottom: 40 }}>Settings screen coming soon!</Text>
      <CustomButton onPress={() => navigation.goBack()}>Back</CustomButton>
    </SafeAreaView>
  );
};

export default SettingsScreen; 