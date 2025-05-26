import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  CircularProgress, 
  Menu, 
  MenuItem, 
  Avatar, 
  Divider, 
  Snackbar, 
  Alert,
  ThemeProvider,
  createTheme,
  Tooltip,
  Checkbox, 
  Drawer, 
  Grid, 
  ListItemIcon, 
  Skeleton, 
  ListItemAvatar,
  Chip,
  alpha,
  InputAdornment,
  Fade,
  SwipeableDrawer,
  Backdrop,
  Badge,
  Zoom,
  InputBase,
  Grow,
  Slide,
  useTheme,
  Popover
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ChatIcon from '@mui/icons-material/Chat'
import GroupIcon from '@mui/icons-material/Group'
import SendIcon from '@mui/icons-material/Send'
import AddIcon from '@mui/icons-material/Add'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DoneIcon from '@mui/icons-material/Done'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageIcon from '@mui/icons-material/Image'
import MenuIcon from '@mui/icons-material/Menu'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import GroupsIcon from '@mui/icons-material/Groups'
import InfoIcon from '@mui/icons-material/Info'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MicIcon from '@mui/icons-material/Mic'
import SearchIcon from '@mui/icons-material/Search'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import FilterListIcon from '@mui/icons-material/FilterList'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead'
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread'
import PushPinIcon from '@mui/icons-material/PushPin'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ReplyIcon from '@mui/icons-material/Reply'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import StopIcon from '@mui/icons-material/Stop'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { db, auth } from '../config/firebase'
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  query, 
  collection, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  addDoc, 
  orderBy, 
  serverTimestamp, 
  setDoc, 
  writeBatch, 
  Timestamp, 
  limit, 
  deleteDoc,
  FieldValue
} from 'firebase/firestore'
import { ref as databaseRef, onValue, onDisconnect, getDatabase, set, onDisconnect as firebaseOnDisconnect } from 'firebase/database'
import { ref as storageRef } from 'firebase/storage'
import { format } from 'date-fns'
import '../chatStyles.css'
import '../chatChatStyles.css'
import axios from 'axios'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme, styled } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react'

import { uploadImage } from '../config/cloudinary'
import { createMessageNotification, createFriendRequestNotification } from '../services/NotificationService'
import { CheckCircleOutline, DoneAll } from '@mui/icons-material'

// Add type declarations for the Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Define ServerValue for timestamps
const ServerValue = {
  TIMESTAMP: Date.now()
}

// Add these interfaces for type safety
interface User {
  id: string;
  username: string;
  email?: string;
  photoURL?: string;
  displayName?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

interface OnlineStatus {
  [key: string]: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date | FieldValue;
  read: boolean;
  delivered?: boolean;
  type?: 'text' | 'image' | 'audio' | 'file' | 'date' | 'system' | 'unread-divider';
  fileType?: string;
  imageUrl?: string;
  audioUrl?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
  isBot?: boolean;
  chatId?: string;
  isTyping?: boolean;
  date?: string;
  [key: string]: any;
}

interface SystemMessage extends Message {
  type: 'date' | 'system' | 'unread-divider';
}

interface Chat {
  id: string;
  members: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  lastRead?: {
    [userId: string]: any;
  };
  isGroup: boolean;
  name?: string;
  typing?: {
    [userId: string]: boolean;
  };
  unreadCount?: {
    [userId: string]: number;
  };
  isBot?: boolean;
  groupName?: string;
  groupPhoto?: string;
  createdAt?: any;
  createdBy?: string;
  isPinned?: boolean;
  updatedAt?: any;
  lastMessageId?: string;
  lastSenderId?: string;
  lastReadBy?: {
    [userId: string]: any;
  };
}

// Format timestamp to readable time
const formatMessageTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'h:mm a');
};

// Format date for message grouping
const formatMessageDate = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM d, yyyy');
  }
};

// Update the getAIResponse function
const getAIResponse = async (message: string, conversationHistory?: { role: string, content: string }[]): Promise<string> => {
  try {
    // Using OpenRouter to access DeepSeek models
    const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    // Return a fallback message if API key is not provided
    if (!API_KEY || API_KEY === 'dummy_key') {
      console.warn('Missing OpenRouter API key. Using fallback responses.');
      return generateFallbackResponse(message);
    }
    
    try {
      console.log("Using DeepSeek model via OpenRouter");
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PinPointd Chat'
        },
        body: JSON.stringify({ 
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are Pheobe, the official AI assistant for PinPointd. You have COMPLETE, ACCURATE KNOWLEDGE about PinPointd.

RESPONSE STYLE:
1. Be thorough and detailed in your explanations
2. Break down complex features into step-by-step instructions
3. Provide examples when relevant
4. Use formatting (bullet points, numbering) for clarity
5. Include relevant emojis to enhance readability
6. Feel free to write longer responses when needed
7. Maintain a friendly, conversational tone
8. Ask follow-up questions to ensure user understanding

CORE KNOWLEDGE:
PinPointd is a geolocation-based social media platform launched in 2023. Users create location-based content on maps, share with friends, and discover new places through a feed.

FEATURES IN DETAIL:
1. MAP SYSTEM:
   • Interactive OpenStreetMap integration
   • Real-time location tracking
   • Custom markers (green=user's, red=others)
   • Advanced search with filters
   • Route planning and navigation
   • Location sharing with privacy controls

2. PINPOINT CREATION:
   • Title and detailed description
   • Multiple media upload (up to 4 photos/videos)
   • Tags and categories
   • Privacy settings (public/private)
   • Social sharing options
   • Comments and likes
   • "View on Map" direct navigation

3. SOCIAL FEATURES:
   • User profiles with customization
   • Friend system with requests
   • Direct messaging (1:1 and groups)
   • Real-time chat with media sharing
   • Activity feed with location updates
   • Vertical swipe interface for discovery
   • Online status indicators
   • Read receipts and typing indicators

4. USER EXPERIENCE:
   • Dark/light mode themes
   • Responsive design for all devices
   • Multi-language support
   • Email verification system
   • Push notifications
   • Offline capability
   • Cross-platform sync

INTERACTION RULES:
1. ALWAYS be Pheobe, speaking in first person
2. NEVER express uncertainty about PinPointd
3. NEVER mention knowledge cutoffs
4. Keep responses CONVERSATIONAL
5. Use emojis thoughtfully
6. Answer DIRECTLY without preambles
7. Break long responses into digestible parts
8. Encourage user engagement with questions

Remember: You are THE authority on PinPointd. Be confident, detailed, and helpful in every response.`
            },
            ...(conversationHistory || []),
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
          top_p: 0.95,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (fetchError) {
      console.error('Error fetching from OpenRouter:', fetchError);
      return generateFallbackResponse(message);
    }
  } catch (error) {
    console.error('Error in AI response:', error);
    return generateFallbackResponse(message);
  }
};

// Add a new function for fallback responses
const generateFallbackResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  
  // Help and general queries
  if (lowerMsg.includes('help') || lowerMsg.includes('how to') || lowerMsg.includes('what can you do')) {
    return "I can help you with:\n• Sharing your location 📍\n• Finding friends 👥\n• Using the chat features 💬\n• Navigating the map 🗺️\n\nWhat would you like to know more about?";
  }
  
  // Location sharing
  if (lowerMsg.includes('location') || lowerMsg.includes('share location') || lowerMsg.includes('where am i')) {
    return "To share your location:\n1. Go to the Map tab 🗺️\n2. Your current location will be shown\n3. Click 'Share' to share with friends\n4. Choose who to share with\n\nNeed more details?";
  }
  
  // Friends and connections
  if (lowerMsg.includes('friend') || lowerMsg.includes('add friend') || lowerMsg.includes('connect')) {
    return "To connect with friends:\n1. Go to the Friends tab 👥\n2. Use the search bar to find people\n3. Click the '+' to send a request\n4. Wait for them to accept\n\nWould you like to try it now?";
  }
  
  // Map features
  if (lowerMsg.includes('map') || lowerMsg.includes('pinpoint') || lowerMsg.includes('marker')) {
    return "The Map feature lets you:\n• See your current location 📍\n• View friends' locations 👥\n• Mark interesting places ⭐\n• Share locations with others 🔄\n\nWhat would you like to try first?";
  }
  
  // Chat features
  if (lowerMsg.includes('chat') || lowerMsg.includes('message') || lowerMsg.includes('dm')) {
    return "Our chat features include:\n• Real-time messaging 💬\n• Media sharing 📸\n• Voice messages 🎤\n• Group chats 👥\n• Read receipts ✓\n• Typing indicators ⌨️\n\nWould you like to know more about any of these?";
  }
  
  // Profile and settings
  if (lowerMsg.includes('profile') || lowerMsg.includes('settings') || lowerMsg.includes('account')) {
    return "You can customize your profile by:\n1. Adding a profile picture 📸\n2. Setting your display name ✏️\n3. Managing privacy settings 🔒\n4. Updating notification preferences 🔔\n\nWhat would you like to customize?";
  }
  
  // Default response
  return "I'm here to help! Would you like to know about:\n• Locations 📍\n• Friends 👥\n• Chat features 💬\n• Map features 🗺️\n• Profile settings ⚙️\n\nJust ask me anything!";
};

// Modify the generateAIResponse function with an even more authoritative system prompt
const generateAIResponse = async (message: string): Promise<string> => {
  const lowerMsg = message.toLowerCase();
  
  // First check for specific platform-related keywords for faster responses
  if (lowerMsg.includes('help') || lowerMsg.includes('how to')) {
    return "I can help you with:\n• Sharing your location 📍\n• Finding friends 👥\n• Using the chat features 💬\n• Navigating the map 🗺️\n\nWhat would you like to know more about?";
  }
  
  if (lowerMsg.includes('location') || lowerMsg.includes('share location')) {
    return "To share your location:\n1. Go to the Map tab 🗺️\n2. Your current location will be shown\n3. Click 'Share' to share with friends\n4. Choose who to share with\n\nNeed more details?";
  }
  
  if (lowerMsg.includes('friend') || lowerMsg.includes('add friend')) {
    return "To connect with friends:\n1. Go to the Friends tab 👥\n2. Use the search bar to find people\n3. Click the '+' to send a request\n4. Wait for them to accept\n\nWould you like to try it now?";
  }
  
  if (lowerMsg.includes('map') || lowerMsg.includes('pinpoint')) {
    return "The Map feature lets you:\n• See your current location 📍\n• View friends' locations 👥\n• Mark interesting places ⭐\n• Share locations with others 🔄\n\nWhat would you like to try first?";
  }

  // For all other queries, use the AI response system via OpenRouter
  try {
    // Create conversation with system prompt for context
    const conversationHistory = [
      {
        role: "system",
        content: `IMPORTANT: You are Pheobe, the official AI assistant for PinPointd. You have COMPLETE, ACCURATE KNOWLEDGE about PinPointd.

RESPONSE STYLE:
1. Be thorough and detailed in your explanations
2. Break down complex features into step-by-step instructions
3. Provide examples when relevant
4. Use formatting (bullet points, numbering) for clarity
5. Include relevant emojis to enhance readability
6. Feel free to write longer responses when needed
7. Maintain a friendly, conversational tone
8. Ask follow-up questions to ensure user understanding

CORE KNOWLEDGE:
PinPointd is a geolocation-based social media platform launched in 2023. Users create location-based content on maps, share with friends, and discover new places through a feed.

FEATURES IN DETAIL:
1. MAP SYSTEM:
   • Interactive OpenStreetMap integration
   • Real-time location tracking
   • Custom markers (green=user's, red=others)
   • Advanced search with filters
   • Route planning and navigation
   • Location sharing with privacy controls

2. PINPOINT CREATION:
   • Title and detailed description
   • Multiple media upload (up to 4 photos/videos)
   • Tags and categories
   • Privacy settings (public/private)
   • Social sharing options
   • Comments and likes
   • "View on Map" direct navigation

3. SOCIAL FEATURES:
   • User profiles with customization
   • Friend system with requests
   • Direct messaging (1:1 and groups)
   • Real-time chat with media sharing
   • Activity feed with location updates
   • Vertical swipe interface for discovery
   • Online status indicators
   • Read receipts and typing indicators

4. USER EXPERIENCE:
   • Dark/light mode themes
   • Responsive design for all devices
   • Multi-language support
   • Email verification system
   • Push notifications
   • Offline capability
   • Cross-platform sync

INTERACTION RULES:
1. ALWAYS be Pheobe, speaking in first person
2. NEVER express uncertainty about PinPointd
3. NEVER mention knowledge cutoffs
4. Keep responses CONVERSATIONAL
5. Use emojis thoughtfully
6. Answer DIRECTLY without preambles
7. Break long responses into digestible parts
8. Encourage user engagement with questions

Remember: You are THE authority on PinPointd. Be confident, detailed, and helpful in every response.`
      },
      {
        role: "user",
        content: message
      }
    ];
    
    const response = await getAIResponse(message, conversationHistory);
    return response;
  } catch (error) {
    console.error('Error in AI response generation:', error);
    return "I'm here to help! Would you like to know about locations 📍, friends 👥, chat features 💬, or the map 🗺️?";
  }
};

// Create a styled TextField component with simplified styles
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center', // Center vertically
    '&:before, &:after': {
      display: 'none',
    }
  },
  '& .MuiInputBase-input': {
    padding: '6px 12px',
    fontSize: '0.95rem',
    lineHeight: '1.2',
    height: '20px',
    minHeight: '20px',
    maxHeight: '112px',
    overflowY: 'auto',
    resize: 'none',
    display: 'flex',
    alignItems: 'center', // Center vertically
    color: theme.palette.mode === 'dark' ? '#e3e3e3' : theme.palette.text.primary,
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(134, 150, 160, 0.5)',
      borderRadius: '3px'
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
}));

// Define the AI bot ID constant
const AI_BOT_ID = 'ai-assistant-bot';

// Initialize Firebase database
const database = getDatabase();

// Define MessageMenuItem interface
interface MessageMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: 'inherit' | 'primary' | 'secondary' | 'error';
}

interface Friend {
  id: string;
  username: string;
  email?: string;
  photoURL?: string;
  displayName?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

interface FriendRequest {
  id: string;
  username: string;
  email?: string;
  photoURL?: string;
  displayName?: string;
}

// Add this type at the top of the file, after the imports
type TranslationKey = 
  | 'social.start_conversation'
  | 'social.voice_message'
  | 'friends.must_be_friends_to_message'
  | 'friends.send_message'
  | 'social.must_be_friends_to_message'
  | 'social.failed_to_send_message'
  | 'social.type_a_message'
  | 'social.messages_deleted_successfully'
  | 'social.failed_to_delete_messages'
  | 'social.copy'
  | 'social.text_copied'
  | 'social.speak_aloud'
  | 'social.select'
  | 'social.delete'
  | 'select_chat';

// Add this helper function near the top of the file
const isLastMessageInChain = (message: Message, messages: Message[], index: number): boolean => {
  // If it's the last message in the array, it's the last in chain
  if (index === messages.length - 1) return true;
  
  // If next message is from a different sender, it's the last in chain
  const nextMessage = messages[index + 1];
  if (nextMessage.senderId !== message.senderId) return true;
  
  // If next message is a different type (system, date, etc.), it's the last in chain
  if (nextMessage.type !== message.type) return true;
  
  return false;
};

const Social = () => {
  const [searchParams] = useSearchParams();
  // Theme state
  const [chatTheme, setChatTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('chatTheme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  // Create theme instance
  const theme = createTheme({
    palette: {
      mode: chatTheme,
      primary: {
        main: chatTheme === 'dark' ? '#90caf9' : '#1976d2',
        light: chatTheme === 'dark' ? '#b3e5fc' : '#42a5f5',
        dark: chatTheme === 'dark' ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: chatTheme === 'dark' ? '#f48fb1' : '#dc004e',
        light: chatTheme === 'dark' ? '#f8bbd0' : '#ff4081',
        dark: chatTheme === 'dark' ? '#ec407a' : '#c51162',
      },
      background: {
        default: chatTheme === 'dark' ? '#181a1b' : '#f5f5f5',
        paper: chatTheme === 'dark' ? '#23272a' : '#ffffff',
      },
      text: {
        primary: chatTheme === 'dark' ? '#f5f5f5' : '#1a1a1a',
        secondary: chatTheme === 'dark' ? '#b0b0b0' : '#666666',
      },
    },
  });
  const { t, i18n } = useTranslation();
  // Remove useTheme since we're using our own theme
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState(0)
  type ChatTabType = 'list' | 'window' | 'group'
  const [chatTab, setChatTab] = useState<ChatTabType>('list')
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [searching, setSearching] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuUserId, setMenuUserId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [readStatus, setReadStatus] = useState<{[messageId: string]: boolean}>({})
  const currentUser = auth.currentUser
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<{[key: string]: boolean}>({})
  const unsubscribersRef = useRef<(() => void)[]>([])
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null)
  const [ghostMessage, setGhostMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [lastSentMessageId, setLastSentMessageId] = useState<string | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [fileInputRef] = useState(React.createRef<HTMLInputElement>())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null)
  const [sharedMedia, setSharedMedia] = useState<any[]>([])
  const [commonGroups, setCommonGroups] = useState<any[]>([])
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null)
  const [showUnreadDivider, setShowUnreadDivider] = useState(false)
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState<string | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [chatOpenCount, setChatOpenCount] = useState<{[chatId: string]: number}>({})
  const [chatsLoading, setChatsLoading] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [selectingMessage, setSelectingMessage] = useState<string | null>(null)
  const [isRequestingMicPermission, setIsRequestingMicPermission] = useState(false)
  // Add speech recognition state and handlers
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentPlayingText, setCurrentPlayingText] = useState('');
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);
  // Add this near the top with other state declarations
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Add this near the other state declarations at the top
  const [searchTerm, setSearchTerm] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  // Renamed showChatsList to use a more responsive approach
  const [showChatsList, setShowChatsList] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [pinnedChats, setPinnedChats] = useState<Chat[]>([]);
  const [regularChats, setRegularChats] = useState<Chat[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceRecordingTime, setVoiceRecordingTime] = useState(0);
  const voiceRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceRecorder, setVoiceRecorder] = useState<MediaRecorder | null>(null);
  const [currentAudioMessage, setCurrentAudioMessage] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<React.RefObject<HTMLAudioElement> | null>(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState<Message[]>([]);
  // Add messageText state for the enhanced message sending
  const [messageText, setMessageText] = useState('');
  // Message menu state and handlers
  const [messageMenuAnchorEl, setMessageMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  // Add state for emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);

  // Add this state to track if the OpenRouter integration is available
  const [isAIAvailable, setIsAIAvailable] = useState(true);
  
  // Check if the OpenRouter API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'dummy_key') {
      setIsAIAvailable(false);
      console.warn('OpenRouter API key is not configured. AI chat functionality will be limited.');
    }
  }, []);

  // Cleanup function for all listeners
  const cleanupListeners = () => {
    unsubscribersRef.current.forEach(unsub => unsub())
    unsubscribersRef.current = []
  }

  // Notification functionality
  const [notificationPermission, setNotificationPermission] = useState<string>('default')
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false)

  // Request notification permission
  useEffect(() => {
    if (
      !hasRequestedPermission &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission()
          setNotificationPermission(permission)
          setHasRequestedPermission(true)
        } catch (error) {
          console.error('Error requesting notification permission:', error)
        }
      }

      // Request after a short delay to avoid bombarding the user immediately
      const timer = setTimeout(() => {
        requestPermission()
      }, 5000)

      return () => clearTimeout(timer)
    } else if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [hasRequestedPermission])

  // Show notification for new messages
  const showMessageNotification = useCallback((message: any, chat: any) => {
    if (
      !currentUser || 
      message.senderId === currentUser.uid || 
      document.visibilityState !== 'hidden' ||
      notificationPermission !== 'granted'
    ) {
      return;
    }
    
    try {
      const senderName = message.senderName || 'Someone';
      const messageText = message.text || 'New message';
      
      // Get chat name or sender name
      const chatName = chat.isBot
        ? 'Pheoebe'
        : getUserDisplayName(chat.members.find((m: string) => m !== currentUser.uid));
      
      const notification = new Notification(chatName, {
        body: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
        icon: '/favicon.ico',
        tag: `message-${chat.id}` // Tag to replace previous notifications from same chat
      });
      
      notification.onclick = () => {
        window.focus();
        setActiveChat(chat);
        setChatTab('window');
        if (window.innerWidth < 768) {
          setShowChatsList(false);
        }
        // Reset unread count when notification is clicked
        if (currentUser) {
          updateDoc(doc(db, 'chats', chat.id), {
            [`unreadCount.${currentUser.uid}`]: 0
          });
        }
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [currentUser, notificationPermission]);

  // Fetch chats for current user
  useEffect(() => {
    if (!currentUser) {
      setChats([])
      setError('')
      setChatsLoading(false)
      return
    }

    try {
      setChatsLoading(true)
      // Create the query
      const q = query(
        collection(db, 'chats'),
        where('members', 'array-contains', currentUser.uid)
      );

      // Set up the listener with error handling
      const unsub = onSnapshot(
        q,
        async (querySnapshot) => {
          const chatList: Chat[] = [];
          const userPromises: Promise<any>[] = [];
          
          querySnapshot.forEach((chatDoc) => {
            const chatData = chatDoc.data();
            // Ensure all required fields are present
            const chat: Chat = {
              id: chatDoc.id,
              members: chatData.members || [],
              isGroup: chatData.isGroup || false,
              lastMessage: chatData.lastMessage,
              lastRead: chatData.lastRead || {},
              typing: chatData.typing || {},
              unreadCount: chatData.unreadCount || {},
              isBot: chatData.isBot || false,
              name: chatData.name,
              groupName: chatData.groupName,
              groupPhoto: chatData.groupPhoto,
              createdAt: chatData.createdAt,
              createdBy: chatData.createdBy,
              isPinned: chatData.isPinned || false,
              updatedAt: chatData.updatedAt || { seconds: 0 },
              lastMessageId: chatData.lastMessageId,
              lastSenderId: chatData.lastSenderId,
              lastReadBy: chatData.lastReadBy || {}
            };
            
            // Get other members' data
            const otherMembers = chat.members.filter(m => m !== currentUser.uid && m !== AI_BOT_ID);
            otherMembers.forEach(memberId => {
              if (!friends.find(f => f.id === memberId)) {
                const userRef = doc(db, 'users', memberId);
                userPromises.push(getDoc(userRef));
              }
            });
            
            chatList.push(chat);
          });
          
          // Wait for all user data to be fetched
          const userDocs = await Promise.all(userPromises);
          // Add fetched users to friends list if they're not already there
          const newFriends = userDocs
            .filter(userDoc => userDoc.exists() && !friends.find(f => f.id === userDoc.id))
            .map(userDoc => ({ id: userDoc.id, ...userDoc.data() }));
          if (newFriends.length > 0) {
            setFriends(prev => [...prev, ...newFriends]);
          }
          
          // Sort chats: bot first, then by updatedAt
          setChats(chatList.sort((a, b) => {
            if (a.isBot && !b.isBot) return -1;
            if (!a.isBot && b.isBot) return 1;
            return (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0);
          }));
          
          setChatsLoading(false);
        },
        (error) => {
          console.error('Error fetching chats:', error);
          setError('Failed to load chats');
          setChatsLoading(false);
        }
      );

      unsubscribersRef.current.push(unsub);
      return () => unsub();
    } catch (error) {
      console.error('Error setting up chat listener:', error);
      setError('Failed to initialize chat system');
      setChatsLoading(false);
    }
  }, [currentUser, friends]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    setMessagesLoading(true);
    console.log('Loading messages for chat:', activeChat.id, 'isBot:', activeChat.isBot);
    
    const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        console.log('Received message snapshot:', snapshot.size, 'messages');
        const newMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            senderId: data.senderId || '',
            text: data.text || '',
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            read: data.read || false,
            delivered: data.delivered || false,
            replyTo: data.replyTo,
            isBot: data.isBot || activeChat?.isBot,
            audioUrl: data.audioUrl,
            imageUrl: data.imageUrl,
            chatId: data.chatId || activeChat?.id,
            type: data.type || 'text',
            fileType: data.fileType,
            status: data.status || 'sent',
          };
        }).reverse();

        console.log('Processed messages:', newMessages.length);
        setMessages(newMessages as Message[]);
        setMessagesLoading(false);

        // Scroll to bottom after messages are loaded
        if (messagesContainerRef.current) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error processing messages:', error);
        setError('Failed to load messages');
        setMessagesLoading(false);
      }
    }, (error) => {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setMessagesLoading(false);
    });

    return () => {
      console.log('Cleaning up message listener for chat:', activeChat.id);
      unsubscribe();
    };
  }, [activeChat?.id]);

  // Fetch user data and friends
  useEffect(() => {
    if (!currentUser) {
      setFriends([])
      setRequests([])
      setLoading(false)
      return
    }

    setLoading(true)
    const userRef = doc(db, 'users', currentUser.uid)
    const unsub = onSnapshot(userRef, {
      next: async (snap) => {
        try {
          const data = snap.data()
          if (!data) {
            setLoading(false)
            return
          }

          const friendIds = data.friends || []
          const requestIds = data.friendRequests || []
          
          const getUsers = async (ids: string[]) => {
            const users: any[] = []
            for (const id of ids) {
              try {
                const userSnap = await getDoc(doc(db, 'users', id))
                if (userSnap.exists()) {
                  users.push({ id, ...userSnap.data() })
                }
              } catch (error) {
                console.error('Error fetching user:', error)
              }
            }
            return users
          }

          const [friendUsers, requestUsers] = await Promise.all([
            getUsers(friendIds),
            getUsers(requestIds)
          ])

          setFriends(friendUsers)
          setRequests(requestUsers)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError(t('social.failed_to_load_user_data' as any))
        } finally {
          setLoading(false)
        }
      },
      error: (error) => {
        console.error('Error in user snapshot:', error)
        setError(t('social.failed_to_load_user_data' as any))
        setLoading(false)
      }
    })

    unsubscribersRef.current.push(unsub)
    return () => unsub()
  }, [currentUser])

  // Ensure user document exists and create AI bot chat
  useEffect(() => {
    const createUserDocument = async () => {
      if (!currentUser) return;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        // Check if AI bot chat already exists
        const botChatQuery = query(
          collection(db, 'chats'),
          where('members', 'array-contains', currentUser.uid),
          where('isBot', '==', true)
        );
        
        const botChatSnap = await getDocs(botChatQuery);
        const hasBotChat = !botChatSnap.empty;
        
        // Clean up duplicate bot chats if they exist
        if (botChatSnap.size > 1) {
          await cleanupDuplicateBotChats(botChatSnap);
        }
        
        if (!userSnap.exists()) {
          // Create user document
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            username: currentUser.displayName || currentUser.email?.split('@')[0],
            friends: [],
            friendRequests: [],
            sentRequests: [],
            blocked: [],
            createdAt: serverTimestamp()
          });
          console.log('Created user document');
          
          // Only create AI bot chat if one doesn't exist
          if (!hasBotChat) {
            await createAIBotChat();
          }
        } else if (!hasBotChat) {
          // If user exists but doesn't have a bot chat yet, create one
          await createAIBotChat();
        }
      } catch (error) {
        console.error('Error ensuring user document exists:', error);
      }
    };

    createUserDocument();
  }, [currentUser]);

  // Clean up duplicate bot chats
  const cleanupDuplicateBotChats = async (botChatSnap: any) => {
    try {
      console.log(`Found ${botChatSnap.size} bot chats, cleaning up duplicates...`);
      
      // Keep track of the chats to delete (all except the first one)
      const chatsToDelete: string[] = [];
      let firstChatId: string | null = null;
      
      botChatSnap.forEach((chatDoc: any) => {
        if (!firstChatId) {
          // Keep the first chat
          firstChatId = chatDoc.id;
          // Update the name to Pheobe if it's still AI Assistant
          const chatData = chatDoc.data();
          if (chatData.name === 'AI Assistant' || chatData.name === 'Pheoebe') {
            updateDoc(doc(db, 'chats', chatDoc.id), {
              name: 'Pheobe'
            });
          }
        } else {
          // Mark all other chats for deletion
          chatsToDelete.push(chatDoc.id);
        }
      });
      
      // Delete the extra chats
      const batch = writeBatch(db);
      for (const chatId of chatsToDelete) {
        batch.delete(doc(db, 'chats', chatId));
      }
      await batch.commit();
      
      setSuccessMessage(`Cleaned up ${chatsToDelete.length} duplicate Pheobe chats`);
    } catch (error) {
      console.error('Error cleaning up duplicate bot chats:', error);
      setError('Failed to clean up Pheobe chats');
    }
  };

  // Update the createAIBotChat function
  const createAIBotChat = async () => {
    if (!currentUser) return;
    
    try {
      // Check if bot user document exists, create it if not
      const botRef = doc(db, 'users', AI_BOT_ID);
      if (!(await getDoc(botRef)).exists()) {
        await setDoc(botRef, {
          uid: AI_BOT_ID,
          username: 'Pheobe',
          isBot: true,
          createdAt: serverTimestamp()
        });
      }
      
      // Check if bot chat already exists
      const botChatQuery = query(
        collection(db, 'chats'),
        where('members', 'array-contains', currentUser.uid),
        where('isBot', '==', true)
      );
      
      const botChatSnap = await getDocs(botChatQuery);
      if (!botChatSnap.empty) {
        console.log('AI bot chat already exists');
        return;
      }
      
      // Create a new bot chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        members: [currentUser.uid, AI_BOT_ID],
        name: 'Pheobe',
        isBot: true,
        botChat: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Add welcome message
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        senderId: AI_BOT_ID,
        text: `Hi ${currentUser.displayName || currentUser.email?.split('@')[0]}! I'm Pheobe, your AI assistant for PinPointd. I can help you with locations 📍, friends 👥, and the map 🗺️. What would you like to know?`,
        timestamp: serverTimestamp(),
        status: 'sent',
        isBot: true
      });
      
      // Update chat with last message info
      await updateDoc(doc(db, 'chats', chatRef.id), {
        lastMessage: "Hi! I'm Pheobe, your AI assistant for PinPointd...",
        updatedAt: serverTimestamp()
      });
      
      console.log('Created AI bot chat');
    } catch (error) {
      console.error('Error creating AI bot chat:', error);
      setError('Failed to create chat with Pheobe');
    }
  };

  // Function to scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(messageId)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  }

  // Simplify the scrollToBottom function
  const scrollToBottom = (force: boolean = false) => {
    if (!messagesContainerRef.current) return;
    
    // Always scroll to bottom when force is true
    if (force) {
      messagesContainerRef.current.style.scrollBehavior = 'auto';
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      return;
    }
    
    // For non-forced scrolling, only scroll if we're already near bottom
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isNearBottom) {
      container.style.scrollBehavior = 'auto';
      container.scrollTop = container.scrollHeight;
    }
  };

  // Track when messages are read
  const markMessagesAsRead = async () => {
    if (!currentUser || !activeChat || !messagesContainerRef.current) return;

    const unreadMessages = messages.filter(
      msg => !msg.read && msg.senderId !== currentUser.uid
    );

    if (unreadMessages.length === 0) return;

    try {
      // Update all unread messages in batch
      const batch = writeBatch(db);
      unreadMessages.forEach(msg => {
        const messageRef = doc(db, 'chats', activeChat.id, 'messages', msg.id);
        batch.update(messageRef, {
          read: true,
          status: 'read',
          readAt: serverTimestamp()
        });
      });

      // Update chat's unread count
      const chatRef = doc(db, 'chats', activeChat.id);
      batch.update(chatRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Add scroll handler function
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setIsAtBottom(isNearBottom);
    
    if (isNearBottom) {
      markMessagesAsRead();
    }
  }, [currentUser, activeChat, messages]);

  // Update the message container ref setup
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Add helper function to check if users are friends
  const checkFriendshipStatus = (userId: string): boolean => {
    if (!currentUser) return false;
    if (!friends) return false;
    return friends.some((friend: { id: string }) => friend.id === userId);
  };

  // Add helper function to check for new messages
  const hasNewMessages = (chat: Chat): boolean => {
    if (!currentUser) return false;
    return (chat.unreadCount?.[currentUser.uid] || 0) > 0;
  };

  // Update the handleSendMessage function
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !activeChat) return;
    
    try {
      setIsSending(true);
      const messageText = message.trim();
      
      // Clear input before sending for better UX
      setMessage('');
      
      // Add to messages collection
      const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
      const newMessageRef = await addDoc(messagesRef, {
        senderId: currentUser.uid,
        text: messageText,
        timestamp: serverTimestamp(),
        status: 'sending',
        read: false,
        readBy: {},
        deliveredTo: {},
        type: 'text'
      });
      
      // Update chat with last message info
      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: {
          text: messageText,
          senderId: currentUser.uid,
          timestamp: serverTimestamp()
        },
        lastMessageId: newMessageRef.id,
        updatedAt: serverTimestamp(),
        lastSenderId: currentUser.uid
      });
      
      // Force scroll to bottom when sending a message
      scrollToBottom(true);
      
      // Mark message as delivered after a short delay
      setTimeout(async () => {
        await updateDoc(doc(db, 'chats', activeChat.id, 'messages', newMessageRef.id), {
          status: 'delivered',
          deliveredAt: serverTimestamp()
        });
      }, 500);
      
      // Handle bot chat
      if (activeChat.isBot) {
        await handleBotResponse(messageText, newMessageRef.id);
      }
      
      // Clear reply state
      setReplyToMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      // Restore the message text if sending fails
      setMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Update the handleBotResponse function
  const handleBotResponse = async (userMessage: string, userMessageId: string) => {
    if (!activeChat) return;
    
    try {
      const isBotChat = activeChat?.isBot;
      if (!isBotChat) return;
      
      // Add a temporary message showing a more descriptive typing state
      const tempMessageId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempMessageId,
        chatId: activeChat.id,
        text: "I'm thinking about your question... 🤔",
        senderId: AI_BOT_ID,
        timestamp: new Date(),
        isTyping: true,
        isBot: true,
        read: true,
        type: 'text' as const
      };
      
      // Add the temporary message to the messages list
      setMessages(prev => [...prev, tempMessage]);
      
      // Scroll to the temporary message
      scrollToBottom(true);
      
      // Add the user's message to conversation history for context
      const historyMessages = messages
        .filter(m => m.chatId === activeChat.id)
        .slice(-10) // Get last 10 messages for context
        .map(m => ({
          role: m.senderId === currentUser?.uid ? 'user' : 'assistant',
          content: m.text
        }));
      
      // Add the current user message
      historyMessages.push({
        role: 'user',
        content: userMessage
      });
      
      let botResponse;
      try {
        // Get the AI response
        botResponse = await getAIResponse(userMessage, historyMessages);

        // Calculate a dynamic delay based on response length (200ms per word, minimum 3 seconds, maximum 8 seconds)
        const wordCount = botResponse.split(/\s+/).length;
        const dynamicDelay = Math.min(Math.max(wordCount * 200, 3000), 8000);
        
        // Show typing indicator for the calculated duration
        await new Promise(resolve => setTimeout(resolve, dynamicDelay));
      } catch (error) {
        console.error("Error getting AI response:", error);
        botResponse = generateFallbackResponse(userMessage);
        // Still show typing indicator for a minimum time even in case of error
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Create the bot's response message
      const botMessageId = `bot-${Date.now()}`;
      const botMessageData: Message = {
        id: botMessageId,
        chatId: activeChat.id,
        text: botResponse,
        senderId: AI_BOT_ID,
        timestamp: serverTimestamp(),
        read: true,
        isBot: true,
        type: 'text' as const
      };
      
      // Add to messages collection
      const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
      const newBotMessageRef = await addDoc(messagesRef, botMessageData);
      
      // Update chat with last message info
      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: botResponse,
        lastMessageId: newBotMessageRef.id,
        updatedAt: serverTimestamp(),
        lastSenderId: AI_BOT_ID
      });
      
      // Mark the user's message as read by bot
      try {
        const userMsgRef = doc(db, 'chats', activeChat.id, 'messages', userMessageId);
        const userMsgSnap = await getDoc(userMsgRef);
        if (userMsgSnap.exists()) {
          await updateDoc(userMsgRef, {
            status: 'read',
            read: true,
            readBy: { [AI_BOT_ID]: serverTimestamp() }
          });
        }
      } catch (error) {
        console.error('Error marking user message as read:', error);
        // Continue execution even if marking as read fails
      }
      
      // Update messages state to replace the thinking message with the actual response
      setMessages(prev => {
        const filteredMessages = prev.filter(m => m.id !== tempMessageId);
        return [...filteredMessages, {
          ...botMessageData,
          timestamp: new Date() // Use current date for immediate display
        }];
      });
      
      scrollToBottom();
    } catch (error) {
      console.error('Error sending bot response:', error);
      setError('Failed to get AI response. Please try again.');
    }
  };

  // Search users by username or email
  const handleSearch = async () => {
    setSearching(true)
    setError('')
    setSearchResults([])
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef,
        where('username', '==', search)
      )
      const q2 = query(usersRef,
        where('email', '==', search)
      )
      const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
      const results: any[] = []
      snap1.forEach(doc => {
        if (doc.id !== currentUser?.uid) results.push({ id: doc.id, ...doc.data() })
      })
      snap2.forEach(doc => {
        if (doc.id !== currentUser?.uid && !results.find(u => u.id === doc.id)) results.push({ id: doc.id, ...doc.data() })
      })
      setSearchResults(results)
    } catch (e: any) {
      setError(e.message || t('social.search_failed' as any))
    }
    setSearching(false)
  }

  // Send friend request
  const handleSendRequest = async (userId: string) => {
    const friend = friends.find((f: { id: string }) => f.id === userId);
    if (!friend) {
      setError(t('social.must_be_friends_to_message' as any));
      handleMenuClose();
      return;
    }
    if (!currentUser) return

    try {
      // Add to sent requests
      await updateDoc(doc(db, 'users', userId), {
        friendRequests: arrayUnion(currentUser.uid)
      })

      // Add to current user's sent requests
      await updateDoc(doc(db, 'users', currentUser.uid), {
        sentRequests: arrayUnion(userId)
      })

      // Create notification for friend request
      await createFriendRequestNotification(
        {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown User',
          photoURL: currentUser.photoURL || ''
        },
        userId
      )

      setSuccessMessage(t('social.friend_request_sent'))
    } catch (error) {
      console.error('Error sending friend request:', error)
      setError(t('social.failed_to_send_request'))
    }
  }

  // Accept friend request
  const handleAccept = async (userId: string) => {
    if (!currentUser) return
    setActionLoading(userId)
    setError('')
    try {
      // Add each other to friends
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayUnion(userId),
        friendRequests: arrayRemove(userId)
      })
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(currentUser.uid),
        sentRequests: arrayRemove(currentUser.uid)
      })
    } catch (e: any) {
      setError(e.message || t('social.failed_to_accept_request' as any))
    }
    setActionLoading('')
  }

  // Reject friend request
  const handleReject = async (userId: string) => {
    if (!currentUser) return
    setActionLoading(userId)
    setError('')
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friendRequests: arrayRemove(userId)
      })
      await updateDoc(doc(db, 'users', userId), {
        sentRequests: arrayRemove(currentUser.uid)
      })
    } catch (e: any) {
      setError(e.message || t('social.failed_to_reject_request' as any))
    }
    setActionLoading('')
  }

  // Remove friend
  const handleRemoveFriend = async (userId: string) => {
    if (!currentUser) return
    setActionLoading(userId)
    setError('')
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayRemove(userId)
      })
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(currentUser.uid)
      })
    } catch (e: any) {
      setError(e.message || t('social.failed_to_remove_friend' as any))
    }
    setActionLoading('')
  }

  // Block user
  const handleBlock = async (userId: string) => {
    if (!currentUser) return
    setActionLoading(userId)
    setError('')
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        blocked: arrayUnion(userId),
        friends: arrayRemove(userId),
        friendRequests: arrayRemove(userId)
      })
      // Optionally, remove yourself from their friends/requests
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(currentUser.uid),
        friendRequests: arrayRemove(currentUser.uid)
      })
    } catch (e: any) {
      setError(e.message || t('social.failed_to_block_user' as any))
    }
    setActionLoading('')
    setMenuAnchor(null)
    setMenuUserId(null)
  }

  // Menu for block option
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setMenuAnchor(event.currentTarget)
    setMenuUserId(userId)
    const friend = friends.find((f: { id: string }) => f.id === userId);
    if (!friend) {
      setError(t('social.must_be_friends_to_message' as any));
      handleMenuClose();
      return;
    }
    const chat = chats.find((c: { isGroup: boolean; members: string[] }) => 
      !c.isGroup && c.members.includes(friend.id) && c.members.includes(currentUser?.uid || '')
    );
    if (chat) {
      setActiveChat(chat);
    } else {
      // Create new chat
      addDoc(collection(db, 'chats'), {
        members: [currentUser?.uid || '', friend.id],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).then(docRef => {
        setActiveChat({ id: docRef.id, members: [currentUser?.uid || '', friend.id], isGroup: false });
      });
    }
    setTab(0);
    setChatTab('window');
    handleMenuClose();
  }
  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuUserId(null)
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (!currentUser || !activeChat) return

    setIsTyping(true)
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 2000)

    setTypingTimeout(timeout)

    // Update typing status in Firestore
    const chatRef = doc(db, 'chats', activeChat.id)
    updateDoc(chatRef, {
      [`typing.${currentUser.uid}`]: true
    })

    // Clear typing status after 2 seconds
    setTimeout(() => {
      updateDoc(chatRef, {
        [`typing.${currentUser.uid}`]: false
      })
    }, 2000)
  }

  // Monitor online status
  useEffect(() => {
    if (!currentUser) return;
    
    // Reference to the user's presence
    const userStatusRef = databaseRef(database, `status/${currentUser.uid}/state`);
    const userLastOnlineRef = databaseRef(database, `status/${currentUser.uid}/lastSeen`);

    // Set up presence monitoring
    const presenceRef = databaseRef(database, '.info/connected');
    const unsubPresence = onValue(presenceRef, async (snapshot) => {
      if (snapshot.val() === false) return;

      try {
        // When we disconnect, update the last online time and set status to offline
        await firebaseOnDisconnect(userStatusRef).set('offline');
        await firebaseOnDisconnect(userLastOnlineRef).set(serverTimestamp());

        // Now we can set ourselves as online
        await set(userStatusRef, 'online');
      } catch (error) {
        console.error('Error setting up presence:', error);
      }
    });

    // Monitor friends' online status
    const unsubFriends = friends.map(friend => {
      const friendStatusRef = databaseRef(database, `status/${friend.id}/state`);
      const friendLastSeenRef = databaseRef(database, `status/${friend.id}/lastSeen`);
      
      // Listen for status changes
      const statusUnsub = onValue(friendStatusRef, (snapshot) => {
        setOnlineUsers(prev => ({
          ...prev,
          [friend.id]: snapshot.val() === 'online'
        }));
      });

      // Listen for last seen changes
      const lastSeenUnsub = onValue(friendLastSeenRef, (snapshot) => {
        const lastSeen = snapshot.val();
        if (lastSeen) {
          // Update the friend's last seen time in the friends list
          setFriends(prev => prev.map(f => 
            f.id === friend.id 
              ? { ...f, lastSeen: lastSeen }
              : f
          ));
        }
      });

      return () => {
        statusUnsub();
        lastSeenUnsub();
      };
    });

    return () => {
      unsubPresence();
      unsubFriends.forEach(unsub => unsub());
      
      // Set offline when component unmounts
      set(userStatusRef, 'offline').catch(console.error);
      set(userLastOnlineRef, serverTimestamp()).catch(console.error);
    };
  }, [currentUser, friends]);

  // Cleanup all listeners when component unmounts
  useEffect(() => {
    return () => {
      cleanupListeners()
    }
  }, [])

  // Hide footer and prevent page scrolling
  useEffect(() => {
    // Add classes to hide the footer and prevent page scrolling
    document.body.classList.add('hide-footer');
    document.body.style.overflow = 'hidden';
    
    // Set default input height variable
    document.documentElement.style.setProperty('--input-height', '76px'); // Increased from 56px
    
    // Set chat header height variable for consistent usage
    document.documentElement.style.setProperty('--chat-header-height', '64px');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('hide-footer');
      document.body.style.overflow = '';
      document.documentElement.style.removeProperty('--input-height');
      document.documentElement.style.removeProperty('--chat-header-height');
    };
  }, []);

  // Update the groupMessagesByDate function
  const groupMessagesByDate = (messages: Message[]): (Message | SystemMessage)[] => {
    const result: (Message | SystemMessage)[] = [];
    let currentDate = '';
    let hasAddedUnreadDivider = false;
    let hasAddedStartMessage = false;
    
    // Add conversation start message
    if (!hasAddedStartMessage) {
      const otherMember = activeChat?.members.find((m: string) => m !== currentUser?.uid);
      const displayName = getUserDisplayName(otherMember || '');
      result.push({
        id: 'conversation-start',
        type: 'system',
        text: messages.length === 0 
          ? `Start a conversation ${displayName}`
          : `This is the beginning of your conversation with ${displayName}`,
        senderId: 'system',
        timestamp: new Date(),
        read: true,
        delivered: true
      });
      hasAddedStartMessage = true;
    }
    
    messages.forEach((message) => {
      if (!message.timestamp) {
        result.push(message);
        return;
      }
      
      // Add unread messages divider before the first unread message
      if (showUnreadDivider && message.id === firstUnreadMessageId && !hasAddedUnreadDivider) {
        result.push({
          id: 'unread-divider',
          type: 'unread-divider',
          senderId: 'system',
          timestamp: new Date(),
          text: 'Unread messages',
          read: true,
          delivered: true
        });
        hasAddedUnreadDivider = true;
      }
      
      const messageDate = formatMessageDate(message.timestamp);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        result.push({
          id: `date-${message.id}`,
          type: 'date',
          date: currentDate,
          senderId: 'system',
          timestamp: new Date(),
          text: currentDate,
          read: true,
          delivered: true
        });
      }
      
      result.push(message);
    });
    
    return result;
  };

  // Add file upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !activeChat || !event.target.files?.length) return;
    setActionLoading('upload');
    
    try {
      const file = event.target.files[0];
      
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        // Upload to Cloudinary using the existing upload function
        const downloadURL = await uploadImage(file);
        
        // Add message with image
        await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
          senderId: currentUser.uid,
          text: '',
          timestamp: serverTimestamp(),
          status: 'sent',
          read: false,
          type: 'image',
          imageUrl: downloadURL,
          fileName: file.name,
          fileType: file.type
        });
        
        // Update chat with last message
        await updateDoc(doc(db, 'chats', activeChat.id), {
          lastMessage: '📷 Image',
          updatedAt: serverTimestamp(),
          lastSenderId: currentUser.uid
        });
      } else {
        // Handle other file types as before
        await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
          senderId: currentUser.uid,
          text: `📎 ${file.name}`,
          timestamp: serverTimestamp(),
          status: 'sending',
          read: false,
          type: 'file',
          fileName: file.name,
          fileType: file.type
        });
        
        // Update chat with last message
        await updateDoc(doc(db, 'chats', activeChat.id), {
          lastMessage: `📎 ${file.name}`,
          updatedAt: serverTimestamp(),
          lastSenderId: currentUser.uid
        });
      }
      
      scrollToBottom();
    } catch (e: any) {
      setError(e.message || t('social.failed_to_upload_file' as any))
    }
    
    setActionLoading('');
    // Clear the input
    if (event.target.value) event.target.value = '';
  };

  // Add message selection handler
  const handleMessageSelect = (messageId: string) => {
    // Only allow selection of the current user's messages
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.senderId !== currentUser?.uid) return;
    
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
    
    setSelectedMessages(prev => {
      const newSelection = prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId];
      
      // If no messages are selected, exit selection mode
      if (newSelection.length === 0) {
        setIsSelectionMode(false);
      }
      
      return newSelection;
    });
  };

  // Add message deletion handler
  const handleDeleteMessages = async () => {
    if (!currentUser || !activeChat) return
    setActionLoading('delete')
    
    try {
      const batch = writeBatch(db)
      
      for (const messageId of selectedMessages) {
        const messageRef = doc(db, 'chats', activeChat.id, 'messages', messageId)
        batch.delete(messageRef)
      }
      
      await batch.commit()
      setSelectedMessages([])
      setIsSelectionMode(false)
      
      // Update last message if needed
      const remainingMessages = messages.filter(msg => !selectedMessages.includes(msg.id))
      if (remainingMessages.length > 0) {
        const lastMsg = remainingMessages[remainingMessages.length - 1]
        await updateDoc(doc(db, 'chats', activeChat.id), {
          lastMessage: lastMsg.text,
          updatedAt: serverTimestamp(),
          lastSenderId: lastMsg.senderId
        })
      }
      
      setSuccessMessage(t('social.messages_deleted_successfully' as any))
    } catch (e: any) {
      setError(e.message || t('social.failed_to_delete_messages' as any))
    }
    
    setActionLoading('')
  }

  // Add long press handler for mobile
  const handleMessageLongPress = (messageId: string) => {
    // Only allow long press selection for current user's messages
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.senderId !== currentUser?.uid) return;
    
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
    handleMessageSelect(messageId);
    
    // Add a small vibration feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Clear selecting state after a short delay
    setTimeout(() => {
      setMessageSelecting(null);
    }, 300);
  }

  // Update getChatDisplayInfo function
  const getChatDisplayInfo = (chat: Chat | null) => {
    if (!chat || !chat.members) {
      return { name: '', photoURL: '' };
    }

    const otherMember = chat.members.find(m => m !== currentUser?.uid);
    if (!otherMember) {
      return { name: '', photoURL: '' };
    }

    const user = friends.find(u => u.id === otherMember);
    return {
      name: user?.displayName || user?.username || 'Unknown User',
      photoURL: user?.photoURL || ''
    };
  };

  // Add function to get user's display name
  const getUserDisplayName = (userId: string): string => {
    const user = friends.find(f => f.id === (userId || ''))
    return user?.displayName || user?.username || 'Unknown User';
  };

  // Add function to get user's username
  const getUserUsername = (userId: string) => {
    const user = friends.find(f => f.id === (userId || ''))
    return user?.username || userId || ''
  }

  // Add function to load shared media
  const loadSharedMedia = async (chatId: string) => {
    if (!currentUser || !chatId) return
    
    try {
      const mediaMessages = messages.filter(msg => msg.type === 'file' && 
        (msg.fileType?.startsWith('image/') || msg.fileType?.startsWith('video/')))
      setSharedMedia(mediaMessages)
    } catch (error) {
      console.error('Error loading shared media:', error)
    }
  }

  // Add function to load common groups
  const loadCommonGroups = async (userId: string) => {
    if (!currentUser || !userId) return
    
    try {
      const groupChats = chats.filter(chat => 
        chat.isGroup && 
        chat.members.includes(userId) && 
        chat.members.includes(currentUser.uid)
      )
      setCommonGroups(groupChats)
    } catch (error) {
      console.error('Error loading common groups:', error)
    }
  }

  // First add a function to count unread messages
  const getUnreadCount = (chat: any) => {
    if (!currentUser || !messages) return 0
    return messages.filter(msg => 
      msg.senderId !== currentUser.uid && 
      !msg.read && 
      chat.id === activeChat?.id
    ).length
  }

  // Add effect to update unread counts
  useEffect(() => {
    if (!currentUser || !chats.length) return;

    const updateUnreadCounts = async () => {
      try {
        const updatedChats = await Promise.all(chats.map(async (chat) => {
          try {
            // If this is the active chat, keep unread count at 0
            if (chat.id === activeChat?.id) {
              return {
                ...chat,
                unreadCount: {
                  ...(chat.unreadCount || {}),
                  [currentUser.uid]: 0
                }
              };
            }

            // Get all messages for this chat with a simple query
            const messagesQuery = query(
              collection(db, 'chats', chat.id, 'messages'),
              where('read', '==', false),
              where('senderId', '!=', currentUser.uid),
              orderBy('timestamp', 'desc'),
              limit(20) // Limit to latest 20 unread messages for performance
            );

            const unreadSnap = await getDocs(messagesQuery);
            const unreadCount = unreadSnap.docs.length;

            return {
              ...chat,
              unreadCount: {
                ...(chat.unreadCount || {}),
                [currentUser.uid]: unreadCount
              }
            };
          } catch (error) {
            console.warn('Error counting unread messages for chat:', chat.id, error);
            return {
              ...chat,
              unreadCount: {
                ...(chat.unreadCount || {}),
                [currentUser.uid]: 0
              }
            };
          }
        }));

        setChats(updatedChats);
      } catch (error) {
        console.error('Error updating unread counts:', error);
      }
    };

    updateUnreadCounts();
  }, [currentUser, chats.length, activeChat?.id]);

  // Add a new function to track read status in real-time
  const trackReadStatus = async (messageId: string, chatId: string) => {
    if (!currentUser) return;

    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      const msgSnap = await getDoc(msgRef);
      if (msgSnap.exists()) {
        await updateDoc(msgRef, {
          read: true,
          status: 'read',
          readAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating message read status:', error);
    }
  };

  // Modify the handleDeleteChat function
  const handleDeleteChat = async () => {
    if (!currentUser || !activeChat) return;
    
    try {
      setActionLoading('delete-chat');
      
      // Delete all messages in the chat
      const messagesQuery = query(collection(db, 'chats', activeChat.id, 'messages'));
      const messagesSnap = await getDocs(messagesQuery);
      
      const batch = writeBatch(db);
      messagesSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (activeChat.isBot) {
        // For AI assistant chat, only delete messages and reset chat state
        await batch.commit();
        
        // Update the chat document to reset it
        await updateDoc(doc(db, 'chats', activeChat.id), {
          lastMessage: '',
          lastMessageId: null,
          updatedAt: serverTimestamp()
        });
        
        // Update local state
        setMessages([]);
                  setSuccessMessage(t('social.chat_cleared_successfully' as any));
        } else {
          // For regular chats, delete the chat document as well
          batch.delete(doc(db, 'chats', activeChat.id));
          await batch.commit();
          
          // Update local state
          setChats(prev => prev.filter(chat => chat.id !== activeChat.id));
          setActiveChat(null);
          setDrawerOpen(false);
          setSuccessMessage(t('social.chat_deleted_successfully' as any));
        }
      } catch (e: any) {
        setError(e.message || t('social.failed_to_delete_chat' as any));
    } finally {
      setActionLoading('');
    }
  };

  // Add message menu handlers
  const handleMessageMenuOpen = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    event.stopPropagation();
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessageForMenu(messageId);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessageForMenu(null);
  };

  // Add function to delete single message
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || !activeChat) return;
    
    try {
      setActionLoading('delete-message');
      
      // Delete the message
      await deleteDoc(doc(db, 'chats', activeChat.id, 'messages', messageId));
      
      // If it was the last message, update the chat's last message
      const remainingMessages = messages.filter(msg => msg.id !== messageId);
      if (messages[messages.length - 1].id === messageId && remainingMessages.length > 0) {
        const lastMsg = remainingMessages[remainingMessages.length - 1];
        await updateDoc(doc(db, 'chats', activeChat.id), {
          lastMessage: lastMsg.text,
          lastMessageId: lastMsg.id,
          lastSenderId: lastMsg.senderId
        });
      }
      
      setSuccessMessage(t('social.message_deleted' as any))
    } catch (e: any) {
      setError(e.message || t('social.failed_to_delete_message' as any))
    } finally {
      setActionLoading('');
      handleMessageMenuClose();
    }
  };

  // Add debug logging
  useEffect(() => {
    console.log('Social component mounted')
    console.log('Current user:', currentUser)
    console.log('Chats:', chats)
  }, [])

  // Add debug logging for messages
  useEffect(() => {
    if (activeChat) {
      console.log('Active chat:', activeChat)
      console.log('Messages:', messages)
    }
  }, [activeChat, messages])

  // Simplify the conversation opening effect
  useEffect(() => {
    if (activeChat && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeChat?.id, messages.length]);

  // Keep the messages effect simple
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add function to set message as selecting during long press
  const setMessageSelecting = (messageId: string | null) => {
    // Clear previous selecting state if any
    if (selectingMessage) {
      const prevElement = document.getElementById(selectingMessage);
      if (prevElement) {
        prevElement.classList.remove('selecting');
      }
    }
    
    setSelectingMessage(messageId);
    
    // Add selecting class to the new element
    if (messageId) {
      const element = document.getElementById(messageId);
      if (element) {
        element.classList.add('selecting');
      }
    }
  };

  // Add effect to clean up selecting state when selection mode changes
  useEffect(() => {
    if (!isSelectionMode) {
      setMessageSelecting(null);
    }
    
    return () => {
      // Clean up any selecting state when unmounting
      if (selectingMessage) {
        const element = document.getElementById(selectingMessage);
        if (element) {
          element.classList.remove('selecting');
        }
      }
    };
  }, [isSelectionMode, selectingMessage]);

  // Add language detection function
  const detectLanguage = (text: string): string => {
    // Common language patterns
    const patterns = {
      en: /^[a-zA-Z\s.,!?'"()-]+$/,  // English (basic Latin chars)
      ro: /[ăâîșțĂÂÎȘȚ]/,           // Romanian (specific characters)
      es: /[áéíóúñ¿¡]/i,             // Spanish
      fr: /[àâäéèêëîïôöùûüÿçœæ]/i,   // French
      de: /[äöüßÄÖÜ]/,               // German
      it: /[àèéìíîòóùú]/i,           // Italian
      pt: /[áâãàçéêíóôõú]/i,         // Portuguese
      ru: /[а-яА-ЯёЁ]/,              // Russian
      zh: /[\u4e00-\u9fff]/,         // Chinese
      ja: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/,  // Japanese
      ko: /[\uAC00-\uD7AF\u1100-\u11FF]/  // Korean
    };

    // Check for specific character patterns
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    // Default to current UI language if no pattern matches
    return i18n.language.split('-')[0];
  };

  // Speech recognition and synthesis handlers
  const handleStopListening = useCallback(() => {
    if (speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }
  }, [speechRecognition]);

  const handleTextToSpeech = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setError(t('social.text_to_speech_not_supported' as any));
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on detected language
      const detectedLang = detectLanguage(text);
      utterance.lang = detectedLang;
      
      // Set up handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentPlayingText(text);
        setSpeechInstance(utterance);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentPlayingText('');
        setSpeechInstance(null);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setError(t('social.text_to_speech_error' as any));
        setIsPlaying(false);
        setCurrentPlayingText('');
        setSpeechInstance(null);
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setError(t('social.text_to_speech_error' as any));
    }
  }, [setError, t, i18n]);

  const handleReadSelectedMessages = useCallback(() => {
    if (selectedMessages.length === 0) return;
    
    const selectedTexts = selectedMessages
      .map(id => messages.find(m => m.id === id)?.text)
      .filter(Boolean)
      .join('. ');
    
    if (selectedTexts) {
      handleTextToSpeech(selectedTexts);
    }
  }, [selectedMessages, messages, handleTextToSpeech]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      setSpeechRecognition(recognition);
    }
  }, []);

  const handleSpeechToText = useCallback(async () => {
    if (!speechRecognition) {
      setError(t('social.speech_recognition_not_supported' as any));
      return;
    }

    try {
      setIsRequestingMicPermission(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      speechRecognition.start();
      setIsListening(true);
      
      speechRecognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setMessage(transcript);
      };
      
      speechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(t('social.speech_recognition_error' as any));
        handleStopListening();
      };
      
    } catch (error) {
      console.error('Microphone permission error:', error);
      setError(t('social.microphone_permission_error' as any));
    } finally {
      setIsRequestingMicPermission(false);
    }
  }, [speechRecognition, handleStopListening, setError, t]);

  const handlePauseSpeech = () => {
    if (window.speechSynthesis && speechInstance) {
      try {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing speech:', error);
        // Fallback: cancel and restart from current position
        const currentPosition = window.speechSynthesis.speaking ? 0 : 0; // Remove currentTime reference
        window.speechSynthesis.cancel();
        if (speechInstance && currentPlayingText) {
          const newUtterance = new SpeechSynthesisUtterance(currentPlayingText);
          newUtterance.voice = speechInstance.voice;
          newUtterance.rate = speechInstance.rate;
          newUtterance.pitch = speechInstance.pitch;
          newUtterance.volume = speechInstance.volume;
          // Skip to approximate position
          if (currentPosition > 0) {
            const words = currentPlayingText.split(' ');
            const approxWordsPerSecond = 3;
            const startIndex = Math.floor(currentPosition * approxWordsPerSecond);
            newUtterance.text = words.slice(startIndex).join(' ');
          }
          setSpeechInstance(newUtterance);
          window.speechSynthesis.speak(newUtterance);
        }
      }
    }
  };

  const handleResumeSpeech = () => {
    if (window.speechSynthesis && speechInstance) {
      try {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error resuming speech:', error);
        // If resume fails, try to restart speech
        if (speechInstance && currentPlayingText) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(speechInstance);
        }
      }
    }
  };

  const handleStopSpeech = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        handleStopListening();
      }
    } catch (err) {
      console.error('Error stopping speech synthesis:', err);
      setError(t('social.speech_synthesis_error' as any));
    } finally {
      // Always reset the requesting permission state
      setIsRequestingMicPermission(false);
    }
  };

  // Add effect to cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognition) {
        handleStopListening();
      }
    };
  }, [speechRecognition, handleStopListening]);

  // Replace the adjustTextareaHeight function
  const adjustTextareaHeight = useCallback((textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    
    const lineHeight = 20; // Base line height
    const padding = 12; // Total vertical padding (6px top + 6px bottom)
    const maxRows = 4;
    const minHeight = lineHeight;
    const maxHeight = (lineHeight * maxRows) + padding;
    
    // Reset height to minimum
    textarea.style.height = `${minHeight}px`;
    
    // Get content height
    const contentHeight = textarea.scrollHeight - padding;
    
    // Calculate rows needed
    const numberOfRows = Math.ceil(contentHeight / lineHeight);
    const targetRows = Math.min(Math.max(1, numberOfRows), maxRows);
    const newHeight = (lineHeight * targetRows);
    
    // Set the new height
    textarea.style.height = `${newHeight}px`;
    
    // Enable/disable scrolling based on content
    textarea.style.overflowY = numberOfRows > maxRows ? 'auto' : 'hidden';
    
    // Adjust all container heights
    const wrapper = textarea.closest('.message-input-wrapper') as HTMLElement;
    if (wrapper) {
      // Calculate heights with padding
      const wrapperPadding = 16;
      const inputAreaPadding = 32;
      
      // Set wrapper height
      const wrapperHeight = newHeight + wrapperPadding;
      wrapper.style.height = `${wrapperHeight}px`;
      
      // Set input area container height
      const inputAreaHeight = wrapperHeight + inputAreaPadding;
      document.documentElement.style.setProperty('--input-height', `${inputAreaHeight}px`);
      
      // Update parent container if it exists
      const inputArea = wrapper.closest('.input-area-container') as HTMLElement;
      if (inputArea) {
        inputArea.style.height = 'auto';
      }
    }
  }, []);

  // Replace the handleMessageChange function
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const value = textarea.value;
    
    // Only update if under limit or deleting
    if (value.length <= 20000 || value.length < message.length) {
      setMessage(value);
      handleTyping();
      
      // Clear any pending resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce the resize operation
      resizeTimeoutRef.current = setTimeout(() => {
        adjustTextareaHeight(textarea);
        // Scroll to bottom after typing
        scrollToBottom(true);
      }, 10);
    }
  }, [message.length, handleTyping, adjustTextareaHeight, scrollToBottom]);

  // Replace the handlePaste function
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const textarea = e.currentTarget.querySelector('textarea');
    if (!textarea) return;
    
    const currentValue = textarea.value;
    const cursorPosition = textarea.selectionStart;
    const newValue = currentValue.slice(0, cursorPosition) + text + currentValue.slice(textarea.selectionEnd);
    
    if (newValue.length <= 20000) {
      setMessage(newValue);
      handleTyping();
      
      // Use requestAnimationFrame for smooth update
      requestAnimationFrame(() => {
        textarea.value = newValue;
        textarea.selectionStart = cursorPosition + text.length;
        textarea.selectionEnd = cursorPosition + text.length;
        adjustTextareaHeight(textarea);
      });
    }
  }, [handleTyping, adjustTextareaHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.length <= 20000) {
        handleSendMessage();
      }
    }
  };

  // Add the handleCreateGroup function
  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim() || selectedUsers.length < 2) return;
    
    try {
      setActionLoading('create-group');
      
      // Create the group chat
      const groupChatRef = await addDoc(collection(db, 'chats'), {
        name: groupName.trim(),
        members: [currentUser.uid, ...selectedUsers],
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isGroup: true,
        photoURL: null // You could add group photo functionality later
      });
      
      // Add welcome message
      await addDoc(collection(db, 'chats', groupChatRef.id, 'messages'), {
        senderId: currentUser.uid,
        text: t('social.group_created_message', { name: groupName.trim() } as any),
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      // Set as active chat
      setActiveChat({
        id: groupChatRef.id,
        name: groupName.trim(),
        members: [currentUser.uid, ...selectedUsers],
        isGroup: true
      });
      
      // Reset states
      setGroupName('');
      setSelectedUsers([]);
      setChatTab('window');
      
      setSuccessMessage(t('social.group_created_successfully' as any));
    } catch (error) {
      console.error('Error creating group:', error);
      setError(t('failed_to_create_group' as any));
    } finally {
      setActionLoading('');
    }
  };

  // Update the handleChatClick function
  const handleChatClick = (chat: Chat) => {
    if (!chat || !chat.members) {
      console.error('Invalid chat object:', chat);
      return;
    }

    setSelectedChatId(chat.id);
    setActiveChat(chat);
    
    // Update unread count in Firestore
    if (currentUser && chat.unreadCount?.[currentUser.uid]) {
      updateDoc(doc(db, 'chats', chat.id), {
        [`unreadCount.${currentUser.uid}`]: 0
      });
    }

    // Handle mobile layout
    if (isMobile) {
      setShowChatsList(false);
    }
  };

  // Update the mobile layout effect
  useEffect(() => {
    if (isMobile) {
      // On mobile, hide chat list when active chat is present
      if (activeChat) {
        setShowChatsList(false);
      }
    } else {
      // On desktop, always show chat list
      setShowChatsList(true);
    }
  }, [isMobile, activeChat]);

  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  }

  const chatWindowVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.05
      }
    }
  }

  // Styled components for chat UI
  const ChatInput = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    padding: '10px 16px',
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    backgroundColor: 'var(--whatsapp-dark-secondary)',
    position: 'relative',
    transition: 'all 0.3s ease',
    borderRadius: '0',
  }));

  const MessageBubble = styled(Box, {
    shouldForwardProp: (prop) => 
      prop !== 'isCurrentUser' && 
      prop !== 'isBot' && 
      prop !== 'hasAttachment' && 
      prop !== 'isAudio'
  })<{ 
    isCurrentUser: boolean; 
    isBot?: boolean; 
    hasAttachment?: boolean;
    isAudio?: boolean;
  }>(({ theme, isCurrentUser, isBot, hasAttachment, isAudio }) => ({
    maxWidth: '70%',
    padding: hasAttachment || isAudio ? '4px' : '8px 12px',
    borderRadius: isCurrentUser ? '15px 15px 3px 15px' : '15px 15px 15px 3px',
    backgroundColor: isCurrentUser ? 
      (theme.palette.mode === 'dark' ? '#00A884' : '#DCF8C6') : 
      (theme.palette.mode === 'dark' ? '#1F2C34' : '#FFFFFF'),
    color: isCurrentUser ? 
      (theme.palette.mode === 'dark' ? '#E9EDF0' : '#111B21') : 
      (theme.palette.mode === 'dark' ? '#E9EDF0' : '#111B21'),
    boxShadow: theme.palette.mode === 'dark' ? 
      '0 1px 2px rgba(0, 0, 0, 0.2)' : 
      '0 1px 2px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    margin: '4px 0',
    wordBreak: 'break-word',
    border: 'none',
    transition: 'all 0.2s ease',
    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme.palette.mode === 'dark' ? 
        '0 4px 12px rgba(0, 0, 0, 0.2)' : 
        '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      [isCurrentUser ? 'right' : 'left']: -8,
      width: 12,
      height: 12,
      backgroundColor: 'inherit',
      clipPath: isCurrentUser ? 
        'polygon(0 0, 0 100%, 100% 100%)' : 
        'polygon(0 100%, 100% 100%, 100% 0)',
    }
  }));

  const MessageContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '2px',
  });

  const MessageContent = styled(Typography)({
    fontSize: '0.95rem',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
  });

  const ChatInputField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
      backgroundColor: 'var(--whatsapp-dark-hover)',
      borderRadius: '24px',
      border: 'none',
      padding: '8px 16px',
      transition: 'all 0.3s ease',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
      },
      '&.Mui-focused': {
        border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      }
    },
    '& .MuiInputBase-input': {
      padding: '8px 4px',
      fontSize: '0.95rem',
      lineHeight: '1.5',
      color: 'var(--whatsapp-text-primary)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    }
  }));

  const ChatListItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'hasUnread' && prop !== 'isPinned'
  })<{ isActive?: boolean; hasUnread?: boolean; isPinned?: boolean }>(({ theme, isActive, hasUnread, isPinned }) => ({
    padding: '10px 16px',
    borderBottom: `1px solid var(--whatsapp-border)`,
    backgroundColor: isActive 
      ? 'var(--whatsapp-dark-hover)' 
      : 'var(--whatsapp-dark-secondary)',
    border: 'none',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    marginBottom: 0,
    borderRadius: 0,
    '&:before': isPinned ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      backgroundColor: 'var(--whatsapp-green)',
      opacity: 0.9,
    } : {},
    '&:hover': {
      backgroundColor: 'var(--whatsapp-dark-hover)'
    }
  }));

  const DateDivider = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    margin: '16px 0',
    '&:before, &:after': {
      content: '""',
      flex: 1,
      height: '1px',
      backgroundColor: 'var(--whatsapp-border)',
    },
    '& > *': {
      margin: '0 16px',
      fontSize: '0.75rem',
      color: 'var(--whatsapp-text-secondary)',
      backgroundColor: alpha(theme.palette.background.default, 0.7),
      padding: '4px 8px',
      borderRadius: '8px',
    }
  }));

  const WhatsAppCheckmark = styled(Box)<{ 
    status: 'sent' | 'delivered' | 'read' | 'none' 
  }>(({ status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '4px',
    '& svg': {
      fontSize: '16px',
      color: status === 'read' 
        ? 'var(--whatsapp-blue-tick)' 
        : 'var(--whatsapp-text-secondary)'
    }
  }));

  // Add these utility functions before the return statement in the Social component

  // Get chat display name
  const getChatDisplayName = (chat: Chat | null): string => {
    if (!chat) return '';
    if (chat.isGroup) return chat.groupName || t('social.group_chat' as any);
    if (chat.isBot) return 'Pheobe (AI Assistant)';
    
    // For individual chats, display the other user's name
    const otherUserId = chat.members.find(id => id !== currentUser?.uid);
    return getUserDisplayName(otherUserId || '');
  };
  
  // Get other chat member ID (for individual chats)
  const getOtherChatMemberId = (chat: Chat | null): string => {
    if (!chat || chat.isGroup) return '';
    return chat.members.find(id => id !== currentUser?.uid) || '';
  };
  
  // Get chat photo URL
  const getChatPhotoUrl = (chat: Chat | null): string => {
    if (!chat) return '';
    if (chat.isGroup) return chat.groupPhoto || '';
    if (chat.isBot) return '/images/ai-assistant.png';
    
    // For individual chats, display the other user's avatar
    const otherUserId = chat.members.find(id => id !== currentUser?.uid);
    return getUserAvatar(otherUserId || '');
  };
  
  // Get user avatar
  const getUserAvatar = (userId: string): string => {
    if (userId === AI_BOT_ID) return '/images/ai-assistant.png';
    const user = [...friends].find(user => user.id === userId);
    return user?.photoURL || '';
  };
  
  // Group messages by date
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(selectedChatMessages);
  }, [selectedChatMessages]);
  
  // Find message by ID
  const findMessageById = (messageId: string): Message | undefined => {
    return selectedChatMessages.find(message => message.id === messageId);
  };
  
  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    // Find the chat in both pinned and regular chats
    const chat = [...pinnedChats, ...regularChats].find(c => c.id === chatId);
    
    if (!chat) {
      console.error('Chat not found:', chatId);
      return;
    }

    // Set the active chat
    setActiveChat(chat);
    setSelectedChatId(chatId);
    setSelectedChat(chat);
    
    // Mark messages as read
    markMessagesAsRead();
    
    // Update unread count in Firestore for this user
    if (currentUser?.uid) {
      updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${currentUser.uid}`]: 0
      }).catch(error => {
        console.error('Error updating unread count:', error);
      });
    }

    // Update local state for unread count
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chatId 
          ? { 
              ...c, 
              unreadCount: { 
                ...(c.unreadCount || {}), 
                [currentUser?.uid || '']: 0 
              } 
            }
          : c
      )
    );

    // Set chat tab to window
    setChatTab('window');
    
    // Handle mobile view
    if (isMobile) {
      setShowChatsList(false);
    }
  };
  
  // Handle chat menu
  const handleChatMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMessageMenuAnchor(event.currentTarget);
  };
  
  // Handle playing audio messages
  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    if (isPlaying && playingAudio === messageId) {
      // Pause current audio
      if (audioRef?.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Play the selected audio
      if (audioRef?.current) {
        audioRef.current.pause();
      }
      
      const newAudioRef = { current: new Audio(audioUrl) };
      setAudioRef(newAudioRef);
      
      newAudioRef.current.play().then(() => {
        setIsPlaying(true);
        setPlayingAudio(messageId);
        
        // Add event listener for when audio ends
        newAudioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setPlayingAudio(null);
        });
      }).catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };
  
  // Voice recording functionality
  const handleVoiceRecord = () => {
    if (voiceRecording) {
      // Stop recording
      if (voiceRecorder) {
        voiceRecorder.stop();
        setVoiceRecording(false);
        if (voiceRecordingTimerRef.current) {
          clearInterval(voiceRecordingTimerRef.current);
          voiceRecordingTimerRef.current = null;
        }
      }
    } else {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            
            recorder.ondataavailable = e => {
              chunks.push(e.data);
            };
            
            recorder.onstop = async () => {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              
              // Only send if recording is longer than 1 second
              if (voiceRecordingTime > 1) {
                // Upload and send the voice message
                try {
                  setActionLoading('voice');
                  // Here you would upload the blob to your storage
                  // For now, we'll just create a temporary URL
                  const url = URL.createObjectURL(blob);
                  await handleSendVoiceMessage(url, voiceRecordingTime);
                } catch (error) {
                  console.error('Error sending voice message:', error);
                  setError(t('social.failed_to_send_voice_message' as any));
                } finally {
                  setActionLoading('');
                }
              }
              
              // Reset recording state
              setVoiceRecordingTime(0);
              stream.getTracks().forEach(track => track.stop());
            };
            
            // Start the recording
            recorder.start();
            setVoiceRecorder(recorder);
            setVoiceRecording(true);
            
            // Start a timer to track recording duration
            voiceRecordingTimerRef.current = setInterval(() => {
              setVoiceRecordingTime(prev => prev + 1);
            }, 1000);
          })
          .catch(error => {
            console.error('Error accessing microphone:', error);
            setError(t('social.microphone_access_error' as any));
          });
      } else {
        setError(t('social.voice_recording_not_supported' as any));
      }
    }
  };
  
  // Send voice message
  const handleSendVoiceMessage = async (audioUrl: string, duration: number) => {
    if (!currentUser || !selectedChatId) return;
    
    try {
      // In a real app, you would upload the audio file to storage
      // and get a permanent URL. Here we're using the temporary URL.
      
      const messageData = {
        senderId: currentUser.uid,
        text: '',
        timestamp: serverTimestamp(),
        audioUrl,
        audioDuration: duration,
        read: false,
        delivered: false,
        replyTo: replyToMessage?.id,
      };
      
      // Add to messages collection
      const messagesRef = collection(db, 'chats', selectedChatId, 'messages');
      await addDoc(messagesRef, messageData);
      
      // Update chat with last message info
      const chatRef = doc(db, 'chats', selectedChatId);
      await updateDoc(chatRef, {
        lastMessage: t('social.voice_message' as any),
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
      });
      
      // Clear reply state
      setReplyToMessage(null);
      
      // Scroll to bottom
      scrollToBottom(true);
    } catch (error) {
      console.error('Error sending voice message:', error);
      setError(t('social.failed_to_send_voice_message' as any));
    }
  };
  
  // Replace the second handleSendMessage with handleEnhancedSendMessage
  const handleEnhancedSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !selectedChatId) return;
    
    try {
      setIsSending(true);
      
      // Prepare message data
      const messageData = {
        senderId: currentUser.uid,
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
        delivered: false,
        replyTo: replyToMessage?.id,
      };
      
      // Clear input before sending for better UX
      setMessageText('');
      
      // Add to messages collection
      const messagesRef = collection(db, 'chats', selectedChatId, 'messages');
      const newMessageRef = await addDoc(messagesRef, messageData);
      
      // Update chat with last message info
      const chatRef = doc(db, 'chats', selectedChatId);
      await updateDoc(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
      });
      
      // Handle bot chat
      if (selectedChat?.isBot) {
        // Trigger bot response
        handleBotResponse(messageText.trim(), newMessageRef.id);
      }
      
      // Clear reply state
      setReplyToMessage(null);
      
      // Scroll to bottom
      scrollToBottom(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(t('social.failed_to_send_message' as any));
    } finally {
      setIsSending(false);
    }
  };
  
  // Also update the keyboard handler that uses this function
  const handleEnhancedKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Send on Enter without holding Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnhancedSendMessage();
    }
    
    // Cancel reply on Escape
    if (e.key === 'Escape' && replyToMessage) {
      e.preventDefault();
      setReplyToMessage(null);
    }
  };

  // Add a proper handleBackToList function
  const handleBackToList = useCallback(() => {
    setShowChatsList(true);
    setChatTab('list');
    // Don't clear active chat to prevent the contacts from disappearing
  }, []);

  // Add new helper function for message status
  const getMessageStatus = (message: any): 'sent' | 'delivered' | 'read' | 'none' => {
    if (!message || message.senderId !== currentUser?.uid) return 'none';
    
    if (message.read) return 'read';
    if (message.delivered) return 'delivered';
    return 'sent';
  };

  // Update messageMenuItems function
  const messageMenuItems = (message: any): MessageMenuItem[] => {
    if (!message) return [];

    const items: MessageMenuItem[] = [
      {
        icon: <ContentCopyIcon fontSize="small" />,
        label: t('social.copy' as any),
        onClick: () => {
          if (message && message.text) {
            navigator.clipboard.writeText(message.text);
            setSuccessMessage(t('social.text_copied' as any));
          }
          handleMessageMenuClose();
        },
        color: 'inherit'
      },
      {
        icon: <VolumeUpIcon fontSize="small" />,
        label: t('social.speak_aloud' as any),
        onClick: () => {
          if (message && message.text) {
            handleTextToSpeech(message.text);
          }
          handleMessageMenuClose();
        },
        color: 'inherit'
      }
    ];

    // Only add delete option for own messages
    if (message.senderId === currentUser?.uid) {
      items.push({
        icon: <CheckBoxOutlineBlankIcon fontSize="small" />,
        label: t('social.select' as any),
        onClick: () => {
          setIsSelectionMode(true);
          handleMessageSelect(message.id);
          handleMessageMenuClose();
        },
        color: 'inherit'
      });

      items.push({
        icon: <DeleteIcon fontSize="small" />,
        label: t('social.delete' as any),
        onClick: () => {
          handleDeleteMessage(message.id);
          handleMessageMenuClose();
        },
        disabled: actionLoading === 'delete-message',
        color: 'error'
      });
    }

    return items;
  };

  // Add this to the message bubble wrapper
  const handleMessageSelection = (messageId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Only allow selection of the current user's messages
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.senderId !== currentUser?.uid) return;
    
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
    
    setSelectedMessages(prev => {
      const newSelection = prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId];
      
      // If no messages are selected, exit selection mode
      if (newSelection.length === 0) {
        setIsSelectionMode(false);
      }
      
      return newSelection;
    });
  };

  // Add handler for emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = textAreaRef.current?.selectionStart || message.length;
    const updatedMessage = 
      message.substring(0, cursorPosition) + 
      emoji + 
      message.substring(cursorPosition);
    
    setMessage(updatedMessage);
    
    // Close the emoji picker
    setShowEmojiPicker(false);
    setEmojiAnchorEl(null);
    
    // Focus back on the textarea and move cursor after inserted emoji
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPosition = cursorPosition + emoji.length;
        textAreaRef.current.selectionStart = newPosition;
        textAreaRef.current.selectionEnd = newPosition;
      }
    }, 10);
  };

  // Add handler to toggle emoji picker
  const handleEmojiButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(event.currentTarget);
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Create a simplified version of handleBotResponse when API key is not available
  const handleBotResponseFallback = async (userMessage: string) => {
    if (!activeChat) return;
    
    try {
      // Add typing indicator to the UI
      setMessages(prev => [...prev, {
        id: `typing-${Date.now()}`,
        isTyping: true,
        senderId: 'bot',
        text: '',
        timestamp: new Date(),
        read: true
      }]);
      
      // Add a delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a fallback response
      const fallbackResponse = "I'm currently offline. The administrator needs to configure the AI integration for me to respond intelligently.";
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => !m.isTyping));
      
      // Add the bot message to the UI
      // This will only update the local state, not the database
      setMessages(prev => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          chatId: activeChat.id,
          text: fallbackResponse,
          senderId: 'bot',
          timestamp: new Date(),
          read: true,
          isBot: true
        }
      ]);
      
      // Scroll to bottom
      scrollToBottom(true);
      
    } catch (error) {
      console.error('Error in fallback bot response:', error);
      // Remove typing indicator if there was an error
      setMessages(prev => prev.filter(m => !m.isTyping));
    }
  };

  // Add this effect after other useEffects
  useEffect(() => {
    // Clear message input when switching chats
    setMessage('');
    
    // Reset text area height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '28px';
      
      const wrapper = textAreaRef.current.closest('.message-input-wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.style.height = '44px';
        document.documentElement.style.setProperty('--input-height', '76px');
      }
    }
    
    // Return void to satisfy EffectCallback type
    return;
  }, [activeChat?.id]); // Only run when active chat changes

  // Add theme styles to chat container
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.classList.toggle('light-theme', chatTheme === 'light');
      chatContainer.classList.toggle('dark-theme', chatTheme === 'dark');
    }
  }, [chatTheme]);

  // Add a helper to count messages sent by a user in a chat
  const getMessageCountForUser = (chatId: string, userId: string) => {
    return messages.filter(m => m.chatId === chatId && m.senderId === (userId || '')).length;
  }

  // Update the messages query to order by timestamp in descending order
  useEffect(() => {
    if (!activeChat) return;

    setMessagesLoading(true);
    
    const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
    const q = query(messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })).reverse();

      setMessages(newMessages as Message[]);
      setMessagesLoading(false);
      
      // Immediately scroll to bottom after loading messages without animation
      if (messagesContainerRef.current) {
        messagesContainerRef.current.style.scrollBehavior = 'auto';
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    });

    return () => {
      unsubscribe();
      setMessages([]);
    };
  }, [activeChat?.id]);

  // Keep the simple scroll to bottom for new messages without animation
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.style.scrollBehavior = 'auto';
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add state for chat header menu
  const [chatHeaderMenuAnchor, setChatHeaderMenuAnchor] = useState<null | HTMLElement>(null);

  // Add handler for chat header menu
  const handleChatHeaderMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setChatHeaderMenuAnchor(event.currentTarget);
  };

  const handleChatHeaderMenuClose = () => {
    setChatHeaderMenuAnchor(null);
  };

  const getMessageStatusIcon = (message: Message) => {
    if (!message) return null;
    
    if (message.read) {
      return <DoneAll fontSize="small" color="primary" />;
    } else if (message.delivered) {
      return <CheckCircleOutline fontSize="small" color="action" />;
    }
    return null;
  };

  // Add effect to handle chatId from URL
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      handleChatSelect(chatId);
    }
  }, [searchParams]);

  // Update the handleTypingIndicator function
  const handleTypingIndicator = (chatId: string, userId: string, isTyping: boolean) => {
    setMessages(prev => {
      const typingMessage = {
        id: `typing-${userId}`,
        senderId: userId,
        text: '',
        timestamp: new Date(),
        isTyping: true
      } as Message;

      if (isTyping) {
        return [...prev.filter(m => m.id !== typingMessage.id), typingMessage];
      } else {
        return prev.filter(m => m.id !== typingMessage.id);
      }
    });
  };

  // Update the handleMessageUpdate function
  const handleMessageUpdate = (chatId: string, messageId: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  };

  // Update the handleChatUpdate function
  const handleChatUpdate = (chatId: string, updates: Partial<Chat>) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      )
    );
  };

  // Update the handleUnreadCountUpdate function
  const handleUnreadCountUpdate = (chatId: string, userId: string, count: number) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              unreadCount: { 
                ...chat.unreadCount, 
                [userId]: count 
              } 
            } 
          : chat
      )
    );
  };

  // Add message listener
  useEffect(() => {
    if (!currentUser || !activeChat) return;

    const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          read: data.read || false,
          delivered: data.delivered || false,
          type: data.type || 'text',
          senderId: data.senderId || '',
          text: data.text || '',
          timestamp: data.timestamp || new Date()
        } as Message;
      }).reverse();

      setMessages(newMessages);

      // Create notification for new messages
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && change.doc.data().senderId !== currentUser?.uid) {
          const message = change.doc.data();
          const sender = friends.find(f => f.id === message.senderId);
          if (sender && currentUser && activeChat) {
            createMessageNotification(
              {
                uid: sender.id,
                displayName: sender.displayName || sender.username,
                photoURL: sender.photoURL || ''
              },
              currentUser.uid,
              message.text,
              activeChat.id
            );
          }
        }
      });

      // Scroll to bottom for new messages
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [currentUser, activeChat, friends]);

  return (
    <ThemeProvider theme={theme}>
      <Container 
      maxWidth="lg" 
      sx={{ 
        pt: 2, 
        pb: 5, // Add padding at bottom to prevent footer overlap
        minHeight: 'calc(100vh - 68px)', // Account for navbar and footer
        mb: '24px', // Add margin to ensure footer is visible
      }}
    >
      <Paper elevation={3} sx={{ 
        height: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 90px)', // Adjusted to prevent overflow
      }}>
        {!currentUser && (
          <Typography color="error" sx={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>
            No user logged in
          </Typography>
        )}
        
        <Paper 
          elevation={3} 
          sx={{ 
            display: 'flex', 
            flexGrow: 1,
            overflow: 'hidden',
            height: '100%',
            width: '100%',
            position: 'relative'
          }}
        >
          {/* Left sidebar with chats - conditionally visible */}
          <Box sx={{ 
            width: { xs: '100%', sm: 300 },
            minWidth: { sm: 300 },
            maxWidth: { xs: '100%', sm: 300 },
            borderRight: 1, 
            borderColor: 'divider',
            display: showChatsList ? 'flex' : 'none',
            flexDirection: 'column',
            height: 'calc(100% - 24px)', // leave space for footer
            bgcolor: 'background.paper',
            position: 'relative',
            zIndex: theme.zIndex.drawer - 1, // Ensure it's below the drawer
          }}>
            {/* Profile section */}
            {currentUser && (
              <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar 
                  src={currentUser.photoURL || undefined}
                  sx={{ width: 50, height: 50 }}
                >
                  {!currentUser.photoURL && currentUser.displayName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </Typography>
              </Box>
            )}

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                height: 48,
                minHeight: 48,
                '& .MuiTab-root': {
                  height: 48,
                  minHeight: 48,
                  fontSize: '0.875rem',
                  padding: 0,
                  minWidth: 'unset'
                }
              }}
            >
              <Tab 
                icon={<ChatIcon />} 
                label={t('social.chats' as any)}
                sx={{
                  '& .MuiTab-iconWrapper': {
                    marginRight: '6px'
                  },
                  flexDirection: 'row',
                  width: '100%'
                }}
              />
            </Tabs>
            
            {/* Tab content */}
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                      height: '100%',
                      display: 'flex', 
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      <List sx={{ 
                        flex: 1, 
                        overflow: 'auto', 
                        py: 0,
                        minHeight: 0
                      }}>
                        {chatsLoading ? (
                          // Show loading skeletons
                          [...Array(3)].map((_, index) => (
                            <ListItem key={index} sx={{ py: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Box sx={{ flex: 1 }}>
                                  <Skeleton variant="text" width="60%" height={24} />
                                  <Skeleton variant="text" width="40%" height={20} />
                                </Box>
                              </Box>
                            </ListItem>
                          ))
                        ) : (
                          chats.map(chat => {
                            const displayInfo = getChatDisplayInfo(chat)
                            const otherMember = chat.members.find((m: string) => m !== currentUser?.uid)
                            const friend = friends.find(f => f.id === otherMember)
                            
                            // Don't render until we have friend data (except for bot chats)
                            if (!chat.isBot && !friend) return null;
                            
                            // Count messages sent by the other user
                            const messageCount = getMessageCountForUser(chat.id, otherMember || '')
                            const unreadCount = chat.unreadCount?.[currentUser?.uid || ''] || 0;
                            
                            return (
                                <ListItem
                                  key={chat.id}
                                  button
                                  selected={activeChat?.id === chat.id}
                                  onClick={() => handleChatClick(chat)}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    py: 1,
                                    pr: 1,
                                    pl: 2
                                  }}
                                >
                                  <Avatar 
                                    src={friend?.photoURL || displayInfo.photoURL}
                                    sx={{ 
                                      width: 40, 
                                      height: 40,
                                      bgcolor: chat.isBot ? 'primary.main' : 'grey.500'
                                    }}
                                  >
                                    {chat.isBot ? 'AI' : (friend?.displayName?.[0] || friend?.username?.[0] || '?')}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {!chat.isBot && getUserDisplayName(otherMember || '') || (chat.isBot ? 'Pheobe' : displayInfo.name)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}
                                    >
                                      {chat.typing && Object.entries(chat.typing).some(([uid, typing]) => uid !== currentUser?.uid && typing) ? (
                                        <Box component="span" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Box
                                            component="span"
                                            sx={{
                                              width: 4,
                                              height: 4,
                                              borderRadius: '50%',
                                              bgcolor: 'primary.main',
                                              animation: 'pulse 1s ease-in-out infinite',
                                            }}
                                          />
                                          {t('social.typing' as any)}
                                        </Box>
                                      ) : (
                                        <Box component="span" sx={{ color: 'text.secondary' }}>
                                          {typeof chat.lastMessage === 'string' ? chat.lastMessage : chat.lastMessage?.text || t('social.start_conversation')}
                                        </Box>
                                      )}
                                    </Typography>
                                  </Box>
                                  {/* Show message count badge for the other user, only if > 0 */}
                                  {!chat.isBot && messageCount > 0 && (
                                    <Box
                                      sx={{
                                        minWidth: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        bgcolor: 'secondary.main',
                                        color: 'secondary.contrastText',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        ml: 1
                                      }}
                                    >
                                      {messageCount}
                                    </Box>
                                  )}
                                  {unreadCount > 0 && (
                                    <Box
                                      sx={{
                                        minWidth: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        p: '4px 6px',
                                        ml: 1
                                      }}
                                    >
                                      {unreadCount > 20 ? '20+' : unreadCount}
                                    </Box>
                                  )}
                                </ListItem>
                              )
                            })
                          )}
                      </List>
                    </Box>
            </Box>
          </Box>

          {/* Chat window */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Add chat header */}
            {activeChat && (
          <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'var(--whatsapp-dark-secondary)' : '#ffffff',
                color: theme => theme.palette.mode === 'dark' ? '#e3e3e3' : '#111111',
                height: 'var(--chat-header-height)', // Use CSS variable
                minHeight: 'var(--chat-header-height)', // Use CSS variable
                width: '100%',
                boxShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  overflow: 'hidden', // Prevent content from expanding the box
                  width: { xs: 'calc(100% - 90px)', sm: 'calc(100% - 160px)', md: 'calc(100% - 200px)' } // More space for name on mobile
                }}>
                  {isMobile && !isSelectionMode && (
                    <IconButton onClick={handleBackToList} sx={{ mr: 1, flexShrink: 0 }}>
                          <ArrowBackIcon />
                        </IconButton>
                  )}
                      {isSelectionMode ? (
                    <IconButton onClick={() => setIsSelectionMode(false)} sx={{ mr: 1, flexShrink: 0 }}>
                            <CloseIcon />
                          </IconButton>
                  ) : (
                              <Avatar
                      src={activeChat.isBot ? '/images/ai-assistant.png' : 
                        friends.find((f: any) => f.id === activeChat.members.find((m: string) => m !== currentUser?.uid))?.photoURL}
                      sx={{ width: 40, height: 40, flexShrink: 0 }}
                              >
                      {!activeChat.isBot && !friends.find((f: any) => f.id === activeChat.members.find((m: string) => m !== currentUser?.uid))?.photoURL && 
                        (getUserDisplayName(activeChat.members.find((m: string) => m !== currentUser?.uid) || '').charAt(0))}
                              </Avatar>
                            )}
                  <Box sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    flexGrow: 1,
                    flexShrink: 1,
                  }}>
                    {isSelectionMode ? (
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.3,
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                      >
                        {selectedMessages.length} {selectedMessages.length === 1 ? 'message' : 'messages'} selected
                      </Typography>
                    ) : (
                      <>
                        {/* Display name and username side by side */}
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flexWrap: 'nowrap' }}>
                          <Typography 
                            variant="subtitle1" 
                            noWrap={true}
                            sx={{ 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3,
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              minWidth: 0,
                              maxWidth: '100%'
                            }}
                          >
                            {activeChat.isBot 
                              ? 'Pheobe' 
                              : getUserDisplayName(activeChat.members.find((m: string) => m !== currentUser?.uid) || '')}
                          </Typography>
                          {/* Username to the right of display name */}
                          {!activeChat.isBot && (
                            <Typography
                              variant="caption"
                              noWrap={true}
                              sx={{
                                color: 'text.secondary',
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                lineHeight: 1.1,
                                wordBreak: 'break-all',
                                display: 'inline-block',
                                ml: 1,
                                minWidth: 0,
                                maxWidth: '60%'
                              }}
                            >
                              @{getUserUsername(activeChat.members.find((m: string) => m !== currentUser?.uid) || '')}
                            </Typography>
                          )}
                        </Box>
                        {!activeChat.isBot && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            {!isMobile && (
                              <Box
                                component="span"
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: onlineUsers[activeChat.members.find((m: string) => m !== currentUser?.uid) || ''] 
                                    ? 'success.main' 
                                    : 'text.disabled'
                                }}
                              />
                            )}
                            {onlineUsers[activeChat.members.find((m: string) => m !== currentUser?.uid) || ''] 
                              ? t('social.online')
                              : t('social.offline') + (isMobile ? '' : ' • ' + formatMessageTime(
                                  friends.find(f => f.id === activeChat.members.find((m: string) => m !== currentUser?.uid))?.lastSeen
                                ))
                            }
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexShrink: 0,
                  width: { xs: 70, sm: 140, md: 200 }, // Less width for actions on mobile
                  justifyContent: 'flex-end',
                  gap: 1
                }}>
                  {isSelectionMode ? (
                    <>
                      {/* Selection mode actions */}
                      <Tooltip title="Delete selected">
                        <IconButton onClick={handleDeleteMessages} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Speak messages">
                        <IconButton onClick={handleReadSelectedMessages}>
                          <VolumeUpIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Unselect all">
                        <IconButton onClick={() => {
                          setSelectedMessages([]);
                          setIsSelectionMode(false);
                        }}>
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      {/* Normal mode actions */}
                      <Tooltip title={chatTheme === 'dark' ? t('social.switch_to_light_mode' as any) : t('social.switch_to_dark_mode' as any)}>
                        <IconButton
                          onClick={() => {
                            const newTheme = chatTheme === 'dark' ? 'light' : 'dark';
                            setChatTheme(newTheme);
                            localStorage.setItem('chatTheme', newTheme);
                          }}
                          sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                            '&:hover': {
                              color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
                            }
                          }}
                        >
                          {chatTheme === 'dark' ? <Brightness7Icon /> : <DarkModeIcon />}
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handleChatHeaderMenuOpen}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Add chat header menu */}
                      <Menu
                        anchorEl={chatHeaderMenuAnchor}
                        open={Boolean(chatHeaderMenuAnchor)}
                        onClose={handleChatHeaderMenuClose}
                        keepMounted
                        disableAutoFocus
                        disableEnforceFocus
                        disableRestoreFocus
                        MenuListProps={{
                          'aria-labelledby': 'chat-header-menu-button',
                          role: 'menu',
                          tabIndex: -1,
                          autoFocus: false
                        }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            mt: 1.5,
                            minWidth: 180
                          }
                        }}
                      >
                        <MenuItem onClick={() => {
                          handleDeleteChat();
                          handleChatHeaderMenuClose();
                        }}>
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <ListItemText primary={t('Delete Chat' as any)} primaryTypographyProps={{ color: 'error' }} />
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </Box>
              </Box>
            )}
                
            {/* Chat content */}
                    <Box
                    ref={messagesContainerRef}
              className="chat-container"
                      sx={{
                        flex: 1,
                        height: 'calc(100% - var(--chat-header-height) - var(--input-height))', // Use CSS variables
                        overflow: messagesLoading ? 'hidden' : 'auto',
                        width: '100%',
                        position: 'relative',
                        px: 2,
                        py: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'var(--whatsapp-dark-bg)' : '#f0f2f5',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {!activeChat ? (
                        <Box 
                          sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 2
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                          >
                            {t('social.select_chat' as any)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                          >
                            {t('Start Chatting' as any)}
                          </Typography>
                        </Box>
                      ) : messagesLoading ? (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)'
                        }}>
                          <CircularProgress />
                        </Box>
                      ) : messages.length === 0 ? (
                        <Box 
                          sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 2
                          }}
                        >
                          {groupMessagesByDate([]).map((item) => (
                            item.type === 'system' && (
                              <Typography 
                                key={item.id}
                                variant="body1" 
                                sx={{ 
                                  px: 3,
                                  py: 1,
                                  borderRadius: 2,
                                  bgcolor: 'action.hover',
                                  color: 'text.secondary',
                                  textAlign: 'center',
                                  fontStyle: 'italic'
                                }}
                              >
                                {item.text}
                              </Typography>
                            )
                          ))}
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                          >
                            {t('social.message_friends' as any)}
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          {groupMessagesByDate(messages).map((item, index, arr) => (
                            <React.Fragment key={item.id}>
                              {item.type === 'date' ? (
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    my: 2 
                                  }}
                                >
                                  <Divider sx={{ flex: 1 }} />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      mx: 2, 
                                      px: 2, 
                                      py: 0.5, 
                                      borderRadius: 2,
                                      bgcolor: 'background.paper',
                                      color: 'text.secondary',
                                      boxShadow: 1
                                    }}
                                  >
                                    {item.date}
                                  </Typography>
                                  <Divider sx={{ flex: 1 }} />
                                </Box>
                              ) : item.type === 'unread-divider' ? (
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    my: 2 
                                  }}
                                >
                                  <Divider sx={{ flex: 1 }} />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      mx: 2, 
                                      px: 2, 
                                      py: 0.5, 
                                      borderRadius: 2,
                                      bgcolor: 'error.main',
                                      color: 'error.contrastText',
                                      fontWeight: 'medium'
                                    }}
                                  >
                                    {t('social.unread_messages' as any)}
                                  </Typography>
                                  <Divider sx={{ flex: 1 }} />
                                </Box>
                              ) : item.type === 'system' ? (
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    my: 2 
                                  }}
                                >
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      mx: 2, 
                                      px: 3,
                                      py: 1,
                                      borderRadius: 2,
                                      bgcolor: 'action.hover',
                                      color: 'text.secondary',
                                      textAlign: 'center',
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    {item.text}
                                  </Typography>
                                </Box>
                              ) : (
                                <ChatMessage
                                  key={item.id}
                                  message={item}
                                  isCurrentUser={item.senderId === currentUser?.uid}
                                  isSelected={selectedMessages.includes(item.id)}
                                  onSelect={handleMessageSelection}
                                  onMenuOpen={(e, messageId) => handleMessageMenuOpen(e, messageId)}
                                  isSelectionMode={isSelectionMode}
                                  currentUser={currentUser}
                                  formatMessageTime={formatMessageTime}
                                  getMessageStatus={getMessageStatus}
                                  lastSentMessageId={lastSentMessageId}
                                  showTail={isLastMessageInChain(item, arr, index)}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </>
                      )}
                      <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
                    

                </Box>

                  {/* Input area */}
                  <Box 
                    className="input-area-container"
                    sx={{ 
                      height: 'auto',
                      minHeight: 80, // Increased from 68 for more vertical space
                      display: (!activeChat || isSelectionMode) ? 'none' : 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center', // Center vertically
                      alignItems: 'center', // Center horizontally
                      borderTop: '1px solid',
                      borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      backgroundColor: theme => theme.palette.mode === 'dark' ? 'var(--whatsapp-dark-secondary)' : '#ffffff',
                      color: theme => theme.palette.mode === 'dark' ? '#e3e3e3' : '#111111',
                      zIndex: 2,
                      position: 'relative',
                      width: '100%',
                      px: 1.5,
                      py: 2.5, // Increased vertical padding
                      transition: 'all 0.3s ease',
                      boxShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 -1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Box 
                      className={`message-input-container ${isSending ? 'sending' : ''}`}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5,
                        width: '100%',
                        minHeight: 56,
                        maxWidth: 'calc(100% - 32px)', // Changed from percentage to calc
                        borderRadius: 4,
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'var(--whatsapp-dark-hover)' : '#f0f2f5',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        boxShadow: theme => theme.palette.mode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
                        px: 1.5,
                        py: 1,
                        alignSelf: 'center',
                        mx: 'auto', // Added to help with centering
                        border: theme => theme.palette.mode === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        height: '100%', // Added to ensure full height
                        py: 0.5 
                      }}>
                        {/* Emoji button - moved to the left for better UX */}
                      <IconButton
                          className="chat-action-button"
                          onClick={handleEmojiButtonClick}
                        sx={{ 
                          color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                          flexShrink: 0,
                            width: 36,
                            height: 36,
                            '&:hover': {
                              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                              color: 'primary.main'
                            }
                        }}
                      >
                          <Tooltip title={t('social.insert_emoji' as any)}>
                            <EmojiEmotionsIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>

                        {/* Attachment button */}
                      <IconButton
                          className="message-action-button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={actionLoading === 'upload'}
                        sx={{
                            color: 'text.secondary',
                          flexShrink: 0,
                            width: 36,
                            height: 36,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'primary.main'
                            }
                        }}
                      >
                          <Tooltip title={t('social.attach_file' as any)}>
                            <AttachFileIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>
                      </Box>

                      {/* Message input wrapper */}
                      <Box 
                        className="message-input-wrapper" 
                        sx={{ 
                          position: 'relative',
                          flex: 1,
                          minHeight: 44,
                          height: 44, // Increased from 38
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          mx: 1,
                          padding: '8px 0' // Increased from 7px
                        }}
                      >
                        {/* Improved TextField styling */}
                        <StyledTextField
                          className="message-input-field"
                          fullWidth
                          placeholder={t('social.type_a_message' as any)}
                          value={message}
                          error={message.length > 20000}
                          multiline
                          maxRows={4}
                          onChange={handleMessageChange}
                          onPaste={handlePaste}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          inputRef={textAreaRef}
                          variant="standard"
                          sx={{
                            '& .MuiInputBase-input': {
                              color: theme => theme.palette.mode === 'dark' ? '#e3e3e3' : '#111111'
                            }
                          }}
                          InputProps={{
                            disableUnderline: true
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                        {/* Voice input button */}
                        <IconButton
                          id="speech-to-text-button"
                          className={`message-action-button ${isListening ? 'active' : ''}`}
                          onClick={() => isListening ? handleStopListening() : handleSpeechToText()}
                          disabled={isRequestingMicPermission || !speechRecognition}
                          color={isListening ? "error" : "default"}
                          sx={{
                            position: 'relative',
                            flexShrink: 0,
                            width: 36,
                            height: 36,
                            mr: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'primary.main'
                            }
                          }}
                        >
                          <Tooltip title={t('social.voice_input' as any)}>
                            <MicIcon fontSize="small" />
                          </Tooltip>
                        </IconButton>

                      {/* Send button */}
                      <IconButton
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isSending || message.length > 20000}
                        sx={{
                            width: 38,
                            height: 38,
                          borderRadius: '50%',
                            backgroundColor: theme => theme.palette.mode === 'dark' ? 'var(--whatsapp-green)' : '#128C7E',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: theme => theme.palette.mode === 'dark' ? 'var(--whatsapp-light-green)' : '#25D366'
                            },
                            '&.Mui-disabled': {
                              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 128, 105, 0.6)' : 'rgba(18, 140, 126, 0.6)',
                              color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                      </Box>
                    </Box>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />

                    {/* Emoji Picker Popup */}
                    <Popover
                      open={showEmojiPicker}
                      anchorEl={emojiAnchorEl}
                      onClose={() => {
                        setShowEmojiPicker(false);
                        setEmojiAnchorEl(null);
                      }}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                                sx={{
                        '& .MuiPaper-root': {
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          overflow: 'hidden'
                        }
                      }}
                    >
                      <Box sx={{ width: { xs: 300, sm: 350 }, height: 400 }}>
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          searchPlaceholder="Search emojis..."
                          width="100%"
                          height="100%"
                          previewConfig={{ showPreview: false }}
                          emojiStyle={EmojiStyle.NATIVE}
                          autoFocusSearch={true}
                          skinTonesDisabled
                        />
                              </Box>
                    </Popover>
            </Box>
          </Box>
        </Paper>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          keepMounted
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          MenuListProps={{
            'aria-labelledby': 'user-menu-button',
            role: 'menu',
            tabIndex: -1,
            autoFocus: false
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 180
            }
          }}
        >
          <MenuItem onClick={() => {
            const friend = friends.find((f: { id: string }) => f.id === menuUserId);
            if (!friend) {
              setError(t('social.must_be_friends_to_message' as any));
              handleMenuClose();
              return;
            }

            const chat = chats.find((c: { isGroup: boolean; members: string[] }) => 
              !c.isGroup && c.members.includes(friend.id) && c.members.includes(currentUser?.uid || '')
            );
            if (chat) {
              setActiveChat(chat);
            } else {
              // Create new chat
              addDoc(collection(db, 'chats'), {
                members: [currentUser?.uid || '', friend.id],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }).then(docRef => {
                setActiveChat({ id: docRef.id, members: [currentUser?.uid || '', friend.id], isGroup: false });
              });
            }
            setTab(0);
            setChatTab('window');
            handleMenuClose()
          }}>
            <ChatIcon sx={{ mr: 1 }} /> {t('social.chats')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (menuUserId) handleRemoveFriend(menuUserId);
            handleMenuClose();
          }}>
            <DeleteIcon sx={{ mr: 1 }} /> {t('social.remove_friend')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (menuUserId) handleBlock(menuUserId);
            handleMenuClose();
          }}>
            <BlockIcon sx={{ mr: 1 }} /> {t('social.block_user')}
          </MenuItem>
        </Menu>

        {/* Success and Error messages */}
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
            <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
        
        {successMessage && (
          <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
            <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>
        )}

        {/* Voice Player - Move it outside the Paper component */}
        {currentPlayingText && (
          <Box
            className={`voice-player ${isPlaying ? 'entered' : 'exiting'}`}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 20,
              zIndex: 1300,
              backgroundColor: '#242f39',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              transform: isPlaying ? 'translateX(0)' : 'translateX(100%)',
              opacity: isPlaying ? 1 : 0,
            }}
          >
            <Typography
              sx={{
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.875rem',
                color: '#e3e3e3'
              }}
            >
              {currentPlayingText}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={isPlaying ? handlePauseSpeech : handleResumeSpeech}
                sx={{
                  color: '#e3e3e3',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={handleStopSpeech}
                sx={{
                  color: '#e3e3e3',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <StopIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Simple message options menu */}
        <Menu
          anchorEl={messageMenuAnchor}
          open={Boolean(messageMenuAnchor)}
          onClose={handleMessageMenuClose}
          keepMounted
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          MenuListProps={{
            'aria-labelledby': 'message-menu-button',
            role: 'menu',
            tabIndex: -1,
            autoFocus: false
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 180
            }
          }}
        >
          {selectedMessageForMenu && messageMenuItems(messages.find(m => m.id === selectedMessageForMenu)).map((item, index) => (
            <MenuItem 
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
              sx={{ 
                color: item.color === 'error' ? 'error.main' : 'inherit',
                minWidth: 120
              }}
            >
              <ListItemIcon sx={{ color: item.color === 'error' ? 'error.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      {/* Chat info drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        disablePortal
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '85%', sm: 320 },
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            p: 2,
            top: '64px', // Height of the navbar
            height: 'calc(100% - 64px)', // Full height minus navbar
            position: 'fixed', // Use fixed so it stays below the navbar
            zIndex: 1200 // Lower than the AppBar (navbar is 1300)
          }
        }}
      >
        {activeChat && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Chat Info</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={activeChat.isBot ? '/images/ai-assistant.png' : 
                  friends.find((f: any) => f.id === activeChat.members.find((m: string) => m !== currentUser?.uid))?.photoURL}
                sx={{ width: 80, height: 80, mb: 1.5 }}
              >
                {!activeChat.isBot && (getUserDisplayName(activeChat.members.find((m: string) => m !== currentUser?.uid) || '').charAt(0))}
              </Avatar>
              <Typography variant="h6">
                {activeChat.isBot ? 'Pheobe' : getUserDisplayName(activeChat.members.find((m: string) => m !== currentUser?.uid) || '')}
              </Typography>
              {!activeChat.isBot && (
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {onlineUsers[activeChat.members.find((m: string) => m !== currentUser?.uid) || ''] ? t('social.online' as any) : t('social.offline' as any)}
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Actions</Typography>
            <List dense disablePadding>
              <ListItem component="li" onClick={() => setSelectedMessages([])} sx={{ borderRadius: 1, mb: 0.5, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MarkChatReadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Mark all as read" />
              </ListItem>
              
              <ListItem component="li" onClick={() => {
                const allUserMessages = messages.filter(m => m.senderId === currentUser?.uid).map(m => m.id);
                setSelectedMessages(allUserMessages);
                setIsSelectionMode(true);
                setDrawerOpen(false);
              }} sx={{ borderRadius: 1, mb: 0.5, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckBoxOutlineBlankIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Select all my messages" />
              </ListItem>
              
              <ListItem component="li" onClick={() => {}} sx={{ borderRadius: 1, mb: 0.5, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Search in conversation" />
              </ListItem>
              
              <ListItem component="li" onClick={handleDeleteChat} sx={{ borderRadius: 1, mb: 0.5, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Delete chat" primaryTypographyProps={{ color: 'error' }} />
              </ListItem>
            </List>
            
            {!activeChat.isBot && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Shared Media</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {sharedMedia.length > 0 ? (
                    sharedMedia.slice(0, 6).map((media, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 90, 
                          height: 90, 
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: 'action.hover'
                        }}
                      >
                        <img 
                          src={media.imageUrl} 
                          alt="Shared media"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No shared media</Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </Drawer>

      {/* Remove the fixed position theme toggle */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1
      }}>
        {!isSelectionMode && (
          <>
            {/* Normal mode actions */}
            <IconButton onClick={handleChatHeaderMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </>
        )}
      </Box>
    </Container>
    </ThemeProvider>
  )
}

export default Social 