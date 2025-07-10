import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, ScrollView, TextInput, Pressable } from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import { io } from 'socket.io-client';
import { useRoute } from '@react-navigation/native';

const SOCKET_URL = 'http://192.168.0.116:3000'; // Socket.IO server now runs on port 3000

const SupportChatRoom = () => {
  const route = useRoute();
  const userId = route?.params?.userId;
  const [identifier, setIdentifier] = useState('');
  const [identifierSubmitted, setIdentifierSubmitted] = useState(!!userId);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef(null);
  const scrollViewRef = useRef();

  // Only fetch/create chat if we have a userId or identifier
  useEffect(() => {
    if (!userId && !identifierSubmitted) return;
    // Get or create support chat
    fetch(`${SOCKET_URL.replace(':8000', ':3000')}/support/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId ? { userId } : { identifier }),
    })
      .then(res => res.json())
      .then(data => {
        setChatId(data.chat._id);
        setMessages(data.chat.messages || []);
      });
  }, [userId, identifierSubmitted]);

  useEffect(() => {
    if (!chatId) return;
    // Connect to socket and join room
    const s = io(SOCKET_URL);
    s.emit('join_support_chat', chatId);
    s.on('support_message', ({ chatId: msgChatId, message: msg }) => {
      if (msgChatId === chatId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    // Clean up on unmount
    return () => {
      s.disconnect();
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !chatId) return;
    await fetch(`${SOCKET_URL.replace(':8000', ':3000')}/support/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text: message }),
    });
    setMessage('');
  };

  const formatTime = time => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(time).toLocaleString('en-US', options);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }}>
      {!userId && !identifierSubmitted && (
        <View style={{ padding: 16 }}>
          <Text style={{ marginBottom: spacing.sm }}>Enter your email so support can identify you:</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: borderRadius.small,
              padding: 8,
              marginBottom: spacing.sm,
            }}
          />
          <Pressable
            style={{
              backgroundColor: colors.primary,
              padding: 10,
              borderRadius: borderRadius.small,
              alignItems: 'center',
            }}
            onPress={() => {
              if (identifier.trim()) setIdentifierSubmitted(true);
            }}
          >
            <Text style={{ color: colors.textInverse, fontFamily: typography.fontFamily.bold }}>Start Chat</Text>
          </Pressable>
        </View>
      )}
      {(userId || identifierSubmitted) && (
        <>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}>
            {messages.map((item, idx) => (
              <Pressable
                key={idx}
                style={[
                  item.sender === 'user'
                    ? styles.userMsg
                    : styles.adminMsg,
                ]}>
                <Text style={styles.msgText}>{item.text}</Text>
                <Text style={styles.msgTime}>{formatTime(item.timestamp)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              placeholder="Type your message..."
            />
            <Pressable onPress={sendMessage} style={styles.sendBtn}>
              <Text style={{ color: colors.textInverse }}>Send</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    padding: 8,
    maxWidth: '60%',
    borderRadius: borderRadius.small,
    margin: 10,
  },
  adminMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#452c63',
    padding: 8,
    margin: 10,
    borderRadius: borderRadius.small,
    maxWidth: '60%',
  },
  msgText: {
    fontSize: typography.fontSize.md,
    color: colors.textInverse,
    fontFamily: typography.fontFamily.medium,
  },
  msgTime: {
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
    color: colors.backgroundSecondary,
    marginTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    marginBottom: spacing.xl,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: borderRadius.xlarge,
    paddingHorizontal: spacing.md,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.xlarge,
    marginLeft: 8,
  },
});

export default SupportChatRoom; 