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
import React, {useState, useLayoutEffect, useEffect, useRef} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { fetchMessages, getUserDetails, getApi } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { Platform } from 'react-native';
import { getStoredIPAddress } from '../utils/ipConfig';
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

// Function to get the correct Socket URL dynamically
const getSocketUrl = async () => {
  // Check for environment variable from EAS build
  if (process.env.API_BASE_URL) {
    const baseUrl = process.env.API_BASE_URL.replace('/api', '');
    return baseUrl;
  }
  
  // Check NODE_ENV for production builds
  if (process.env.NODE_ENV === 'production') {
    return 'https://lashwa.com';
  }
  
  // For local development, use the computer's IP address
  if (__DEV__) {
    const { getCurrentIPAddress } = require('../utils/ipConfig');
    const localIP = await getCurrentIPAddress();
    return `http://${localIP}:3000`;
  }
  
  // Fallback to production URL for any other case
  return 'https://lashwa.com';
};

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollViewRef = useRef(null);
  
  const senderId = route?.params?.senderId;
  const receiverId = route?.params?.receiverId;
  const [socket, setSocket] = useState(null);



  useEffect(() => {
    if (!senderId || !receiverId) {
      console.log('Cannot connect to socket - missing senderId or receiverId:', { senderId, receiverId });
      return;
    }
    
    const connectToSocket = async () => {
      try {
        const socketUrl = await getSocketUrl();
        console.log('Connecting to socket URL:', socketUrl);
        
        const s = io(socketUrl, {
          transports: Platform.OS === 'android' ? ['polling', 'websocket'] : ['websocket', 'polling'], // Android prefers polling
          timeout: 30000, // 30 second timeout for Android
          forceNew: true, // Force new connection
          reconnection: true, // Enable reconnection
          reconnectionAttempts: 5, // Try to reconnect 5 times
          reconnectionDelay: 1000, // Wait 1 second between attempts
          reconnectionDelayMax: 5000, // Max 5 seconds between attempts
        });
        setSocket(s);
        
        // Join the sender's room
        if (senderId) {
          console.log('Joining room for sender:', senderId);
          s.emit('join', senderId);
        }
        
        s.on('connect', () => {
          console.log('Socket connected successfully');
          setSocketConnected(true);
        });
        
        s.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          console.error('Socket URL used:', socketUrl);
          console.error('Error details:', {
            message: error.message,
            description: error.description,
            context: error.context,
            type: error.type
          });
          setSocketConnected(false);
        });
        
        s.on('disconnect', () => {
          setSocketConnected(false);
        });
        
        s.on('reconnect', () => {
          setSocketConnected(true);
        });
        
        s.on('reconnect_error', () => {
          setSocketConnected(false);
        });
        
        s.on('receiveMessage', newMessage => {
          setMessages(prevMessages => {
            const messageExists = prevMessages.some(msg => 
              msg._id === newMessage._id || 
              (msg.message === newMessage.message && 
               msg.timestamp === newMessage.timestamp)
            );
            
            if (!messageExists) {
                          // Auto-scroll to bottom if user is not manually scrolling
            setTimeout(() => {
              scrollToBottom(true);
            }, 100);
              return [...prevMessages, newMessage];
            }
            return prevMessages;
          });
        });
        
        // Handle online/offline status updates
        s.on('userOnline', (userId) => {
          console.log('User came online:', userId);
          // You can add UI updates here if needed
        });
        
        s.on('userOffline', (userId) => {
          console.log('User went offline:', userId);
          // You can add UI updates here if needed
        });
        
        return () => {
          setSocketConnected(false);
          s.disconnect();
        };
      } catch (error) {
        setSocketConnected(false);
      }
    };
    
    connectToSocket();
  }, [senderId, receiverId]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!senderId || !receiverId) return;
    
    console.log('Sending message:', { senderId, receiverId, message });
    
    if (socket && senderId && receiverId) {
      socket.emit('sendMessage', { senderId, receiverId, message });
      setMessage('');
      
      // Auto-scroll to bottom when sending message
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      
      setTimeout(() => {
        fetchMessagesHandler();
      }, 200);
    } else {
      console.log('Cannot send message - missing socket or user IDs:', { 
        hasSocket: !!socket, 
        senderId, 
        receiverId 
      });
    }
  };

  useLayoutEffect(() => {
    return navigation.setOptions({
      headerShown: false, // Hide default header
    });
  }, []);

  const fetchMessagesHandler = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      if (!senderId || !receiverId) {
        console.log('Missing senderId or receiverId:', { senderId, receiverId });
        setError('Missing user information. Please try again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('Fetching messages for:', { senderId, receiverId });
      const response = await fetchMessages({ senderId, receiverId });
      console.log('Messages response:', response);
      // The API returns messages directly, not wrapped in a data property
      setMessages(response.data || response);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (senderId && receiverId) {
      setTimeout(() => {
        fetchMessagesHandler();
      }, 100);
    }
  }, [senderId, receiverId]);

  // Auto-scroll to bottom when messages are loaded
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        scrollToBottom(false);
      }, 100);
    }
  }, [messages.length, loading]);

  // Refresh messages when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!loading && senderId && receiverId) {
        fetchMessagesHandler(true);
      }
    }, [senderId, receiverId])
  );
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
                <View style={[styles.statusDot, { backgroundColor: socketConnected ? colors.success : colors.textSecondary }]} />
                <Text style={styles.statusText}>
                  {socketConnected ? 'Online' : 'Offline'}
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
              onRefresh={() => fetchMessagesHandler(true)}
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
          
          {!loading && !error && messages?.map((item, index) => (
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
