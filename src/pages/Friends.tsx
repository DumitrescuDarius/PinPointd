import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
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
  ListItemIcon,
  ListItemAvatar,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Slide,
  Backdrop,
  Chip,
  Tooltip,
  Badge
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import React, { useState, useEffect, useRef } from 'react'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ChatIcon from '@mui/icons-material/Chat'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import EmailIcon from '@mui/icons-material/Email'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { motion } from 'framer-motion'
import { db, auth } from '../config/firebase'
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { ref, onValue, onDisconnect, get, getDatabase, set } from 'firebase/database'
import { useNavigate } from 'react-router-dom'

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
}

interface OnlineStatus {
  [key: string]: boolean;
}

// Animation variants for list items
const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
}

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

// Add this type at the top of the file, after the imports
type TranslationKey = 
  | 'friends.title'
  | 'friends.my_friends'
  | 'friends.requests'
  | 'friends.search_placeholder'
  | 'friends.searching'
  | 'friends.press_enter'
  | 'friends.wants_to_be_friends'
  | 'friends.add_friend'
  | 'friends.accept'
  | 'friends.reject'
  | 'friends.remove_friend'
  | 'friends.block_user'
  | 'friends.no_requests'
  | 'friends.no_friends'
  | 'friends.start_chat'
  | 'friends.request_sent'
  | 'friends.request_send_error'
  | 'friends.request_accepted'
  | 'friends.request_accept_error'
  | 'friends.request_rejected'
  | 'friends.request_reject_error'
  | 'friends.friend_removed'
  | 'friends.friend_remove_error'
  | 'friends.user_blocked'
  | 'friends.user_block_error'
  | 'friends.chat_start_error'
  | 'friends.load_error'
  | 'friends.online'
  | 'friends.offline'
  | 'friends.options'
  | 'friends.search_results';

const Friends = () => {
  const { t } = useTranslation();
  const theme = useTheme() // Add theme for consistent styling
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [friends, setFriends] = useState<User[]>([])
  const [requests, setRequests] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuUserId, setMenuUserId] = useState<string | null>(null)
  const currentUser = auth.currentUser
  const unsubscribersRef = useRef<(() => void)[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus>({})
  const navigate = useNavigate()
  const database = getDatabase()
  
  // UI enhancement states
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')
  const [showAnimation, setShowAnimation] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  
  // Animation control
  useEffect(() => {
    // Show elements with animation after initial load
    if (!loading) {
      setTimeout(() => {
        setShowAnimation(true)
      }, 100)
    }
  }, [loading])

  // Load friends and friend requests
  useEffect(() => {
    if (!currentUser) {
      setFriends([])
      setRequests([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Reference to current user's document
    const userRef = doc(db, 'users', currentUser.uid)

    // Listen to changes in user document
    const unsubscribeUser = onSnapshot(userRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const friendsList = userData.friends || []
        const requestsList = userData.friendRequests || []
        
        if (friendsList.length > 0) {
          // Get detailed user information for each friend
          const friendsData = await getDocs(
            query(collection(db, 'users'), where('__name__', 'in', friendsList))
          )
          
          setFriends(friendsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
        } else {
          setFriends([])
        }
        
        if (requestsList.length > 0) {
          // Get detailed user information for each friend request
          const requestsData = await getDocs(
            query(collection(db, 'users'), where('__name__', 'in', requestsList))
          )
          
          setRequests(requestsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
        } else {
          setRequests([])
        }
        
        setLoading(false)
      } else {
        // Create user document if it doesn't exist
        await updateDoc(userRef, {
          friends: [],
          friendRequests: [],
          username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
        })
        
        setFriends([])
        setRequests([])
        setLoading(false)
      }
    }, (err) => {
      console.error('Error loading friends:', err)
      setError(t('friends.load_error' as TranslationKey))
      setLoading(false)
    })
    
    unsubscribersRef.current.push(unsubscribeUser)

    // Set up presence system for online status
    const connectedRef = ref(database, '.info/connected')
    
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Connect to presence system
        const userStatusRef = ref(database, `status/${currentUser.uid}`)
        const onDisconnectRef = ref(database, `status/${currentUser.uid}`)
        
        // Update status when online
        onDisconnect(onDisconnectRef).set({
          state: 'offline',
          last_changed: ServerValue.TIMESTAMP
        })
        
        set(userStatusRef, {
          state: 'online',
          last_changed: ServerValue.TIMESTAMP
        })
      }
    })
    
    return () => {
      // Clean up all listeners
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe())
      unsubscribersRef.current = []
    }
  }, [currentUser, database, t])

  // Listen for online status changes of friends
  useEffect(() => {
    if (friends.length === 0 || !database) return
    
    const statusRef = ref(database, 'status')
    
    // Set up listener for all friends' status
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const statuses: {[key: string]: boolean} = {}
      
      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key
        if (userId && friends.some(friend => friend.id === userId)) {
          const status = childSnapshot.val()
          statuses[userId] = status?.state === 'online'
        }
      })
      
      setOnlineUsers(statuses)
    })
    
    unsubscribersRef.current.push(unsubscribe)
    
    return () => {
      unsubscribe()
    }
  }, [friends, database])

  const handleSearch = async () => {
    if (!search.trim() || !currentUser) return
    
    setSearching(true)
    setSearchResults([])
    
    try {
      // Search users by username (case insensitive)
      const usersRef = collection(db, 'users')
      const q = query(
        usersRef, 
        where('username', '==', search.replace('@', '').toLowerCase())
      )
      const querySnapshot = await getDocs(q)
      
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid)
      
      setSearchResults(results as User[])
    } catch (error) {
      console.error('Error searching users:', error)
      setError(t('friends.load_error' as TranslationKey))
    }
    
    setSearching(false)
  }

  const handleSendRequest = async (userId: string) => {
    if (!currentUser) return
    
    setActionLoading(userId)
    
    try {
      // Add to the user's friendRequests array
      const targetUserRef = doc(db, 'users', userId)
      await updateDoc(targetUserRef, {
        friendRequests: arrayUnion(currentUser.uid)
      })
      
      setSuccessMessage(t('friends.request_sent' as TranslationKey))
      
      // Create a notification for the target user
      const notificationRef = collection(db, 'notifications')
      await addDoc(notificationRef, {
        type: 'friend_request',
        fromUser: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0],
          photoURL: currentUser.photoURL
        },
        toUserId: userId,
        createdAt: serverTimestamp(),
        read: false
      })
      
      // Clear search results
      setSearchResults([])
      setSearchTerm('')
      setSearch('')
    } catch (error) {
      console.error('Error sending friend request:', error)
      setError(t('friends.request_send_error' as TranslationKey))
    }
    
    setActionLoading('')
  }

  const handleAccept = async (userId: string) => {
    if (!currentUser) return
    
    setActionLoading(userId)
    
    try {
      // Add to both users' friends arrays
      const currentUserRef = doc(db, 'users', currentUser.uid)
      const targetUserRef = doc(db, 'users', userId)
      
      await updateDoc(currentUserRef, {
        friends: arrayUnion(userId),
        friendRequests: arrayRemove(userId)
      })
      
      await updateDoc(targetUserRef, {
        friends: arrayUnion(currentUser.uid)
      })
      
      // Create a notification for the target user
      const notificationRef = collection(db, 'notifications')
      await addDoc(notificationRef, {
        type: 'friend_accept',
        fromUser: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0],
          photoURL: currentUser.photoURL
        },
        toUserId: userId,
        createdAt: serverTimestamp(),
        read: false
      })
      
      setRequests(prev => prev.filter(request => request.id !== userId))
      setSuccessMessage(t('friends.request_accepted' as TranslationKey))
    } catch (error) {
      console.error('Error accepting friend request:', error)
      setError(t('friends.request_accept_error' as TranslationKey))
    }
    
    setActionLoading('')
  }

  const handleReject = async (userId: string) => {
    if (!currentUser) return
    
    setActionLoading(userId)
    
    try {
      // Remove from friendRequests array
      const currentUserRef = doc(db, 'users', currentUser.uid)
      
      await updateDoc(currentUserRef, {
        friendRequests: arrayRemove(userId)
      })
      
      setRequests(prev => prev.filter(request => request.id !== userId))
      setSuccessMessage(t('friends.request_rejected' as TranslationKey))
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      setError(t('friends.request_reject_error' as TranslationKey))
    }
    
    setActionLoading('')
  }

  const handleRemoveFriend = async (userId: string) => {
    if (!currentUser) return
    
    setActionLoading(userId)
    
    try {
      // Remove from both users' friends arrays
      const currentUserRef = doc(db, 'users', currentUser.uid)
      const targetUserRef = doc(db, 'users', userId)
      
      await updateDoc(currentUserRef, {
        friends: arrayRemove(userId)
      })
      
      await updateDoc(targetUserRef, {
        friends: arrayRemove(currentUser.uid)
      })
      
      setFriends(prev => prev.filter(friend => friend.id !== userId))
      setSuccessMessage(t('friends.friend_removed' as TranslationKey))
      handleMenuClose()
    } catch (error) {
      console.error('Error removing friend:', error)
      setError(t('friends.friend_remove_error' as TranslationKey))
    }
    
    setActionLoading('')
  }

  const handleBlock = async (userId: string) => {
    if (!currentUser) return
    
    setActionLoading(userId)
    
    try {
      // Remove from friends and add to blocked list
      const currentUserRef = doc(db, 'users', currentUser.uid)
      const targetUserRef = doc(db, 'users', userId)
      
      await updateDoc(currentUserRef, {
        friends: arrayRemove(userId),
        blocked: arrayUnion(userId)
      })
      
      // Also remove the current user from the target user's friends list
      await updateDoc(targetUserRef, {
        friends: arrayRemove(currentUser.uid)
      })
      
      setFriends(prev => prev.filter(friend => friend.id !== userId))
      setSuccessMessage(t('friends.user_blocked' as TranslationKey))
      handleMenuClose()
    } catch (error) {
      console.error('Error blocking user:', error)
      setError(t('friends.user_block_error' as TranslationKey))
    }
    
    setActionLoading('')
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setMenuAnchor(event.currentTarget)
    setMenuUserId(userId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuUserId(null)
  }

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return
    
    try {
      // Check if a chat already exists
      const chatsRef = collection(db, 'chats')
      const q = query(
        chatsRef,
        where('members', 'array-contains', currentUser.uid)
      )
      
      const querySnapshot = await getDocs(q)
      let chatId = null
      
      querySnapshot.forEach(doc => {
        const chatData = doc.data()
        if (chatData.members.includes(userId)) {
          chatId = doc.id
        }
      })
      
      // If no chat exists, create one
      if (!chatId) {
        const newChatRef = await addDoc(chatsRef, {
          members: [currentUser.uid, userId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: '',
          isBot: false
        })
        
        chatId = newChatRef.id
      }
      
      // Navigate to the chat
      navigate('/chat', { state: { chatId } })
      handleMenuClose()
    } catch (error) {
      console.error('Error starting chat:', error)
      setError(t('friends.chat_start_error' as TranslationKey))
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px - 24px)', // Navbar (64px) and footer (24px) offsets
        pt: '56px', // Reduced from 64px for a higher start position
        pb: '24px', // Footer offset
        bgcolor: 'background.default',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'flex-start', // Align content at the top
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          py: 1, // Further reduced top padding
          pt: 0.5, // Even smaller top padding
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px - 24px - 2px)', // Adjusted for new padding
          width: '100%',
          mt: 0.5, // Small margin top for a bit of breathing room
        }}
      >
        {/* Main content with animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${theme.palette.background.paper})`,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mx: 'auto', // Center horizontally
              width: '100%',
              maxWidth: '800px', // Set a max width for better symmetry
              mt: 0, // No margin top to start higher
              position: 'relative', // For positioning pseudo elements
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '25%',
                background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.background.paper, 0.95)})`,
                pointerEvents: 'none', // Don't block interactions
                borderRadius: '0 0 16px 16px', // Match the Paper's border radius
                zIndex: 0, // Behind content
              }
            }}
          >
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 }, // Reduced padding further
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center', // Center text elements
                flexShrink: 0, // Prevent header from shrinking
              }}
            >
              {/* Background decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  right: '-5%',
                  top: '20%',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
                  filter: 'blur(25px)',
                  zIndex: 0,
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  left: '10%',
                  bottom: '0%',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at center, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 70%)`,
                  filter: 'blur(20px)',
                  zIndex: 0,
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5, // Further reduced margin
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'inline-block', // Help with centering
                    fontSize: { xs: '1.8rem', sm: '2.125rem' }, // Slightly smaller on mobile
                  }}
                >
                  {t('friends.title' as TranslationKey)}
                </Typography>

                {/* Modern search input */}
                <Box sx={{ position: 'relative', mb: 1.5, maxWidth: '500px', mx: 'auto' }}>
                  <TextField
                    fullWidth
                    placeholder={t('friends.search_placeholder' as TranslationKey)}
                    value={searchTerm}
                    inputRef={searchInputRef}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value.replace('@', ''));
                      setSearch('@' + value.replace('@', ''));
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: searching ? (
                        <CircularProgress size={20} color="secondary" />
                      ) : (
                        <Box 
                          component="span" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            userSelect: 'none',
                          }}
                        >
                          @
                        </Box>
                      ),
                      sx: {
                        borderRadius: '12px',
                        padding: '4px 12px',
                        backdropFilter: 'blur(4px)',
                        backgroundColor: alpha(theme.palette.background.paper, 0.6),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        },
                        '&.Mui-focused': {
                          backgroundColor: alpha(theme.palette.background.paper, 1),
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                        },
                        height: '44px', // Reduced height
                      }
                    }}
                    sx={{
                      position: 'relative',
                      '& .MuiOutlinedInput-root': {
                        paddingRight: '12px'
                      }
                    }}
                    helperText={searching ? t('friends.searching' as TranslationKey) : t('friends.press_enter' as TranslationKey)}
                    FormHelperTextProps={{
                      sx: {
                        textAlign: 'center',
                        margin: '2px 0 0', // Reduced margin
                        fontSize: '0.75rem',
                        opacity: 0.7
                      }
                    }}
                  />
                </Box>
                
                {/* Tab buttons for friends and requests */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 2,
                    mb: 0.5, // Reduced margin
                    justifyContent: 'center', // Center the tabs
                    mx: 'auto', // Center the container
                  }}
                >
                  <Button
                    variant={activeTab === 'friends' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('friends')}
                    startIcon={<GroupIcon />}
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: activeTab === 'friends' 
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.7)})`
                        : 'transparent',
                      borderColor: activeTab === 'friends' ? 'transparent' : alpha(theme.palette.primary.main, 0.5),
                      color: activeTab === 'friends' ? '#fff' : 'text.primary',
                      '&:hover': {
                        backgroundColor: activeTab === 'friends' 
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
                          : alpha(theme.palette.primary.main, 0.1),
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('friends.my_friends' as TranslationKey)} {friends.length > 0 && `(${friends.length})`}
                  </Button>
                  
                  <Button
                    variant={activeTab === 'requests' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('requests')}
                    startIcon={<EmailIcon />}
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: activeTab === 'requests' 
                        ? `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${alpha(theme.palette.secondary.dark, 0.7)})`
                        : 'transparent',
                      borderColor: activeTab === 'requests' ? 'transparent' : alpha(theme.palette.secondary.main, 0.5),
                      color: activeTab === 'requests' ? '#fff' : 'text.primary',
                      '&:hover': {
                        backgroundColor: activeTab === 'requests' 
                          ? `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${alpha(theme.palette.secondary.dark, 0.8)})`
                          : alpha(theme.palette.secondary.main, 0.1),
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('friends.requests' as TranslationKey)} 
                    {requests.length > 0 && (
                      <Badge 
                        color="error" 
                        badgeContent={requests.length} 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
            
            {/* Content area with scrolling */}
            <Box 
              sx={{ 
                flex: 1, 
                overflow: 'auto', 
                px: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.divider, 0.3),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: alpha(theme.palette.divider, 0.5),
                },
              }}
            >
              {/* Search Results Section */}
              {searchResults.length > 0 && (
                <Fade in={showAnimation} timeout={500}>
                  <Box sx={{ py: 3, width: '100%', maxWidth: '700px' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'center', // Center the title
                      }}
                    >
                      <SearchIcon fontSize="small" color="primary" />
                      {t('friends.search_results' as TranslationKey)}
                    </Typography>
                    
                    <Box
                      sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
                        backgroundColor: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        position: 'relative', // For positioning gradient
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '20%',
                          background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.background.paper, 0.2)})`,
                          pointerEvents: 'none',
                          zIndex: 1
                        }
                      }}
                    >
                      <List disablePadding>
                        {searchResults.map((user, index) => (
                          <motion.div
                            key={user.id}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={listItemVariants}
                          >
                            <ListItem
                              sx={{
                                py: 1.5,
                                px: 2,
                                borderBottom: index < searchResults.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  src={user.photoURL}
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)'
                                    }
                                  }}
                                  onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                  {user.username?.[0]?.toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              
                              <ListItemText
                                primary={
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight={600}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': {
                                        color: 'primary.main'
                                      },
                                      transition: 'color 0.2s ease'
                                    }}
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                  >
                                    {user.username}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                }
                              />
                              
                              <ListItemSecondaryAction>
                                <Tooltip title={t('friends.add_friend' as TranslationKey)}>
                                  <IconButton
                                    onClick={() => handleSendRequest(user.id)}
                                    disabled={actionLoading === user.id}
                                    color="primary"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                      },
                                    }}
                                  >
                                    {actionLoading === user.id ? (
                                      <CircularProgress size={24} color="inherit" />
                                    ) : (
                                      <PersonAddIcon />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </motion.div>
                        ))}
                      </List>
                    </Box>
                    <Divider sx={{ my: 3, opacity: 0.6 }} />
                  </Box>
                </Fade>
              )}

              {/* Friend Requests Section - visible when activeTab is 'requests' */}
              <Fade in={activeTab === 'requests'} timeout={500}>
                <Box 
                  sx={{ 
                    py: 2,
                    display: activeTab === 'requests' ? 'block' : 'none',
                    width: '100%',
                    maxWidth: '700px',
                  }}
                >
                  <motion.div
                    initial="hidden"
                    animate={showAnimation ? "visible" : "hidden"}
                    variants={sectionVariants}
                  >
                    {requests.length > 0 ? (
                      <Box
                        sx={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          mb: 2,
                          position: 'relative', // For positioning gradient
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '20%',
                            background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.background.paper, 0.2)})`,
                            pointerEvents: 'none',
                            zIndex: 1
                          }
                        }}
                      >
                        <List disablePadding>
                          {requests.map((user, index) => (
                            <motion.div
                              key={user.id}
                              custom={index}
                              initial="hidden"
                              animate="visible"
                              variants={listItemVariants}
                            >
                              <ListItem
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  borderBottom: index < requests.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    src={user.photoURL}
                                    sx={{
                                      width: 42,
                                      height: 42,
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                      border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                                      cursor: 'pointer',
                                      transition: 'transform 0.2s ease',
                                      '&:hover': {
                                        transform: 'scale(1.05)'
                                      }
                                    }}
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                  >
                                    {user.username?.[0]?.toUpperCase()}
                                  </Avatar>
                                </ListItemAvatar>
                                
                                <ListItemText
                                  primary={
                                    <Typography 
                                      variant="subtitle1" 
                                      fontWeight={600}
                                      sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': {
                                          color: 'primary.main'
                                        },
                                        transition: 'color 0.2s ease'
                                      }}
                                      onClick={() => navigate(`/profile/${user.id}`)}
                                    >
                                      {user.username}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" color="text.secondary">
                                      {t('friends.wants_to_be_friends' as TranslationKey)}
                                    </Typography>
                                  }
                                />
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title={t('friends.accept' as TranslationKey)}>
                                    <IconButton
                                      onClick={() => handleAccept(user.id)}
                                      disabled={actionLoading === user.id}
                                      color="primary"
                                      sx={{
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        color: theme.palette.success.main,
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.success.main, 0.2),
                                        },
                                      }}
                                    >
                                      {actionLoading === user.id ? (
                                        <CircularProgress size={24} color="inherit" />
                                      ) : (
                                        <CheckIcon />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title={t('friends.reject' as TranslationKey)}>
                                    <IconButton
                                      onClick={() => handleReject(user.id)}
                                      disabled={actionLoading === user.id}
                                      color="error"
                                      sx={{
                                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.error.main, 0.2),
                                        },
                                      }}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </ListItem>
                            </motion.div>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          borderRadius: '16px',
                          p: 4,
                          textAlign: 'center',
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '30%',
                            background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.background.paper, 0.4)})`,
                            borderRadius: '0 0 16px 16px',
                            pointerEvents: 'none',
                          }
                        }}
                      >
                        <EmailIcon
                          sx={{
                            fontSize: 48,
                            color: alpha(theme.palette.text.secondary, 0.3),
                            mb: 2,
                          }}
                        />
                        <Typography color="text.secondary">
                          {t('friends.no_requests' as TranslationKey)}
                        </Typography>
                      </Box>
                    )}
                  </motion.div>
                </Box>
              </Fade>

              {/* Friends List Section - visible when activeTab is 'friends' */}
              <Fade in={activeTab === 'friends'} timeout={500}>
                <Box 
                  sx={{ 
                    py: 2,
                    display: activeTab === 'friends' ? 'block' : 'none',
                    width: '100%',
                    maxWidth: '700px',
                  }}
                >
                  <motion.div
                    initial="hidden"
                    animate={showAnimation ? "visible" : "hidden"}
                    variants={sectionVariants}
                  >
                    {friends.length > 0 ? (
                      <Box
                        sx={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          position: 'relative', // For positioning gradient
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '20%',
                            background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.background.paper, 0.2)})`,
                            pointerEvents: 'none',
                            zIndex: 1
                          }
                        }}
                      >
                        <List disablePadding>
                          {friends.map((friend, index) => (
                            <motion.div
                              key={friend.id}
                              custom={index}
                              initial="hidden"
                              animate="visible"
                              variants={listItemVariants}
                            >
                              <ListItem
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  borderBottom: index < friends.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <ListItemAvatar>
                                  <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          bgcolor: onlineUsers[friend.id] ? theme.palette.success.main : alpha(theme.palette.text.disabled, 0.5),
                                          border: `2px solid ${theme.palette.background.paper}`,
                                        }}
                                      />
                                    }
                                  >
                                    <Avatar
                                      src={friend.photoURL}
                                      sx={{
                                        width: 42,
                                        height: 42,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                          transform: 'scale(1.05)'
                                        }
                                      }}
                                      onClick={() => navigate(`/profile/${friend.id}`)}
                                    >
                                      {friend.username?.[0]?.toUpperCase()}
                                    </Avatar>
                                  </Badge>
                                </ListItemAvatar>
                                
                                <ListItemText
                                  primary={
                                    <Typography 
                                      variant="subtitle1" 
                                      fontWeight={600}
                                      sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': {
                                          color: 'primary.main'
                                        },
                                        transition: 'color 0.2s ease'
                                      }}
                                      onClick={() => navigate(`/profile/${friend.id}`)}
                                    >
                                      {friend.username}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Typography
                                        variant="body2"
                                        color={onlineUsers[friend.id] ? 'success.main' : 'text.secondary'}
                                        sx={{ 
                                          fontWeight: onlineUsers[friend.id] ? 500 : 400,
                                        }}
                                      >
                                        {onlineUsers[friend.id] ? t('friends.online' as TranslationKey) : t('friends.offline' as TranslationKey)}
                                      </Typography>
                                    </Box>
                                  }
                                />
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title={t('friends.start_chat' as TranslationKey)}>
                                    <IconButton
                                      onClick={() => handleStartChat(friend.id)}
                                      sx={{
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                        },
                                      }}
                                    >
                                      <ChatIcon />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title={t('friends.options' as TranslationKey)}>
                                    <IconButton
                                      onClick={(e) => handleMenuOpen(e, friend.id)}
                                      sx={{
                                        backgroundColor: alpha(theme.palette.text.secondary, 0.05),
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                                        },
                                      }}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </ListItem>
                            </motion.div>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          borderRadius: '16px',
                          p: 4,
                          textAlign: 'center',
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '30%',
                            background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.background.paper, 0.4)})`,
                            borderRadius: '0 0 16px 16px',
                            pointerEvents: 'none',
                          }
                        }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: 48,
                            color: alpha(theme.palette.text.secondary, 0.3),
                            mb: 2,
                          }}
                        />
                        <Typography color="text.secondary">
                          {t('friends.no_friends' as TranslationKey)}
                        </Typography>
                      </Box>
                    )}
                  </motion.div>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </motion.div>

        {/* Friend options menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mt: 1,
              padding: '4px 0'
            }
          }}
        >
          <MenuItem onClick={() => menuUserId && handleStartChat(menuUserId)}>
            <ListItemIcon>
              <ChatIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('friends.start_chat' as TranslationKey)} />
          </MenuItem>
          <MenuItem onClick={() => menuUserId && handleRemoveFriend(menuUserId)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('friends.remove_friend' as TranslationKey)} />
          </MenuItem>
          <MenuItem onClick={() => menuUserId && handleBlock(menuUserId)}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary={t('friends.block_user' as TranslationKey)} />
          </MenuItem>
        </Menu>

        {/* Error and success messages */}
        <Snackbar 
          open={Boolean(error)} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Alert severity="error" onClose={() => setError('')}
            sx={{ borderRadius: '10px' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}
            sx={{ borderRadius: '10px' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Friends; 