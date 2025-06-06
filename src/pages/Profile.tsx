import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useState, useEffect, SyntheticEvent } from 'react';
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FeedIcon from '@mui/icons-material/RssFeed';
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
}

interface PostData {
  id: string;
  location: {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    images: string[];
    tags: string[];
  };
  user: {
    uid: string;
    displayName: string;
    username: string;
    photoURL: string;
  };
  createdAt: any;
  likes: string[];
  comments: Array<{
    id: string;
    text: string;
    user: {
      uid: string;
      displayName: string;
      photoURL: string;
    };
    createdAt: any;
  }>;
  isPublic: boolean;
  shareNote?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [tabValue, setTabValue] = useState(0);
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
        
        // Fetch user statistics
        const locationsQuery = query(
          collection(db, 'locations'),
          where('createdBy.uid', '==', userId)
        );
        
        const postsQuery = query(
          collection(db, 'posts'),
          where('user.uid', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const [locationsSnapshot, postsSnapshot] = await Promise.all([
          getDocs(locationsQuery),
          getDocs(postsQuery)
        ]);
        
        // Calculate statistics
        const locationsData = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const postsData = postsSnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id,
            ...data,
            likes: data.likes || []
          };
        });
        
        let totalLikes = 0;
        for (const post of postsData) {
          if (post.likes && Array.isArray(post.likes)) {
            totalLikes += post.likes.length;
          }
        }
        
        setLocations(locationsData as any as LocationData[]);
        setPosts(postsData as any as PostData[]);
        
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
  
  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label={t('profile.locations')} {...a11yProps(0)} />
          <Tab label={t('profile.posts')} {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {locations.length > 0 ? (
          <Grid container spacing={2}>
            {locations.map((location) => (
              <Grid item xs={12} sm={6} md={4} key={location.id}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={location.photos?.[0] || 'https://via.placeholder.com/400x160?text=No+Image'}
                    alt={location.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/location/${location.id}`)}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      {location.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {location.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<MapIcon />}
                      onClick={() => navigate(`/location/${location.id}`)}
                    >
                      {t('profile.view_details')}
                    </Button>
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
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {posts.length > 0 ? (
          <Box>
            {posts.map((post) => (
              <Card key={post.id} sx={{ 
                mb: 3, 
                overflow: 'visible',
                backgroundColor: 'rgba(35, 39, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}>
                <CardHeader
                  avatar={
                    <Avatar 
                      src={post.user.photoURL} 
                      alt={post.user.displayName}
                      sx={{ width: 44, height: 44 }}
                    />
                  }
                  title={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {post.user.displayName}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        @{post.user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • {post.createdAt ? format(post.createdAt.toDate(), 'MMM d, yyyy') : ''}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    p: 2.5,
                    pb: 2,
                    '& .MuiCardHeader-content': {
                      overflow: 'hidden'
                    }
                  }}
                />
                
                <CardMedia
                  component="img"
                  height="360"
                  image={post.location.images?.[0] || 'https://via.placeholder.com/400x360?text=No+Image'}
                  alt={post.location.title}
                  sx={{ 
                    cursor: 'pointer',
                    objectFit: 'cover',
                  }}
                  onClick={() => navigate(`/location/${post.location.id}`)}
                />
                
                <CardContent sx={{ p: 2.5, pt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <PlaceIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {post.location.title}
                    </Typography>
                  </Box>
                  
                  {post.shareNote && (
                    <Typography 
                      variant="body1" 
                      paragraph 
                      sx={{ 
                        mb: 2,
                        color: 'text.primary',
                        lineHeight: 1.6
                      }}
                    >
                      {post.shareNote}
                    </Typography>
                  )}
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      mb: 2,
                      lineHeight: 1.6
                    }}
                  >
                    {post.location.description?.length > 120 
                      ? `${post.location.description.substring(0, 120)}...` 
                      : post.location.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
                    {post.location.tags?.map((tag: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{
                          borderRadius: '16px',
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                  <IconButton 
                    disabled
                    sx={{
                      '&.Mui-disabled': {
                        color: post.likes?.includes(currentUser?.uid || '') ? 'error.main' : 'action.disabled'
                      }
                    }}
                  >
                    {post.likes?.includes(currentUser?.uid || '') ? (
                      <FavoriteIcon color="error" />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {post.likes?.length || 0}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapIcon />}
                    sx={{ 
                      ml: 'auto',
                      borderRadius: '20px',
                      px: 2
                    }}
                    onClick={() => navigate(`/location/${post.location.id}`)}
                  >
                    {t('profile.view_on_map')}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FeedIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              {t('profile.no_posts')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userId === currentUser?.uid
                ? t('profile.share_locations')
                : t('profile.no_posts_other_user')}
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
      </TabPanel>
    </Box>
  );
};

export default Profile; 