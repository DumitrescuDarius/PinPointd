import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  limit,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlaceIcon from '@mui/icons-material/Place';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { NavbarContext } from './Navbar';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'pinpoint' | 'message';
  fromUser: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
  toUserId: string;
  postId?: string;
  locationId?: string;
  text?: string;
  createdAt: Timestamp;
  read: boolean;
}

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const open = Boolean(anchorEl);
  const { notifyDrawerOpened, currentlyOpenDrawer } = useContext(NavbarContext);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query for notifications for the current user
    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: Notification[] = [];
      let newUnreadCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Notification, 'id'>;
        const notification = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt as Timestamp
        };

        notificationData.push(notification);

        if (!notification.read) {
          newUnreadCount++;
        }
      });

      setNotifications(notificationData);
      setUnreadCount(newUnreadCount);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Close notifications popover when account drawer opens
  useEffect(() => {
    if (currentlyOpenDrawer === 'account' && open) {
      setAnchorEl(null);
    }
  }, [currentlyOpenDrawer, open]);

  const handleNotificationsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (open) {
      setAnchorEl(null);
      return;
    }
    
    setAnchorEl(event.currentTarget);
    notifyDrawerOpened('notifications');

    // Mark all as read when opening
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.read);

      // Update all unread notifications in batch
      await Promise.all(
        unreadNotifications.map(notification => 
          updateDoc(doc(db, 'notifications', notification.id), {
            read: true
          })
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.read) {
      try {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.locationId) {
          navigate(`/location/${notification.locationId}`);
        } else {
          // If no specific location ID, navigate to map
          navigate('/map');
        }
        break;
      case 'friend_request':
      case 'friend_accept':
        navigate('/chat');
        break;
      case 'pinpoint':
        if (notification.locationId) {
          navigate(`/location/${notification.locationId}`);
        }
        break;
      default:
        break;
    }

    handleClose();
  };

  const formatNotificationDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return t('Yesterday' as any);
    } else {
      return format(date, 'MMM d');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <FavoriteIcon fontSize="small" color="error" />;
      case 'comment':
        return <CommentIcon fontSize="small" color="primary" />;
      case 'friend_request':
      case 'friend_accept':
        return <PersonAddIcon fontSize="small" color="success" />;
      case 'pinpoint':
        return <PlaceIcon fontSize="small" color="info" />;
      case 'message':
        return <ChatIcon fontSize="small" color="primary" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const { type, fromUser, text } = notification;
    
    switch (type) {
      case 'like':
        return t('{{name}} liked your location', { name: fromUser.displayName } as any);
      case 'comment':
        return t('{{name}} commented: {{text}}', { 
          name: fromUser.displayName,
          text: text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : ''
        } as any);
      case 'friend_request':
        return t('{{name}} sent you a friend request', { name: fromUser.displayName } as any);
      case 'friend_accept':
        return t('{{name}} accepted your friend request', { name: fromUser.displayName } as any);
      case 'pinpoint':
        return t('{{name}} shared a new location with you', { name: fromUser.displayName } as any);
      case 'message':
        return t('{{name}} sent you a message: {{text}}', {
          name: fromUser.displayName,
          text: text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : ''
        } as any);
      default:
        return t('New notification' as any);
    }
  };

  return (
    <>
      <Tooltip title={t('Notifications' as any)}>
        <IconButton
          onClick={handleNotificationsClick}
          sx={{ color: '#fff' }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
            maxHeight: '60vh',
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Typography variant="h6" component="div">
            {t('Notifications' as any)}
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {t('No notifications yet' as any)}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                alignItems="flex-start"
                sx={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  },
                  ...(notification.read ? {} : { backgroundColor: 'rgba(144, 202, 249, 0.1)' })
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemAvatar>
                  <Avatar src={notification.fromUser.photoURL} alt={notification.fromUser.displayName} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" component="span">
                        {getNotificationText(notification)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatNotificationDate(notification.createdAt)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <Box sx={{ p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'center' }}>
            <Button onClick={markAllAsRead} color="primary">
              {t('Mark all as read' as any)}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default Notifications; 