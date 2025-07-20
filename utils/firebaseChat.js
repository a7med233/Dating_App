// Firebase-based chat solution (Alternative to Socket.IO)
// This provides reliable real-time messaging without server setup

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export class FirebaseChatManager {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Send a message
  async sendMessage(chatId, senderId, receiverId, message) {
    try {
      const messageRef = ref(database, `chats/${chatId}/messages`);
      const newMessageRef = push(messageRef);
      
      await set(newMessageRef, {
        senderId,
        receiverId,
        message,
        timestamp: Date.now(),
        id: newMessageRef.key
      });

      return { success: true, messageId: newMessageRef.key };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen for new messages
  listenForMessages(chatId, callback) {
    try {
      const messagesRef = ref(database, `chats/${chatId}/messages`);
      
      // Remove existing listener if any
      if (this.listeners.has(chatId)) {
        off(messagesRef, 'value', this.listeners.get(chatId));
      }

      const listener = onValue(messagesRef, (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
          messages.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Sort by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);
        
        if (callback) {
          callback(messages);
        }
      });

      this.listeners.set(chatId, listener);
      this.isConnected = true;
      
      return { success: true };
    } catch (error) {
      console.error('Error listening for messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop listening for messages
  stopListening(chatId) {
    try {
      if (this.listeners.has(chatId)) {
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        off(messagesRef, 'value', this.listeners.get(chatId));
        this.listeners.delete(chatId);
      }
    } catch (error) {
      console.error('Error stopping listener:', error);
    }
  }

  // Stop all listeners
  stopAllListeners() {
    try {
      this.listeners.forEach((listener, chatId) => {
        this.stopListening(chatId);
      });
      this.isConnected = false;
    } catch (error) {
      console.error('Error stopping all listeners:', error);
    }
  }

  // Update user online status
  async updateOnlineStatus(userId, isOnline) {
    try {
      const statusRef = ref(database, `users/${userId}/status`);
      await set(statusRef, {
        online: isOnline,
        lastSeen: Date.now()
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Listen for user online status
  listenForUserStatus(userId, callback) {
    try {
      const statusRef = ref(database, `users/${userId}/status`);
      
      const listener = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        if (callback && status) {
          callback(status);
        }
      });

      return listener;
    } catch (error) {
      console.error('Error listening for user status:', error);
    }
  }
}

// Create a singleton instance
export const firebaseChatManager = new FirebaseChatManager(); 