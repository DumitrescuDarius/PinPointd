import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
  orderBy,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';

// Define interfaces for data types
interface UserData {
  displayName: string;
  username: string;
  photoURL: string;
  email: string;
  bio?: string;
  createdAt?: any;
  friends?: string[];
  memberSince?: Date;
  id?: string;
}

interface LocationData {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  photos: string[];
  tags: string[];
  createdBy: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
  createdAt: any;
  likes?: string[];
  views?: number;
  sponsoredUntil?: any;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [postLocations, setPostLocations] = useState<any[]>([]);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'requested' | 'friends'>('none');
  const [friendRequestLoading, setFriendRequestLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalPins: 0,
    totalLikes: 0,
    memberSince: null as Date | null,
    friends: 0
  });
  
  // Load user profile data
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        setUser({
          ...userData,
          id: userDoc.id,
          memberSince: userData.createdAt ? userData.createdAt.toDate() : new Date(),
        } as UserData);
        
        // Get friend status if current user is viewing someone else's profile
        if (currentUser && userId !== currentUser.uid) {
          // Check if they are friends
          if (userData.friends && userData.friends.includes(currentUser.uid)) {
            setFriendStatus('friends');
          } else {
            // Check for pending friend requests
            const sentRequestQuery = query(
              collection(db, 'friendRequests'),
              where('from', '==', currentUser.uid),
              where('to', '==', userId),
              where('status', '==', 'pending')
            );
            
            const receivedRequestQuery = query(
              collection(db, 'friendRequests'),
              where('from', '==', userId),
              where('to', '==', currentUser.uid),
              where('status', '==', 'pending')
            );
            
            const [sentResults, receivedResults] = await Promise.all([
              getDocs(sentRequestQuery),
              getDocs(receivedRequestQuery)
            ]);
            
            if (!sentResults.empty) {
              setFriendStatus('pending');
            } else if (!receivedResults.empty) {
              setFriendStatus('requested');
            }
          }
        }
        
        // Fetch posts from 'posts' collection
        const postsQuery = query(
          collection(db, 'posts'),
          where('user.uid', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPostLocations(postsData);
        
        // Fetch user statistics from locations collection (for stats only)
        const locationsQuery = query(
          collection(db, 'locations'),
          where('createdBy.uid', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const locationsSnapshot = await getDocs(locationsQuery);
        const locationsData = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LocationData[];
        
        let totalLikes = 0;
        for (const location of locationsData) {
          if (location.likes && Array.isArray(location.likes)) {
            totalLikes += location.likes.length;
          }
        }
        
        setStats({
          totalPins: locationsData.length,
          totalLikes,
          memberSince: userData.createdAt ? userData.createdAt.toDate() : new Date(),
          friends: (userData.friends || []).length
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [userId, currentUser]);
  
  const handleFriendRequest = async () => {
    if (!currentUser || !userId || friendRequestLoading) return;
    
    try {
      setFriendRequestLoading(true);
      
      // Handle the action based on current status
      if (friendStatus === 'none') {
        // Send friend request
        await addDoc(collection(db, 'friendRequests'), {
          from: currentUser.uid,
          to: userId,
          status: 'pending',
          createdAt: new Date()
        });
        
        // Create notification
        await addDoc(collection(db, 'notifications'), {
          type: 'friend_request',
          fromUser: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          },
          toUserId: userId,
          createdAt: new Date(),
          read: false
        });
        
        setFriendStatus('pending');
      } else if (friendStatus === 'requested') {
        // Accept friend request
        // Get the request
        const requestQuery = query(
          collection(db, 'friendRequests'),
          where('from', '==', userId),
          where('to', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        
        const requestSnapshot = await getDocs(requestQuery);
        
        if (!requestSnapshot.empty) {
          const requestDoc = requestSnapshot.docs[0];
          
          // Update the request status
          await updateDoc(doc(db, 'friendRequests', requestDoc.id), {
            status: 'accepted'
          });
          
          // Add both users to each other's friends lists
          await updateDoc(doc(db, 'users', currentUser.uid), {
            friends: arrayUnion(userId)
          });
          
          await updateDoc(doc(db, 'users', userId), {
            friends: arrayUnion(currentUser.uid)
          });
          
          // Create notification
          await addDoc(collection(db, 'notifications'), {
            type: 'friend_accept',
            fromUser: {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL
            },
            toUserId: userId,
            createdAt: new Date(),
            read: false
          });
          
          setFriendStatus('friends');
        }
      } else if (friendStatus === 'friends') {
        // Remove friend
        await updateDoc(doc(db, 'users', currentUser.uid), {
          friends: arrayRemove(userId)
        });
        
        await updateDoc(doc(db, 'users', userId), {
          friends: arrayRemove(currentUser.uid)
        });
        
        setFriendStatus('none');
      } else if (friendStatus === 'pending') {
        // Cancel friend request
        const requestQuery = query(
          collection(db, 'friendRequests'),
          where('from', '==', currentUser.uid),
          where('to', '==', userId),
          where('status', '==', 'pending')
        );
        
        const requestSnapshot = await getDocs(requestQuery);
        
        if (!requestSnapshot.empty) {
          const requestDoc = requestSnapshot.docs[0];
          await deleteDoc(doc(db, 'friendRequests', requestDoc.id));
        }
        
        setFriendStatus('none');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setFriendRequestLoading(false);
    }
  };
  
  const getFriendButtonText = (): string => {
    switch (friendStatus) {
      case 'none':
        return t('profile.add_friend');
      case 'pending':
        return t('profile.cancel_request');
      case 'requested':
        return t('profile.accept_request');
      case 'friends':
        return t('profile.remove_friend');
      default:
        return '';
    }
  };
  
  const getFriendButtonIcon = () => {
    switch (friendStatus) {
      case 'none':
        return <PersonAddIcon />;
      case 'pending':
        return <CloseIcon />;
      case 'requested':
        return <CheckIcon />;
      case 'friends':
        return <PersonRemoveIcon />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">
          {t('profile.user_not_found')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/map')}
          sx={{ mt: 2 }}
        >
          {t('profile.go_to_map')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '1200px', mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 3 }}>
          <Avatar
            src={user.photoURL}
            alt={user.displayName}
            sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'primary.main' }}
          />
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                {user.displayName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>
                @{user.username}
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              {user.bio || t('profile.no_bio')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, my: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{stats.totalPins}</Typography>
                <Typography variant="body2" color="text.secondary">{t('profile.pins')}</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{stats.friends}</Typography>
                <Typography variant="body2" color="text.secondary">{t('profile.friends')}</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{stats.totalLikes}</Typography>
                <Typography variant="body2" color="text.secondary">{t('profile.likes')}</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                  {stats.memberSince ? format(stats.memberSince, 'MMM yyyy') : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('profile.member_since')}</Typography>
              </Box>
            </Box>
          </Box>
          
          {currentUser && userId !== currentUser.uid && (
            <Box sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
              <Button
                variant="contained"
                color={friendStatus === 'friends' ? 'error' : 'primary'}
                onClick={handleFriendRequest}
                disabled={friendRequestLoading}
                startIcon={getFriendButtonIcon()}
                fullWidth
              >
                {friendRequestLoading ? <CircularProgress size={24} /> : <span>{getFriendButtonText()}</span>}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        {postLocations.length > 0 ? (
          <Grid container spacing={2}>
            {postLocations.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={post.location?.images?.[0] || post.location?.images || post.location?.photos?.[0] || 'https://via.placeholder.com/400x160?text=No+Image'}
                    alt={post.location?.title || post.location?.name || 'Location'}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => post.location?.id && navigate(`/map?location=${post.location.id}`)}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      {post.location?.title || post.location?.name || 'Untitled'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {post.location?.description || ''}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {post.location?.id ? (
                      <Button 
                        size="small" 
                        startIcon={<MapIcon />}
                        onClick={() => navigate(`/map?location=${post.location.id}`)}
                      >
                        {t('profile.view_on_map')}
                      </Button>
                    ) : null}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PlaceIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              {t('profile.no_locations')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userId === currentUser?.uid
                ? t('profile.start_adding_pins')
                : t('profile.no_locations_other_user')}
            </Typography>
            {userId === currentUser?.uid && (
              <Button 
                variant="contained" 
                startIcon={<MapIcon />}
                onClick={() => navigate('/map')}
                sx={{ mt: 2 }}
              >
                {t('profile.go_to_map')}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Profile; 