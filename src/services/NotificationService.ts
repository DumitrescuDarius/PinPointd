/**
 * Notification service to handle browser notifications
 */

import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<string> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return 'denied'
  }
  
  if (Notification.permission === 'granted') {
    return 'granted'
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }
  
  return Notification.permission
}

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window
}

// Check current permission status
export const getNotificationPermission = (): string => {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  
  return Notification.permission
}

// Show a notification
export const showNotification = (
  title: string,
  options: { 
    body: string, 
    icon?: string,
    tag?: string,
    data?: any,
    onClick?: () => void
  }
): Notification | null => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null
  }
  
  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      data: options.data
    })
    
    if (options.onClick) {
      notification.onclick = () => {
        window.focus()
        options.onClick?.()
      }
    }
    
    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
    return null
  }
}

// Show a chat message notification
export const showMessageNotification = (
  message: {
    id: string
    text: string
    senderId: string
    senderName?: string
  },
  chatInfo: {
    id: string
    displayName: string
  },
  onClick?: () => void
): Notification | null => {
  const title = chatInfo.displayName
  const text = message.text || 'New message'
  const body = text.length > 50 ? text.substring(0, 50) + '...' : text
  
  return showNotification(title, {
    body,
    tag: `chat-${chatInfo.id}`,
    data: { messageId: message.id, chatId: chatInfo.id },
    onClick
  })
} 

// Create a notification for a new message
export const createMessageNotification = async (
  fromUser: {
    uid: string;
    displayName: string;
    photoURL: string;
  },
  toUserId: string,
  messageText: string,
  chatId: string
) => {
  try {
    // Create a notification with the message text
    await addDoc(collection(db, 'notifications'), {
      type: 'message',
      fromUser,
      toUserId,
      text: messageText,
      chatId,
      createdAt: Timestamp.now(),
      read: false
    });

    // Also show a browser notification if permission is granted
    if (Notification.permission === 'granted') {
      const notification = new Notification(fromUser.displayName, {
        body: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
        icon: fromUser.photoURL || '/favicon.ico',
        tag: `chat-${chatId}`,
        data: { chatId }
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to the specific chat
        window.location.href = `/chat?chatId=${chatId}`;
      };
    }
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
};

// Create a notification for a new pinpoint
export const createPinpointNotification = async (
  fromUser: {
    uid: string;
    displayName: string;
    photoURL: string;
  },
  toUserId: string,
  locationId: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'pinpoint',
      fromUser,
      toUserId,
      locationId,
      createdAt: Timestamp.now(),
      read: false
    });
  } catch (error) {
    console.error('Error creating pinpoint notification:', error);
  }
};

// Create a notification for a friend request
export const createFriendRequestNotification = async (
  fromUser: {
    uid: string;
    displayName: string;
    photoURL: string;
  },
  toUserId: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'friend_request',
      fromUser,
      toUserId,
      createdAt: Timestamp.now(),
      read: false
    });
  } catch (error) {
    console.error('Error creating friend request notification:', error);
  }
}; 