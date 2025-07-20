import AsyncStorage from '@react-native-async-storage/async-storage';

// Chat utilities for fallback when Socket.IO is not available
export class ChatManager {
  constructor() {
    this.pollingInterval = null;
    this.lastMessageTimestamp = null;
    this.isPolling = false;
  }

  // Start polling for new messages
  startPolling(callback, interval = 3000) {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewMessages(callback);
      } catch (error) {
        console.log('Polling error:', error);
      }
    }, interval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  // Check for new messages via API
  async checkForNewMessages(callback) {
    try {
      // This would call your API to check for new messages
      // For now, we'll just simulate it
      const hasNewMessages = await this.fetchNewMessages();
      if (hasNewMessages && callback) {
        callback(hasNewMessages);
      }
    } catch (error) {
      console.log('Error checking for new messages:', error);
    }
  }

  // Fetch new messages from API
  async fetchNewMessages() {
    // This would be implemented to call your backend API
    // For now, return null to indicate no new messages
    return null;
  }

  // Store message locally for offline support
  async storeMessageLocally(chatId, message) {
    try {
      const key = `chat_${chatId}`;
      const existingMessages = await AsyncStorage.getItem(key);
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push({
        ...message,
        timestamp: new Date().toISOString(),
        isLocal: true
      });
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.log('Error storing message locally:', error);
    }
  }

  // Get local messages
  async getLocalMessages(chatId) {
    try {
      const key = `chat_${chatId}`;
      const messages = await AsyncStorage.getItem(key);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.log('Error getting local messages:', error);
      return [];
    }
  }

  // Sync local messages with server
  async syncLocalMessages(chatId) {
    try {
      const localMessages = await this.getLocalMessages(chatId);
      const unsyncedMessages = localMessages.filter(msg => msg.isLocal);
      
      for (const message of unsyncedMessages) {
        // Send to server
        await this.sendMessageToServer(chatId, message);
        // Remove local flag
        message.isLocal = false;
      }
      
      // Update local storage
      await AsyncStorage.setItem(`chat_${chatId}`, JSON.stringify(localMessages));
    } catch (error) {
      console.log('Error syncing local messages:', error);
    }
  }

  // Send message to server
  async sendMessageToServer(chatId, message) {
    // This would be implemented to send message to your backend
    console.log('Sending message to server:', { chatId, message });
  }
}

// Create a singleton instance
export const chatManager = new ChatManager(); 