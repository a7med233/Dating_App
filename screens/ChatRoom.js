import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useState, useLayoutEffect, useEffect, useRef, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { fetchMessages, getUserDetails, getApi } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { Platform } from 'react-native';
import { getStoredIPAddress } from '../utils/ipConfig';
import { httpChatManager } from '../utils/httpChat';
// Custom emoji picker with common emojis
const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
  '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦',
  '👩', '🧑', '👨', '👵', '🧓', '👴', '👮‍♀️', '👮', '👮‍♂️', '🕵️‍♀️',
  '🕵️', '🕵️‍♂️', '💂‍♀️', '💂', '💂‍♂️', '👷‍♀️', '👷', '👷‍♂️', '🤴', '👸',
  '👳‍♀️', '👳', '👳‍♂️', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼',
  '🎅', '🤶', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧛‍♀️', '🧛',
  '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️',
  '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '🤰', '🤱', '👼', '🎅', '🤶', '🧙‍♀️',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
  '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
  '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
  '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
  '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
  '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
  '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
  '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
  '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
  'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🛂', '🛃',
  '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁',
  '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕',
  '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣',
  '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️',
  '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽',
  '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️',
  '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵',
  '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️',
  '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿',
  '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫',
  '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲',
  '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩',
  '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔',
  '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️',
  '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
  '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠',
  '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'
];



const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [chatKey, setChatKey] = useState(Date.now()); // Force remount when chat changes
  const scrollViewRef = useRef(null);
  const lastFetchRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const initialLoadCompletedRef = useRef(false);
  
  const senderId = route?.params?.senderId;
  const receiverId = route?.params?.receiverId;
  const [pollingInterval, setPollingInterval] = useState(null);



  useEffect(() => {
    if (!senderId || !receiverId) {
      console.log('Cannot start - missing senderId or receiverId:', { senderId, receiverId });
      return;
    }
    
    // Generate new chat key to force proper remounting
    const newChatKey = Date.now();
    setChatKey(newChatKey);
    console.log('ChatRoom mounted with:', { senderId, receiverId, chatKey: newChatKey });
    
    // Reset state for new chat
    setMessages([]);
    setLastMessageCount(0);
    setLastMessageTimestamp(null);
    initialLoadCompletedRef.current = false;
    setLoading(true);
    setError(null);
    
    // First, load initial messages immediately
    const loadInitialMessages = async () => {
      console.log('Loading initial messages...');
      
      // Test API connection first
      try {
        const apiInstance = await getApi();
        console.log('API instance created successfully');
        
        // Test a simple endpoint to verify connection
        const testResponse = await apiInstance.get('/');
        console.log('API connection test successful:', testResponse.status);
      } catch (apiError) {
        console.error('API connection test failed:', apiError);
        setError('Cannot connect to server. Please check your internet connection.');
        setLoading(false);
        return;
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Message load timeout')), 10000); // 10 second timeout
      });
      
      try {
        // Force initial load by calling fetchMessagesHandler directly with bypass
        console.log('Starting initial message fetch...');
        const response = await fetchMessages({ senderId, receiverId });
        console.log('Initial fetch response:', response?.data?.length, 'messages');
        
        if (response?.data && Array.isArray(response.data)) {
          console.log('Setting initial messages:', response.data.length);
          setMessages(response.data);
          setLastMessageCount(response.data.length);
          if (response.data.length > 0) {
            setLastMessageTimestamp(response.data[response.data.length - 1].timestamp);
          }
          setLoading(false);
          setError(null);
          initialLoadCompletedRef.current = true;
          console.log('Initial messages loaded successfully');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Initial message load failed:', error);
        // Try one more time after a short delay
        setTimeout(async () => {
          try {
            console.log('Retrying initial message load...');
            const retryResponse = await fetchMessages({ senderId, receiverId });
            if (retryResponse?.data && Array.isArray(retryResponse.data)) {
              setMessages(retryResponse.data);
              setLastMessageCount(retryResponse.data.length);
              if (retryResponse.data.length > 0) {
                setLastMessageTimestamp(retryResponse.data[retryResponse.data.length - 1].timestamp);
              }
              setLoading(false);
              setError(null);
              initialLoadCompletedRef.current = true;
              console.log('Retry successful:', retryResponse.data.length, 'messages');
            } else {
              throw new Error('Invalid retry response');
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setError('Failed to load messages. Please check your connection and try again.');
            setLoading(false);
          }
        }, 2000);
      }
    };
    
    // Start initial load immediately
    loadInitialMessages();
    
    // Fallback: If initial load doesn't complete within 3 seconds, try again
    const fallbackLoad = setTimeout(async () => {
      if (!initialLoadCompletedRef.current && messages.length === 0) {
        console.log('Fallback: Initial load taking too long, trying again...');
        try {
          const fallbackResponse = await fetchMessages({ senderId, receiverId });
          if (fallbackResponse?.data && Array.isArray(fallbackResponse.data)) {
            setMessages(fallbackResponse.data);
            setLastMessageCount(fallbackResponse.data.length);
            if (fallbackResponse.data.length > 0) {
              setLastMessageTimestamp(fallbackResponse.data[fallbackResponse.data.length - 1].timestamp);
            }
            setLoading(false);
            setError(null);
            initialLoadCompletedRef.current = true;
            console.log('Fallback successful:', fallbackResponse.data.length, 'messages');
          }
        } catch (error) {
          console.error('Fallback load failed:', error);
        }
      }
    }, 3000);
    
    // Start polling after a short delay to allow initial load to complete
    const startPollingAfterDelay = setTimeout(() => {
      console.log('Starting smart polling for messages');
      setIsConnected(true);
      
      // Start background polling with smart intervals
      const startPolling = () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        
        pollingIntervalRef.current = setInterval(async () => {
          try {
            // Don't poll if we're currently sending a message, if there's an error, or if screen is not focused
            if (!isSending && !error && isScreenFocused) {
              console.log('Smart background polling for new messages...');
              await fetchMessagesHandler(false, true); // true = background fetch
            } else {
              console.log('Skipping poll - currently sending message, has error, or screen not focused');
            }
          } catch (error) {
            console.log('Background polling error:', error);
          }
        }, 8000); // 8 seconds - reduced frequency for better performance
      };
      
      startPolling();
    }, 1000); // Start polling after 1 second
    
    return () => {
      console.log('Cleaning up ChatRoom');
      clearTimeout(fallbackLoad);
      clearTimeout(startPollingAfterDelay);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsConnected(false);
      setIsScreenFocused(false);
      
      // Reset all state when unmounting to ensure clean state on remount
      setMessages([]);
      setLastMessageCount(0);
      setLastMessageTimestamp(null);
      initialLoadCompletedRef.current = false;
      setLoading(false);
      setError(null);
      setRefreshing(false);
    };
  }, [senderId, receiverId]); // Remove fetchMessagesHandler from dependencies to avoid circular dependency

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!senderId || !receiverId) return;
    if (isSending) return; // Prevent multiple sends
    
    console.log('Sending message:', { senderId, receiverId, message });
    setIsSending(true);
    
    try {
      // Use the existing API service instead of HTTP chat manager
      const apiInstance = await getApi();
      const response = await apiInstance.post('/messages/send', {
        senderId,
        receiverId,
        message,
      });
      
      console.log('Message sent successfully:', response.data);
      
      setMessage('');
      
      // Auto-scroll to bottom when sending message
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      
      // Refresh messages to show the new message (background fetch)
      setTimeout(() => {
        fetchMessagesHandler(false, true); // Background fetch
        setIsSending(false);
      }, 500); // Wait 500ms before allowing new sends
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      
      // Fallback: try to send via HTTP chat manager
      try {
        console.log('Trying HTTP chat manager fallback...');
        const result = await httpChatManager.sendMessage(senderId, receiverId, message);
        if (result.success) {
          setMessage('');
          setTimeout(() => {
            scrollToBottom(true);
          }, 100);
          setTimeout(() => {
            fetchMessagesHandler(false, true); // Background fetch
          }, 500);
        } else {
          console.error('HTTP fallback also failed:', result.error);
        }
      } catch (fallbackError) {
        console.error('All send methods failed:', fallbackError);
      }
    }
  };

  useLayoutEffect(() => {
    return navigation.setOptions({
      headerShown: false, // Hide default header
    });
  }, []);

  const fetchMessagesHandler = async (isRefresh = false, isBackground = false) => {
    // Prevent rapid successive calls (minimum 3 seconds between calls)
    const now = Date.now();
    const minInterval = 3000;
    if (now - lastFetchRef.current < minInterval && !isRefresh && messages.length > 0) {
      console.log('Skipping fetch - too soon since last fetch');
      return;
    }
    
    // For background fetches, check if we need to fetch at all
    if (isBackground && !isRefresh) {
      // Skip if we have messages and it's been less than 10 seconds since last fetch
      if (messages.length > 0 && now - lastFetchRef.current < 10000) {
        console.log('Skipping background fetch - too soon and have messages');
        return;
      }
    }
    
    // Don't show loading for background fetches
    if (loading && !isRefresh && !isBackground) {
      console.log('Skipping fetch - already loading');
      return;
    }
    
    try {
      lastFetchRef.current = now;
      
      // Only show loading states for non-background fetches
      if (isRefresh && !isBackground) {
        setRefreshing(true);
      } else if (!isBackground) {
        setLoading(true);
      }
      setError(null);
      
      if (!senderId || !receiverId) {
        console.log('Missing senderId or receiverId:', { senderId, receiverId });
        if (!isBackground) {
          setError('Missing user information. Please try again.');
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }
      
      console.log(`${isBackground ? 'Background' : 'Foreground'} fetching messages for:`, { senderId, receiverId });
      
      // Test the API call
      console.log('Making API call to fetchMessages...');
      const response = await fetchMessages({ senderId, receiverId });
      console.log('Messages response:', response);
      console.log('Response type:', typeof response);
      console.log('Response data:', response?.data);
      console.log('Response keys:', Object.keys(response || {}));
      
      // The API returns messages in response.data
      const newMessages = response?.data || [];
      console.log('Received messages:', newMessages.length, 'messages');
      console.log('First message:', newMessages[0]);
      console.log('Last message:', newMessages[newMessages.length - 1]);
      
      // Validate that we got an array
      if (!Array.isArray(newMessages)) {
        console.error('Error: Expected array of messages, got:', typeof newMessages);
        throw new Error('Invalid response format: expected array of messages');
      }
      
      // Smart change detection for background fetches only
      if (isBackground && !isRefresh && messages.length > 0) {
        const hasNewMessages = newMessages.length !== lastMessageCount;
        const hasNewerMessages = newMessages.length > 0 && 
          (!lastMessageTimestamp || 
           new Date(newMessages[newMessages.length - 1].timestamp) > new Date(lastMessageTimestamp));
        
        if (!hasNewMessages && !hasNewerMessages) {
          console.log('No new messages detected, skipping update');
          return;
        }
        
        console.log('New messages detected, updating...');
      }
      
      // Always update messages for foreground fetches or when no messages exist
      console.log('Setting messages in state:', newMessages.length, 'messages');
      setMessages(newMessages);
      setLastMessageCount(newMessages.length);
      if (newMessages.length > 0) {
        setLastMessageTimestamp(newMessages[newMessages.length - 1].timestamp);
      }
      
      // Always clear loading states
      if (!isBackground) {
        console.log('Clearing loading states - background:', isBackground, 'refresh:', isRefresh);
        setLoading(false);
        setRefreshing(false);
      } else {
        console.log('Keeping loading states for background fetch');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Always clear loading states on error
      if (!isBackground) {
        setError('Failed to load messages. Please try again.');
        setLoading(false);
        setRefreshing(false);
      }
    }
  };



  // Auto-scroll to bottom when messages are loaded
  useEffect(() => {
    console.log('Messages state changed:', messages.length, 'messages, loading:', loading);
    if (messages.length > 0 && !loading) {
      console.log('Auto-scrolling to bottom with', messages.length, 'messages');
      setTimeout(() => {
        scrollToBottom(false);
      }, 100);
    }
  }, [messages.length, loading]);

  // Refresh messages when screen comes into focus (smart background fetch)
  useFocusEffect(
    React.useCallback(() => {
      if (senderId && receiverId) {
        console.log('Screen focused - setting focus state');
        setIsScreenFocused(true);
        
        // Always reload messages when screen comes into focus if we don't have any
        if (messages.length === 0) {
          console.log('Screen focused - no messages, loading initial messages');
          setLoading(true);
          setError(null);
          
          // Force immediate load
          setTimeout(async () => {
            try {
              await fetchMessagesHandler(false, false); // Foreground fetch to show loading
            } catch (error) {
              console.error('Focus-triggered load failed:', error);
              setError('Failed to load messages. Pull to refresh.');
            }
          }, 100);
        } else {
          // Only refresh if it's been a while since last fetch
          const timeSinceLastFetch = Date.now() - lastFetchRef.current;
          if (timeSinceLastFetch > 30000) { // 30 seconds
            console.log('Screen focused - refreshing messages (been a while)');
            fetchMessagesHandler(true, true); // Background refresh
          } else {
            console.log('Screen focused - skipping refresh, recent fetch detected');
          }
        }
      }
      
      return () => {
        console.log('Screen unfocused - stopping polling');
        setIsScreenFocused(false);
      };
    }, [senderId, receiverId, messages.length]) // Remove fetchMessagesHandler dependency
  );
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    setRefreshing(true);
    setError(null);
    
    try {
      await fetchMessagesHandler(true, false); // Foreground refresh
      console.log('Manual refresh completed successfully');
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setError('Failed to refresh messages. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = time => {
    const options = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString('en-US', options);
  };

  const scrollToBottom = (animated = true) => {
    if (scrollViewRef.current && !isUserScrolling) {
      scrollViewRef.current.scrollToEnd({ animated });
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleProfilePress = async () => {
    if (receiverId) {
      try {
        // Get the current user's ID to pass as requestingUserId
        const token = await AsyncStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const currentUserId = decodedToken.userId;
        
        // Fetch user details with requestingUserId parameter
        const apiInstance = await getApi();
        const response = await apiInstance.get(`/users/${receiverId}?requestingUserId=${currentUserId}`);
        const userProfile = response.data.user;
        
        console.log('Fetched user profile:', userProfile);
        
        navigation.navigate('ProfileDetails', {
          currentProfile: userProfile,
          isFromChat: true
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback: navigate with just the ID
        navigation.navigate('ProfileDetails', {
          userId: receiverId,
          isFromChat: true
        });
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerContent}>
          <Pressable 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('ChatScreen');
              }
            }} 
            style={styles.backButton}
          >
            <Ionicons 
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
              size={Platform.OS === 'ios' ? 28 : 24} 
              color={colors.textPrimary} 
            />
          </Pressable>
          
          <View style={styles.userInfo}>
            <Pressable onPress={handleProfilePress} style={styles.profileImageContainer}>
              <Image 
                source={{ uri: route?.params?.image || 'https://via.placeholder.com/40' }} 
                style={styles.userAvatar}
              />
            </Pressable>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{route?.params?.name}</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.textSecondary }]} />
                <Text style={styles.statusText}>
                  {isConnected ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Temporarily hidden call buttons */}
          {/* <View style={styles.headerActions}>
            <Pressable style={styles.actionButton}>
              <Ionicons name="videocam-outline" size={24} color={colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Ionicons name="call-outline" size={24} color={colors.textPrimary} />
            </Pressable>
          </View> */}
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleManualRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setIsUserScrolling(true)}
          onScrollEndDrag={() => setIsUserScrolling(false)}
          onMomentumScrollBegin={() => setIsUserScrolling(true)}
          onMomentumScrollEnd={() => setIsUserScrolling(false)}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {!loading && !error && messages?.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Start a conversation!</Text>
              <Text style={styles.emptySubtitle}>Send the first message to begin chatting</Text>
            </View>
          )}
          
          {!loading && !error && messages?.length > 0 && (
            <>
              {messages?.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    (item?.senderId?._id || item?.senderId) === senderId
                      ? styles.sentMessage
                      : styles.receivedMessage
                  ]}
                >
                  <View style={[
                    styles.messageBubble,
                    (item?.senderId?._id || item?.senderId) === senderId
                      ? styles.sentBubble
                      : styles.receivedBubble
                  ]}>
                    <Text style={[
                      styles.messageText,
                      (item?.senderId?._id || item?.senderId) === senderId
                        ? styles.sentText
                        : styles.receivedText
                    ]}>
                      {item?.message}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      (item?.senderId?._id || item?.senderId) === senderId
                        ? styles.sentTime
                        : styles.receivedTime
                    ]}>
                      {formatTime(item?.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
        
        {!error && (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Pressable 
                style={styles.emojiButton}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Entypo name="emoji-happy" size={24} color={colors.textSecondary} />
              </Pressable>
              <TextInput
                value={message}
                onChangeText={text => setMessage(text)}
                style={styles.textInput}
                placeholder="Type your message..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
                textAlignVertical="top"
                returnKeyType="default"
                blurOnSubmit={false}
                onContentSizeChange={() => {
                  // Auto-scroll to bottom when text input expands
                  setTimeout(() => {
                    scrollToBottom(true);
                  }, 50);
                }}
              />
              <Pressable 
                onPress={sendMessage}
                style={[
                  styles.sendButton,
                  message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                disabled={!message.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={message.trim() ? colors.textInverse : colors.textSecondary} 
                />
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <Pressable 
          style={styles.emojiModalOverlay}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPickerContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Emojis</Text>
              <Pressable 
                style={styles.closeEmojiButton}
                onPress={() => setShowEmojiPicker(false)}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <FlatList
              data={COMMON_EMOJIS}
              numColumns={8}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.emojiItem}
                  onPress={() => handleEmojiSelect(item)}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.emojiList}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Custom Header Styles
  customHeader: {
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.backgroundSecondary,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
    borderRadius: borderRadius.circle,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.large,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sentBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.small,
  },
  receivedBubble: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: borderRadius.small,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },
  sentText: {
    color: colors.textInverse,
  },
  receivedText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
  },
  sentTime: {
    color: colors.textInverse,
    opacity: 0.8,
    textAlign: 'right',
  },
  receivedTime: {
    color: colors.textSecondary,
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xlarge,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.circle,
    marginLeft: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.backgroundSecondary,
  },
  // Header styles
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.backgroundSecondary,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  onlineText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  // New styles for profile image and emoji picker
  profileImageContainer: {
    // Add any specific styling if needed
  },
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    height: 350,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiPickerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  closeEmojiButton: {
    padding: spacing.xs,
  },
  emojiList: {
    padding: spacing.sm,
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  emojiText: {
    fontSize: 24,
  },
});
