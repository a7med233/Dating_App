import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { atob, btoa } from 'base-64';
import UserChat from '../components/UserChat';
import { useFocusEffect } from '@react-navigation/native';
import { getUserMatches } from '../services/api';

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const ChatScreen = () => {
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState('');
  useEffect(() => {
    console.log('hi');
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);
  const fetchMatchesHandler = async () => {
    try {
      const response = await getUserMatches(userId);
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMatchesHandler();
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchMatchesHandler();
      }
    }, [userId]),
  );
  console.log('matches', matches);
  return (
    <ScrollView style={{marginTop: 55, padding: 12}}>
      <View>
        <Text style={{fontSize: 20, fontWeight: '500'}}>Your Matches</Text>
        <View style={{marginVertical:12}}>
          {matches?.map((item, index) => (
            <UserChat key={index} userId={userId} item={item} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
