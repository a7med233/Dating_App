import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import { useRoute, useFocusEffect } from '@react-navigation/native';

import { getApiBaseUrl } from '../services/api';
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
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef();

  // Only fetch/create chat if we have a userId or identifier
  useEffect(() => {
    if (!userId && !identifierSubmitted) return;
    
    const fetchChat = async () => {
      try {
        const apiBaseUrl = await getApiBaseUrl();
        console.log('Creating support chat with base URL:', apiBaseUrl);
        
        if (userId) {
          // If we have a userId, create/get chat normally
          console.log('Creating chat with userId:', userId);
          const response = await fetch(`${apiBaseUrl}/support/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
          
          console.log('Support chat creation response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Support chat creation failed:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Support chat created successfully:', data);
          setChatId(data.chat._id);
          setMessages(data.chat.messages || []);
        } else if (identifier) {
          // If we only have an identifier, we need to create a temporary user or use a different approach
          // For now, let's create a chat with a temporary userId based on the identifier
          const tempUserId = `temp_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}`;
          console.log('Creating chat with tempUserId:', tempUserId);
          
          const response = await fetch(`${apiBaseUrl}/support/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: tempUserId }),
          });
          
          console.log('Support chat creation response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Support chat creation failed:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Support chat created successfully:', data);
          setChatId(data.chat._id);
          setMessages(data.chat.messages || []);
        }
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
        console.log('Starting real-time polling for support messages');
        
        // Start background polling for new messages every 1.5 seconds for better responsiveness
        const interval = setInterval(async () => {
          try {
            // Background fetch - don't show loading state
            await fetchSupportMessages(true); // true = background fetch
          } catch (error) {
            console.log('Support background polling error:', error);
          }
        }, 1500); // Reduced from 3000ms to 1500ms for better responsiveness
        
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

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!chatId) return;
    
    setRefreshing(true);
    try {
      await fetchSupportMessages(false); // Foreground fetch
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh messages when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (chatId) {
        console.log('Support chat screen focused - refreshing messages');
        fetchSupportMessages(false); // Foreground fetch to show loading if needed
      }
    }, [chatId])
  );

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
      
      const apiBaseUrl = await getApiBaseUrl();
      
      // Use the same userId logic as fetchChat
      const effectiveUserId = userId || (identifier ? `temp_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}` : null);
      
      if (!effectiveUserId) {
        console.log('No effective userId available for fetching messages');
        return;
      }
      
      console.log('Fetching support messages for userId:', effectiveUserId);
      
      // Use the correct endpoint: GET /support/chat?userId=...
      const response = await fetch(`${apiBaseUrl}/support/chat?userId=${effectiveUserId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Support messages fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Support messages fetch failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Support messages fetched successfully:', data);
      
      if (data.chat) {
        const newMessages = data.chat.messages || [];
        
        // More efficient message comparison - check length and last message timestamp
        setMessages(prevMessages => {
          if (prevMessages.length !== newMessages.length) {
            console.log('Support messages updated:', newMessages.length, 'messages');
            return newMessages;
          }
          
          // Check if last message is different (more efficient than JSON.stringify)
          if (prevMessages.length > 0 && newMessages.length > 0) {
            const lastPrevMessage = prevMessages[prevMessages.length - 1];
            const lastNewMessage = newMessages[newMessages.length - 1];
            
            if (lastPrevMessage._id !== lastNewMessage._id || 
                lastPrevMessage.timestamp !== lastNewMessage.timestamp) {
              console.log('Support messages updated - new message detected');
              return newMessages;
            }
          }
          
          return prevMessages; // No changes
        });
      }
      
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
    
    const messageText = message.trim();
    setMessage(''); // Clear input immediately for better UX
    
    try {
      const apiBaseUrl = await getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text: messageText }),
      });
      
      if (response.ok) {
        // Immediately fetch updated messages to show the sent message
        console.log('Message sent successfully, refreshing messages...');
        await fetchSupportMessages(true); // Background fetch to update UI
        
        // Scroll to bottom to show new message
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      } else {
        console.error('Failed to send message:', response.status);
        // Optionally restore the message if sending failed
        setMessage(messageText);
      }
    } catch (error) {
      console.error('Error sending support message:', error);
      // Restore the message if sending failed
      setMessage(messageText);
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
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }} 
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
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
