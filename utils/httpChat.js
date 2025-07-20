// Simple HTTP polling-based chat solution
// This works reliably with any backend and doesn't require WebSocket setup

import AsyncStorage from '@react-native-async-storage/async-storage';

export class HttpChatManager {
  constructor() {
    this.pollingInterval = null;
    this.isPolling = false;
    this.lastMessageId = null;
    this.baseUrl = 'https://lashwa.com/api';
  }

  // Start polling for new messages
  startPolling(chatId, callback, interval = 3000) {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewMessages(chatId, callback);
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

  // Check for new messages
  async checkForNewMessages(chatId, callback) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${this.baseUrl}/messages/${chatId}?lastMessageId=${this.lastMessageId || ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        if (newMessages.length > 0) {
          // Update last message ID
          this.lastMessageId = newMessages[newMessages.length - 1]._id;
          
          // Call callback with new messages
          if (callback) {
            callback(newMessages);
          }
        }
      }
    } catch (error) {
      console.log('Error checking for new messages:', error);
    }
  }

  // Send a message
  async sendMessage(senderId, receiverId, message) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Sending message via HTTP:', { senderId, receiverId, message });

      const response = await fetch(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          message,
        }),
      });

      console.log('HTTP response status:', response.status);
      console.log('HTTP response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('HTTP response data:', data);
        return { success: true, message: data.message, data: data.data };
      } else {
        // Try to parse error response
        let errorMessage = 'Failed to send message';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
          const textResponse = await response.text();
          console.log('Error response text:', textResponse);
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // Get chat history
  async getChatHistory(senderId, receiverId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.baseUrl}/messages/history?senderId=${senderId}&receiverId=${receiverId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messages: data.messages || [] };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Error getting chat history:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark messages as read
  async markAsRead(chatId, messageIds) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await fetch(`${this.baseUrl}/messages/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          messageIds,
        }),
      });
    } catch (error) {
      console.log('Error marking messages as read:', error);
    }
  }

  // Get unread message count
  async getUnreadCount(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return 0;

      const response = await fetch(`${this.baseUrl}/messages/unread-count?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      }
    } catch (error) {
      console.log('Error getting unread count:', error);
    }
    return 0;
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
}

// Create a singleton instance
export const httpChatManager = new HttpChatManager(); 