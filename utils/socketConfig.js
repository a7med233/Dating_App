import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredIPAddress } from './ipConfig';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  async connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const baseUrl = await getStoredIPAddress();
      
      // Convert HTTP URL to WebSocket URL
      const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const socketUrl = wsUrl.replace('/api', '');
      
      console.log('Connecting to WebSocket:', socketUrl);
      
      this.socket = io(socketUrl, {
        auth: {
          token: token,
          userId: userId
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after', this.maxReconnectAttempts, 'attempts');
    });
  }

  // Join a specific chat room
  joinChatRoom(senderId, receiverId) {
    if (!this.socket || !this.isConnected) {
      console.log('Socket not connected, cannot join chat room');
      return;
    }

    const roomId = this.getRoomId(senderId, receiverId);
    console.log('Joining chat room:', roomId);
    this.socket.emit('joinRoom', { roomId, senderId, receiverId });
  }

  // Leave a specific chat room
  leaveChatRoom(senderId, receiverId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    const roomId = this.getRoomId(senderId, receiverId);
    console.log('Leaving chat room:', roomId);
    this.socket.emit('leaveRoom', { roomId });
  }

  // Send a message via WebSocket
  sendMessage(senderId, receiverId, message) {
    if (!this.socket || !this.isConnected) {
      console.log('Socket not connected, falling back to HTTP');
      return false;
    }

    const messageData = {
      senderId,
      receiverId,
      message,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message via WebSocket:', messageData);
    this.socket.emit('sendMessage', messageData);
    return true;
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) return;

    this.socket.on('receiveMessage', (message) => {
      console.log('Received new message via WebSocket:', message);
      callback(message);
    });
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (!this.socket) return;

    this.socket.on('userTyping', (data) => {
      console.log('User typing:', data);
      callback(data);
    });
  }

  // Send typing indicator
  sendTyping(senderId, receiverId, isTyping) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      senderId,
      receiverId,
      isTyping
    });
  }

  // Listen for user online/offline status
  onUserStatus(callback) {
    if (!this.socket) return;

    this.socket.on('userStatus', (data) => {
      console.log('User status update:', data);
      callback(data);
    });
  }

  // Get room ID for consistent room naming
  getRoomId(senderId, receiverId) {
    const sortedIds = [senderId, receiverId].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager; 