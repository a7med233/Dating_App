import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from 'react-native';
import React, {useState, useLayoutEffect, useEffect} from 'react';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {io} from 'socket.io-client';
import { fetchMessages } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  console.log(route?.params)
  const socket = io('http://10.0.2.2:8000');
  const [messages, setMessages] = useState([]);
  socket.on('connect', () => {
    console.log('Connected to the Socket.IO server');
  });
  socket.on('receiveMessage', newMessage => {
    console.log('new Message', newMessage);

    //update the state to include new message
    setMessages(prevMessages => [...prevMessages, newMessage]);
  });
  const sendMessage = async (senderId, receiverId) => {
    socket.emit('sendMessage', {senderId, receiverId, message});

    setMessage('');

    // call the fetchMessages() function to see the UI update
    setTimeout(() => {
      fetchMessagesHandler();
    }, 200);
  };

  useLayoutEffect(() => {
    return navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.bold}}>
              {route?.params?.name}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons name="videocam-outline" size={24} color="black" />
        </View>
      ),
    });
  }, []);

  const fetchMessagesHandler = async () => {
    try {
      const senderId = route?.params?.senderId;
      const receiverId = route?.params?.receiverId;
      const response = await fetchMessages({ senderId, receiverId });
      setMessages(response.data);
    } catch (error) {
      console.log('Error fetching the messages', error);
    }
  };

  useEffect(() => {
    fetchMessagesHandler();
  }, []);
  const formatTime = time => {
    const options = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString('en-US', options);
  };
  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: colors.textInverse}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        {messages?.map((item, index) => (
          <Pressable
            key={index}
            style={[
              item?.senderId === route?.params?.senderId
                ? {
                    alignSelf: 'flex-end',
                    backgroundColor: colors.primary,
                    padding: 8,
                    maxWidth: '60%',
                    borderRadius: borderRadius.small,
                    margin: 10,
                  }
                : {
                    alignSelf: 'flex-start',
                    backgroundColor: '#452c63',
                    padding: 8,
                    margin: 10,
                    borderRadius: borderRadius.small,
                    maxWidth: '60%',
                  },
            ]}>
            <Text
              style={{
                fontSize: typography.fontSize.md,
                textAlign: 'left',
                color: colors.textInverse,
                fontFamily: typography.fontFamily.medium,
              }}>
              {item?.message}
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                textAlign: 'right',
                color: colors.backgroundSecondary,
                marginTop: spacing.sm,
              }}>
              {formatTime(item?.timestamp)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#dddddd',
          marginBottom: spacing.xl,
        }}>
        <Entypo
          style={{marginRight: 7}}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        <TextInput
          value={message}
          onChangeText={text => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: '#dddddd',
            borderRadius: borderRadius.xlarge,
            paddingHorizontal: spacing.md,
          }}
          placeholder="Type your message..."
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginHorizontal: 8,
          }}>
          <Entypo name="camera" size={24} color="gray" />

          <Feather name="mic" size={24} color="gray" />
        </View>

        <Pressable
          onPress={() =>
            sendMessage(route?.params?.senderId, route?.params?.receiverId)
          }
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
            borderRadius: borderRadius.xlarge,
          }}>
          <Text style={{textAlign: 'center', color: colors.textInverse}}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({});
