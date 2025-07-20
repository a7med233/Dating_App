import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import { useRoute } from '@react-navigation/native';

import { getApiBaseUrl } from '../utils/socketConfig';
import { httpChatManager } from '../utils/httpChat';

const SupportChatRoom = () => {
  const route = useRoute();
  const userId = route?.params?.userId;
  const [identifier, setIdentifier] = useState('');
  const [identifierSubmitted, setIdentifierSubmitted] = useState(!!userId);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  // Only fetch/create chat if we have a userId or identifier
  useEffect(() => {
    if (!userId && !identifierSubmitted) return;
    
    const fetchChat = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        // Get or create support chat
        const response = await fetch(`${apiBaseUrl}/support/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userId ? { userId } : { identifier }),
        });
        const data = await response.json();
        setChatId(data.chat._id);
        setMessages(data.chat.messages || []);
      } catch (error) {
        console.error('Error fetching support chat:', error);
      }
    };
    
    fetchChat();
  }, [userId, identifierSubmitted]);

  useEffect(() => {
    if (!chatId) return;
    
    const startPolling = () => {
      try {
        console.log('Starting HTTP polling for support messages');
        
        // Start background polling for new messages every 3 seconds (silent and smooth)
        const interval = setInterval(async () => {
          try {
            // Background fetch - don't show loading state
            await fetchSupportMessages(true); // true = background fetch
          } catch (error) {
            console.log('Support background polling error:', error);
          }
        }, 3000);
        
        setPollingInterval(interval);
        
        return () => {
          clearInterval(interval);
        };
      } catch (error) {
        console.error('Error starting support polling:', error);
      }
    };
    
    const cleanup = startPolling();
    
    return () => {
      if (cleanup) cleanup();
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [chatId]);

  const fetchSupportMessages = async (isBackground = false) => {
    // For background fetches, don't show loading state
    if (loading && !isBackground) {
      console.log('Skipping support fetch - already loading');
      return;
    }
    
    try {
      if (!isBackground) {
        setLoading(true);
      }
      
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/support/chat/${chatId}`);
      const data = await response.json();
      
      const newMessages = data.chat.messages || [];
      
      // Only update if messages actually changed
      setMessages(prevMessages => {
        if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
          return newMessages;
        }
        return prevMessages;
      });
      
      if (!isBackground) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching support messages:', error);
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !chatId) return;
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text: message }),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending support message:', error);
    }
  };

  const formatTime = time => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(time).toLocaleString('en-US', options);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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