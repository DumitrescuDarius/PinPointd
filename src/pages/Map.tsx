import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Rating, 
  Alert, 
  ToggleButton, 
  ToggleButtonGroup,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  IconButton,
  Drawer,
  Divider,
  Chip,
  CircularProgress,
  Modal,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AutocompleteRenderInputParams,
  Tooltip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Fade,
  FormControlLabel,
  Switch,
  Backdrop,
  RadioGroup,
  Radio,
  Grid,
  InputAdornment,
  Card,
  Skeleton,
  Popover,
  Fab
} from '@mui/material'

// Import all icons from @mui/icons-material
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SatelliteIcon from '@mui/icons-material/Satellite'
import TerrainIcon from '@mui/icons-material/Terrain'
import MapIcon from '@mui/icons-material/Map'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import RoomIcon from '@mui/icons-material/Room'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DirectionsIcon from '@mui/icons-material/Directions'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StraightenIcon from '@mui/icons-material/Straighten'
import CropIcon from '@mui/icons-material/Crop'
import ReplyIcon from '@mui/icons-material/Reply'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import PinDropIcon from '@mui/icons-material/PinDrop'
import TagIcon from '@mui/icons-material/Tag'
import ShareIcon from '@mui/icons-material/Share'
import DescriptionIcon from '@mui/icons-material/Description'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CommentIcon from '@mui/icons-material/Comment'
import SendIcon from '@mui/icons-material/Send'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import WarningIcon from '@mui/icons-material/Warning'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import VideocamIcon from '@mui/icons-material/Videocam'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ClearIcon from '@mui/icons-material/Clear'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ExploreIcon from '@mui/icons-material/Explore'
import VisibilityIcon from '@mui/icons-material/Visibility'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import NavigationIcon from '@mui/icons-material/Navigation'
import ChatIcon from '@mui/icons-material/Chat'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import RateReviewIcon from '@mui/icons-material/RateReview'
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CollectionsIcon from '@mui/icons-material/Collections';

// Other imports
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { db } from '../config/firebase'
import { addDoc, collection, getDocs, deleteDoc, doc, onSnapshot, getDoc, writeBatch, serverTimestamp, updateDoc, arrayRemove, arrayUnion, Timestamp, query, where, orderBy, increment } from 'firebase/firestore'
import { uploadImage } from '../config/cloudinary'
import { keyframes } from '@mui/system'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import debounce from 'lodash/debounce'
import Footer from '../components/Footer'
import MuiAlert from '@mui/material/Alert'
import type { LeafletMouseEvent, Map as LeafletMap } from 'leaflet'
import SearchBar from '../components/SearchBar'
import '../styles/globalStyles.css'
import { auth } from '../config/firebase'

// Set up default icon for Leaflet with adjusted popup anchor
const defaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -28], // Adjusted for better popup visibility above the pin
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  place_id?: string;
  osm_id?: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  tags: string[];
  photos: string[];
  category?: string;
  createdBy: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
  createdAt: Date;
  likes: string[];
  views: number; // Add views field
  sponsoredUntil?: Date; // Add sponsored expiration date
}

type SearchResultType = Location | GeocodingResult;

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

interface MapPageProps {
  darkMode: boolean;
}

const locations: Location[] = [];

const DEFAULT_CENTER: [number, number] = [20, 0]
const DEFAULT_ZOOM = 2

// Add these constants at the top with other constants
const MAX_BOUNDS: L.LatLngBoundsExpression = [
  [-90, -180], // Southwest coordinates
  [90, 180]    // Northeast coordinates
];

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;

// Add these constants at the top of the file, after imports
const GEO_OPTIONS = {
  enableHighAccuracy: true, // Enable high accuracy mode
  maximumAge: 15000, // Cache position for 15 seconds (reduced from 30s)
  timeout: 15000 // 15 second timeout (increased from 10s)
};

const GEO_ERROR_COOLDOWN = 120000; // Show error message once per 2 minutes maximum (increased from 1 minute)

const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SEARCH_DEBOUNCE_DELAY = 300; // 300ms

interface CachedResult {
  timestamp: number;
  results: GeocodingResult[];
}

// Add new styles for modern look with bottom-to-top layout
const modernStyles = {
  mapContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
  },
  searchContainer: {
    position: 'absolute',
    bottom: {
      xs: '40%',
      sm: '50%',
      md: '60%'
    },
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1100,
    width: {
      xs: '90vw',
      sm: 'calc(100% - 40px)',
      md: 500
    },
    maxWidth: 500,
    backgroundColor: 'rgba(30, 32, 38, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: {
      xs: '8px',
      sm: '12px'
    },
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    p: { xs: 1, sm: 2 },
    fontSize: { xs: '0.95rem', sm: '1rem' },
  },
  searchInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'transparent',
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      '& .MuiInputBase-input': {
        color: '#fff',
        '&::placeholder': {
          color: 'rgba(255, 255, 255, 0.6)',
          opacity: 1,
        },
      },
    },
  },
  suggestionItem: {
    padding: '12px 16px',
    color: '#fff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  mapControls: {
    position: 'fixed',
    right: {
      xs: 12,
      sm: 16,
      md: 20
    },
    top: {
      xs: 70,
      sm: 80,
      md: 100
    },
    zIndex: 1100,
    display: 'flex',
    flexDirection: 'column',
    gap: {
      xs: 0.5,
      sm: 1
    },
  },
  zoomControls: {
    position: 'fixed',
    right: {
      xs: 12,
      sm: 16,
      md: 20
    },
    bottom: {
      xs: 70,
      sm: 80,
      md: 100
    },
    zIndex: 1100,
    display: 'flex',
    flexDirection: 'column',
    gap: {
      xs: 0.5,
      sm: 1
    },
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    width: {
      xs: 32, // smaller on mobile
      sm: 40,
      md: 48
    },
    height: {
      xs: 32, // smaller on mobile
      sm: 40,
      md: 48
    },
    minHeight: 'unset',
    fontSize: { xs: '1.1rem', sm: '1.3rem' },
  },
  locationCard: {
    position: 'fixed',
    top: { xs: 'auto', sm: '50%' },
    bottom: { xs: 12, sm: 'auto' },
    left: { xs: 12, sm: 'auto' },
    right: { xs: 12, sm: 80 }, // Increased right margin to make space for controls
    transform: { xs: 'none', sm: 'translateY(-50%)' },
    backgroundColor: 'rgba(30, 32, 38, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    width: { xs: 'auto', sm: '500px' },
    maxWidth: { xs: 'calc(100vw - 24px)', sm: '500px' },
    maxHeight: { xs: 'auto', sm: 'calc(100vh - 24px)' },
    overflow: 'hidden',
    zIndex: 900,
  },
  distancePopup: {
    position: 'fixed',
    bottom: {
      xs: 80,
      sm: 100,
      md: 120
    },
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    backgroundColor: 'rgba(30, 32, 38, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: {
      xs: '8px',
      sm: '12px'
    },
    padding: {
      xs: '12px 16px',
      sm: '16px 24px'
    },
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 1,
      sm: 2
    },
    width: {
      xs: 'calc(100vw - 24px)',
      sm: 'auto'
    },
    minWidth: {
      xs: 'unset',
      sm: 300
    },
    maxWidth: {
      xs: 'calc(100vw - 24px)',
      sm: 400
    },
  },
  '@keyframes slideDown': {
    from: {
      transform: 'translate(-50%, -20px)',
      opacity: 0,
    },
    to: {
      transform: 'translate(-50%, 0)',
      opacity: 1,
    },
  },
  floatingPin: {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 1000,
    transform: 'translate(-50%, -100%)',
    transition: 'transform 0.1s ease-out',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  // Add styles for alerts and popups
  alerts: {
    position: 'fixed',
    bottom: {
      xs: 60,
      sm: 80,
      md: 100
    },
    left: {
      xs: 12,
      sm: 16,
      md: 24
    },
    zIndex: 2000,
    maxWidth: {
      xs: 'calc(100vw - 24px)',
      sm: 400
    },
  },
  snackbar: {
    zIndex: 2000,
    bottom: {
      xs: '60px !important',
      sm: '80px !important'
    },
    '& .MuiAlert-root': {
      width: {
        xs: 'calc(100vw - 24px)',
        sm: '400px'
      },
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      color: '#fff',
      fontSize: {
        xs: '0.9rem',
        sm: '1.1rem'
      },
      fontWeight: 500,
      letterSpacing: '0.3px',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      '& .MuiAlert-icon': {
        color: '#fff',
        fontSize: {
          xs: '1.2rem',
          sm: '1.5rem'
        }
      },
      '& .MuiAlert-message': {
        padding: {
          xs: '6px 0',
          sm: '8px 0'
        }
      }
    }
  },
  locationDetailsCard: {
    position: 'fixed',
    right: 20,
    top: 100,
    zIndex: 1200,
    width: 500,
    maxWidth: { xs: 'calc(100vw - 40px)', sm: 500 },
    maxHeight: 'calc(100vh - 150px)',
    overflow: 'auto',
    borderRadius: 2,
    boxShadow: 3
  },
  dialogOverlay: {
    zIndex: 1200
  },
  tagSearchContainer: {
    position: 'absolute',
    top: {
      xs: 48,
      sm: 10,
      md: 16
    },
    left: {
      xs: 2,
      sm: 10,
      md: 16
    },
    zIndex: 1100,
    width: {
      xs: '90vw',
      sm: 260,
      md: 320
    },
    maxHeight: {
      xs: 'calc(100vh - 80px)',
      sm: 'unset',
      md: 'unset'
    },
    overflowY: {
      xs: 'auto',
      sm: 'unset',
      md: 'unset'
    },
    backgroundColor: 'rgba(30, 32, 38, 0.90)',
    backdropFilter: 'blur(12px)',
    borderRadius: {
      xs: '24px',
      sm: '28px'
    },
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    p: { xs: 1.5, sm: 2 },
    fontSize: { xs: '0.7rem', sm: '0.95rem' },
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
      border: '1px solid rgba(255,255,255,0.18)',
    },
    '& .MuiInputBase-root': {
      fontSize: { xs: '0.7rem', sm: '0.95rem' },
      minHeight: 28,
      borderRadius: { xs: '16px', sm: '20px' },
      p: { xs: 1, sm: 1.5 },
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }
    },
    '& .MuiChip-root': {
      height: { xs: 24, sm: 28 },
      fontSize: { xs: '0.7rem', sm: '0.8rem' },
      px: { xs: 0.75, sm: 1 },
      borderRadius: { xs: '12px', sm: '14px' },
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      },
      '& .MuiChip-deleteIcon': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&:hover': {
          color: '#fff'
        }
      }
    },
    '& .MuiTypography-root': {
      fontSize: { xs: '0.7rem', sm: '0.95rem' },
      color: 'rgba(255, 255, 255, 0.9)'
    },
    '& .MuiIconButton-root': {
      padding: { xs: 0.75, sm: 1 },
      '& svg': {
        fontSize: { xs: '1.1rem', sm: '1.3rem' },
        color: 'rgba(255, 255, 255, 0.7)',
        transition: 'color 0.2s ease',
      },
      '&:hover svg': {
        color: '#fff'
      }
    }
  },
  mapControlsWrapper: {
    position: 'fixed',
    right: {
      xs: 4, // closer to edge
      sm: 16,
      md: 20
    },
    top: {
      xs: 56, // lower to avoid notch
      sm: 80,
      md: 100
    },
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: {
      xs: 0.25, // less gap
      sm: 1
    },
  },
  zoomControlsWrapper: {
    position: 'fixed',
    right: {
      xs: 4, // closer to edge
      sm: 16,
      md: 20
    },
    bottom: {
      xs: 56, // higher to avoid bottom nav
      sm: 80,
      md: 100
    },
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: {
      xs: 0.25, // less gap
      sm: 1
    },
  },
  mapControlButtonStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    width: {
      xs: 28, // even smaller on mobile
      sm: 40,
      md: 48
    },
    height: {
      xs: 28, // even smaller on mobile
      sm: 40,
      md: 48
    },
    minHeight: 'unset',
    fontSize: { xs: '1rem', sm: '1.3rem' }, // smaller font
  },
  mobileDetailsCard: {
    position: 'fixed',
    right: 8, // closer to edge
    top: 56, // lower to avoid notch
    zIndex: 1000,
    width: { xs: 'calc(100vw - 16px)', sm: 500 },
    maxWidth: { xs: 'calc(100vw - 16px)', sm: 500 },
    maxHeight: { xs: 'calc(100vh - 80px)', sm: 'calc(100vh - 150px)' },
    overflow: 'auto',
    borderRadius: 2,
    boxShadow: 3,
    fontSize: { xs: '0.9rem', sm: '1rem' },
    p: { xs: 1, sm: 2 },
  },
  filterMenu: {
    position: 'absolute',
    left: {
      xs: 8,
      sm: 20
    },
    bottom: {
      xs: 8,
      sm: 20
    },
    width: {
      xs: 160,
      sm: 280
    },
    zIndex: 1100,
    p: {
      xs: 1,
      sm: 2
    },
    borderRadius: {
      xs: '24px',
      sm: '28px'
    },
    bgcolor: 'rgba(30, 32, 38, 0.90)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: {
      xs: 0.75,
      sm: 1.5
    },
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
      border: '1px solid rgba(255,255,255,0.18)',
    },
    '& .MuiSwitch-root': {
      '& .MuiSwitch-switchBase': {
        '&.Mui-checked': {
          '& + .MuiSwitch-track': {
            backgroundColor: 'rgba(255, 255, 255, 0.3) !important',
            opacity: 1,
          },
          '& .MuiSwitch-thumb': {
            backgroundColor: '#fff',
          },
        },
        '& .MuiSwitch-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        '& + .MuiSwitch-track': {
          backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
          opacity: 1,
        },
      },
    },
  },
}

// Add interface for new location data
interface NewLocationData {
  name: string;
  description: string;
  rating: number;
  photos: File[];
  category: string;
}

// Add this interface after the other interfaces
interface FormState {
  name: string;
  description: string;
  tags: string[];
  photos: File[];
  videos: File[];
  socialShare: boolean;
  isPublic: boolean;
  shareNote?: string;
}

// Add this new component near the top of the file, after the other interfaces
const UserProfilePopup = ({ 
  user, 
  anchorEl, 
  onClose 
}: { 
  user: { 
    uid: string; 
    displayName: string | null; 
    photoURL: string | null;
    username?: string;
  }; 
  anchorEl: HTMLElement | null; 
  onClose: () => void;
}) => {
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isOwnPost = currentUser?.uid === user.uid;

  useEffect(() => {
    const checkFriendship = async () => {
      if (!currentUser || !user.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const friendsList = userData.friends || [];
          const sentRequests = userData.sentRequests || [];
          setIsFriend(friendsList.includes(user.uid));
          setIsRequestSent(sentRequests.includes(user.uid));
        }
      } catch (error) {
        console.error('Error checking friendship:', error);
      }
    };
    
    checkFriendship();
  }, [currentUser, user.uid]);

  const handleSendFriendRequest = async () => {
    if (!currentUser || !user.uid) return;
    
    setIsLoading(true);
    try {
      if (isRequestSent) {
        // Unsend friend request
        await updateDoc(doc(db, 'users', currentUser.uid), {
          sentRequests: arrayRemove(user.uid)
        });
        
        await updateDoc(doc(db, 'users', user.uid), {
          friendRequests: arrayRemove(currentUser.uid)
        });
        
        setIsRequestSent(false);
      } else {
        // Send friend request
        await updateDoc(doc(db, 'users', currentUser.uid), {
          sentRequests: arrayUnion(user.uid)
        });
        
        await updateDoc(doc(db, 'users', user.uid), {
          friendRequests: arrayUnion(currentUser.uid)
        });
        
        setIsRequestSent(true);
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: '#fff',
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={{ p: 2, minWidth: 200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={user.photoURL || undefined}
            sx={{
              width: 48,
              height: 48,
              bgcolor: '#444',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user.displayName || 'Anonymous'}
            </Typography>
            {user.username && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                @{user.username}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentUser && currentUser.uid !== user.uid && (
            isFriend ? (
              <Chip
                label="Friend"
                color="success"
                sx={{ minWidth: 100 }}
              />
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendFriendRequest}
                disabled={isLoading}
                sx={{ 
                  minWidth: 100,
                  bgcolor: isRequestSent ? 'warning.main' : 'primary.main',
                  '&:hover': {
                    bgcolor: isRequestSent ? 'warning.dark' : 'primary.dark',
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isRequestSent ? (
                  'Cancel Request'
                ) : (
                  'Add Friend'
                )}
              </Button>
            )
          )}
        </Box>
      </Box>
    </Popover>
  );
};

const MapPage = ({ darkMode }: MapPageProps) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [mapZoom, setMapZoom] = useState(13)
  const mapRef = useRef<LeafletMap | null>(null)
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null)
  const [newLocationCoords, setNewLocationCoords] = useState<[number, number] | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [allLocations, setAllLocations] = useState<Location[]>([])
  const [hasCentered, setHasCentered] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null)
  const [geoError, setGeoError] = useState('')
  const [showGeoError, setShowGeoError] = useState(false)
  const [lastGeoErrorTime, setLastGeoErrorTime] = useState<number>(0)
  const { i18n, t } = useTranslation()
  const { currentUser } = useAuth()
  const [uploadError, setUploadError] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [geocodingResults, setGeocodingResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [route, setRoute] = useState<RouteData | null>(null)
  const [isRoutingMode, setIsRoutingMode] = useState(false)
  const [transportMode, setTransportMode] = useState<'driving-car' | 'foot-walking' | 'cycling-regular'>('driving-car')
  const [searchCache, setSearchCache] = useState<Record<string, CachedResult>>({})
  const [search, setSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const theme = useTheme()
  const [searchSuggestions, setSearchSuggestions] = useState<GeocodingResult[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<GeocodingResult | null>(null)
  const navigate = useNavigate()
  const [showDistancePopup, setShowDistancePopup] = useState(false)
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    duration: number;
    locationName: string;
  } | null>(null)
  const [selectedPinPosition, setSelectedPinPosition] = useState<[number, number] | null>(null)
  const [pinData, setPinData] = useState({
    title: '',
    description: '',
    photos: [] as File[],
    category: 'Other',
    rating: 0,
    tags: [] as string[],
  })
  const [croppedImages, setCroppedImages] = useState<string[]>([])
  const [showCropModal, setShowCropModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [isPinMode, setIsPinMode] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null)
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [pinName, setPinName] = useState('')
  const [pinDescription, setPinDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [newLocationData, setNewLocationData] = useState<NewLocationData>({
    name: '',
    description: '',
    rating: 0,
    photos: [],
    category: 'Other'
  });
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  // Add a ref to store marker references
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteOption, setDeleteOption] = useState<'mine' | 'all'>('mine');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeletingPin, setIsDeletingPin] = useState(false);
  // Add formState to the state variables
  const [formState, setFormState] = useState<FormState>({
    name: '',
    description: '',
    tags: [],
    photos: [],
    videos: [],
    socialShare: true,
    isPublic: true,
    shareNote: ''
  });
  // Add this state for storing popular tags
  const [popularTags, setPopularTags] = useState<{tag: string, count: number}[]>([]);
  const [locationDetails, setLocationDetails] = useState<Location | null>(null);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likes, setLikes] = useState<string[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [markers, setMarkers] = useState<{ id: string; coordinates: [number, number]; owner: boolean }[]>([]);
  // Add new state for tag search
  const [tagSearch, setTagSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<{tag: string, count: number}[]>([]);
  // Add new state for trending tags
  const [trendingTags, setTrendingTags] = useState<{tag: string, count: number}[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add new state variables for filters
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [userFriends, setUserFriends] = useState<string[]>([]);
  
  // Add state for menu visibility
  const [areMenusVisible, setAreMenusVisible] = useState(true);
  
  // Update the useEffect that handles selected location
  useEffect(() => {
    if (selectedLocation || selectedPinId) {
      // Only hide menus on mobile devices
      if (window.innerWidth < 600) { // 600px is the 'sm' breakpoint
        setAreMenusVisible(false);
      }
    } else {
      // Show menus when no location is selected
      setAreMenusVisible(true);
    }
  }, [selectedLocation, selectedPinId]);
  
  // Add resize listener to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 600) { // 'sm' breakpoint
        setAreMenusVisible(true);
      } else if (selectedLocation || selectedPinId) {
        setAreMenusVisible(false);
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedLocation, selectedPinId]);
  
  // Add useEffect to filter locations based on tag search
  useEffect(() => {
    if (!tagSearch.trim()) {
      setFilteredLocations(allLocations);
      setSuggestedTags([]);
      return;
    }
    
    const searchTerm = tagSearch.toLowerCase().trim();
    
    // Separate sponsored and non-sponsored locations
    const sponsoredLocations = allLocations.filter(loc => loc.tags.includes('Sponsored'));
    const regularLocations = allLocations.filter(loc => !loc.tags.includes('Sponsored'));
    
    // Filter regular locations based on tag search
    const filteredRegular = regularLocations.filter(location => 
      location.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    // Always include sponsored locations regardless of search term
    const filtered = [...sponsoredLocations, ...filteredRegular];
    setFilteredLocations(filtered);
    
    // Filter and sort suggested tags (excluding sponsored tag)
    const suggestions = popularTags
      .filter(tagInfo => 
        tagInfo.tag.toLowerCase().includes(searchTerm) && 
        tagInfo.tag !== 'Sponsored'
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5 suggestions
    setSuggestedTags(suggestions);
  }, [tagSearch, allLocations, popularTags]);

  // Add this function to fetch all tags from the locations collection
  const fetchPopularTags = useCallback(async () => {
    try {
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      
      // Count all tags
      const tagCounts: Record<string, number> = {};
      
      locationsSnapshot.forEach(doc => {
        const location = doc.data();
        if (location.tags && Array.isArray(location.tags)) {
          location.tags.forEach(tag => {
            if (tag && typeof tag === 'string' && tag.trim()) {
              tagCounts[tag.trim()] = (tagCounts[tag.trim()] || 0) + 1;
            }
          });
        }
      });
      
      // Convert to array and sort by count
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
      
      setPopularTags(sortedTags);
      console.log("Fetched popular tags:", sortedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }, []);

  // Call fetchPopularTags when the component mounts
  useEffect(() => {
    fetchPopularTags();
  }, [fetchPopularTags]);

  // Add this useEffect at the beginning of the component to handle URL query parameters
  useEffect(() => {
    // Extract location parameter from URL
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get('location');
    
    if (locationId) {
      // Find the location with the matching ID
      const findLocationById = async () => {
        try {
          const docRef = doc(db, 'locations', locationId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const locationData = docSnap.data() as Omit<Location, 'id'>;
            // Use a simple spread and type assertion to avoid type issues with timestamps
            const location = {
              id: docSnap.id,
              ...locationData,
              // Use current date as fallback in case createdAt is missing
              createdAt: new Date()
            } as Location;
            
            // Set the selected pin
            setSelectedPinId(location.id);
            
            // Show a message to the user
            setSnackbarMessage('Location found! Opening pinpoint details...');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Use a longer timeout to ensure the map and markers are fully loaded
            setTimeout(() => {
              // Try to access the marker reference and open its popup
              const marker = markerRefs.current[location.id];
              if (marker) {
                marker.openPopup();
              } else {
                console.log('Marker not found, trying again in 1 second');
                // Try again in case the markers aren't loaded yet
                setTimeout(() => {
                  const retryMarker = markerRefs.current[location.id];
                  if (retryMarker) {
                    retryMarker.openPopup();
                  } else {
                    console.log('Marker still not found');
                  }
                }, 1000);
              }
            }, 2000);
            
            // Remove the location parameter from the URL to prevent reopening on refresh
            const newURL = new URL(window.location.href);
            newURL.searchParams.delete('location');
            window.history.replaceState({}, '', newURL.toString());
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          setSnackbarMessage('Error loading location');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          
          // Clean up URL even if there was an error
          const newURL = new URL(window.location.href);
          newURL.searchParams.delete('location');
          window.history.replaceState({}, '', newURL.toString());
        }
      };
      
      findLocationById();
    }
  }, []);

  // Prevent scrolling on map page
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Update the geolocation effect
  useEffect(() => {
    let didCenter = false;
    let watchId: number | undefined;
    let isInitialLoad = true;
    let lastErrorTime = 0;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const handleSuccess = (position: GeolocationPosition) => {
      const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
      setCurrentPosition(coords);
      setIsLocating(false);
      retryCount = 0; // Reset retry count on success
      
      if (!didCenter && mapRef.current) {
        mapRef.current.flyTo(coords, 15, {
          animate: true,
          duration: 1.0
        });
        setHasCentered(true);
        didCenter = true;
        
        // Only show success message on initial load
        if (isInitialLoad) {
          setSnackbarMessage(t('map.location_found'));
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setTimeout(() => setSnackbarOpen(false), 2000);
          isInitialLoad = false;
        }
      }
      
      setGeoError('');
    };

    const handleError = (error: GeolocationPositionError) => {
      setHasCentered(true);
      setIsLocating(false);
      
      // Check if enough time has passed since last error
      const now = Date.now();
      if (now - lastErrorTime < GEO_ERROR_COOLDOWN) {
        return; // Skip showing error if within cooldown
      }
      
      let errorMessage = t('map.unable_to_access_location') + ' ';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += t('map.enable_location_services');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += t('map.location_unavailable');
          break;
        case error.TIMEOUT:
          errorMessage += t('map.location_timeout');
          break;
        default:
          errorMessage += t('map.unknown_error');
      }
      
      setGeoError(errorMessage);
      
      // Only show snackbar on initial error or after cooldown
      if (isInitialLoad || now - lastErrorTime >= GEO_ERROR_COOLDOWN) {
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        lastErrorTime = now;
        
        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                { ...GEO_OPTIONS, enableHighAccuracy: retryCount === 1 } // Try high accuracy only on first retry
              );
            }
          }, 5000);
        }
      }
    };

    // Get position immediately when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        GEO_OPTIONS
      );

      // Then start watching position with less frequent updates
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          ...GEO_OPTIONS,
          maximumAge: 30000, // Cache position for 30 seconds for subsequent updates
          enableHighAccuracy: false // Use lower accuracy for updates to save battery
        }
      );
    } else {
      const errorMessage = 'Geolocation is not supported by your browser.';
      setGeoError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsLocating(false);
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount

  // Show geo error only after 15 seconds, and only if cooldown has passed
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (geoError) {
      setShowGeoError(false);
      const now = Date.now();
      if (now - lastGeoErrorTime > GEO_ERROR_COOLDOWN) {
        timer = setTimeout(() => {
          setShowGeoError(true);
          setLastGeoErrorTime(Date.now());
        }, 15000);
      }
    } else {
      setShowGeoError(false);
      if (timer) clearTimeout(timer);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [geoError, lastGeoErrorTime]);

  // Add this new function to handle mouse movement
  const handleMapMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingLocation || showPinModal) return;
    
    const mapEl = e.currentTarget;
    const rect = mapEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPinPosition({ x, y });
  }, [isAddingLocation, showPinModal]);

  // Map click handler for dropping pin
  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!isPinMode) return;

    navigate('/add-pinpoint', {
      state: {
        coordinates: [e.latlng.lat, e.latlng.lng],
        popularTags
      }
    });

    setIsPinMode(false);
  }, [isPinMode, navigate, popularTags]);

  // Add function to calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Add useEffect to fetch user's friends
  useEffect(() => {
    const fetchUserFriends = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserFriends(userData.friends || []);
        }
      } catch (error) {
        console.error('Error fetching user friends:', error);
      }
    };
    fetchUserFriends();
  }, [currentUser]);

  // Update the filtered locations logic
  const displayLocations = useMemo(() => {
    // Separate sponsored and non-sponsored locations
    const sponsoredLocations = allLocations.filter(loc => loc.tags.includes('Sponsored'));
    const regularLocations = allLocations.filter(loc => !loc.tags.includes('Sponsored'));

    // Apply filters only to regular locations
    let filteredRegular = [...regularLocations];

    // Filter by selected tags (must have ALL selected tags)
    if (selectedTags.length > 0) {
      filteredRegular = filteredRegular.filter(location => 
        selectedTags.every(tag => location.tags.includes(tag))
      );
    }

    // Filter by nearby locations (100km radius)
    if (showNearbyOnly && currentPosition) {
      filteredRegular = filteredRegular.filter(location => {
        const distance = calculateDistance(
          currentPosition[0],
          currentPosition[1],
          location.coordinates[0],
          location.coordinates[1]
        );
        return distance <= 100; // 100km radius
      });
    }

    // Filter by recent posts (last 24 hours)
    if (showRecentOnly) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      filteredRegular = filteredRegular.filter(location => 
        location.createdAt > oneDayAgo
      );
    }

    // Filter by friends' posts
    if (showFriendsOnly) {
      filteredRegular = filteredRegular.filter(location => 
        userFriends.includes(location.createdBy.uid)
      );
    }

    // Filter by user's own posts
    if (showMineOnly && currentUser) {
      filteredRegular = filteredRegular.filter(location => 
        location.createdBy.uid === currentUser.uid
      );
    }

    // Always include sponsored locations at the beginning of the array
    return [...sponsoredLocations, ...filteredRegular];
  }, [allLocations, selectedTags, showNearbyOnly, showRecentOnly, showFriendsOnly, showMineOnly, currentPosition, userFriends, currentUser, calculateDistance]);

  // Memoize the search cache cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSearchCache(prevCache => {
        const now = Date.now();
        const newCache = { ...prevCache };
        Object.keys(newCache).forEach(key => {
          if (now - newCache[key].timestamp > SEARCH_CACHE_DURATION) {
            delete newCache[key];
          }
        });
        return newCache;
      });
    }, SEARCH_CACHE_DURATION);

    return () => clearInterval(cleanup);
  }, []);

  // Memoize the geocoding fetch function
  const fetchGeocodingResults = useCallback(async (query: string) => {
    const cacheKey = `${query}_${i18n.language}`;
    
    // Check cache first
    if (searchCache[cacheKey] && 
        Date.now() - searchCache[cacheKey].timestamp < SEARCH_CACHE_DURATION) {
      return searchCache[cacheKey].results;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` + 
      new URLSearchParams({
        format: 'json',
        q: query,
        limit: '5',
        'accept-language': i18n.language,
        addressdetails: '1',
        namedetails: '1'
      }),
      {
        headers: {
          'Accept-Language': i18n.language
        }
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: GeocodingResult[] = await response.json();
    
    // Cache the results
    setSearchCache(prev => ({
      ...prev,
      [cacheKey]: {
        timestamp: Date.now(),
        results: data
      }
    }));

    return data;
  }, [i18n.language, searchCache]);

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string, callback: (results: GeocodingResult[]) => void) => {
        try {
          const results = await fetchGeocodingResults(query);
          callback(results);
        } catch (error) {
          console.error('Error searching locations:', error);
          callback([]);
        }
      }, SEARCH_DEBOUNCE_DELAY),
    [fetchGeocodingResults]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Update handleSearch function to handle undefined
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const results = await fetchGeocodingResults(search);
      setGeocodingResults(results);
    } catch (err) {
      // Optionally handle error
    }
    setSearchLoading(false);
  };

  const handleLocationSelect = (location: SearchResultType) => {
    if ('coordinates' in location) {
      // Local location
      setMapCenter(location.coordinates);
      setMapZoom(12);
      setSelectedLocation(location);
      setSearchQuery(location.name);
    } else {
      // Geocoding result
      const coords: [number, number] = [parseFloat(location.lat), parseFloat(location.lon)];
      setMapCenter(coords);
      setMapZoom(12);
      setSelectedLocation(null);
      setSearchQuery(location.display_name);
    }
    setSearchResults([]);
    setGeocodingResults([]);
  };

  // Fetch locations from Firestore on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Set up a real-time listener for locations
        const unsubscribe = onSnapshot(collection(db, 'locations'), (snapshot) => {
          const locs: Location[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to Date
            const createdAt = data.createdAt?.toDate() || new Date();
            
            const locationData = {
              id: doc.id,
              ...data,
              createdAt,
              coordinates: data.coordinates || [0, 0],
              tags: data.tags || [],
              photos: data.photos || [],
              createdBy: {
                uid: data.createdBy?.uid || 'anonymous',
                displayName: data.createdBy?.displayName || 'Anonymous',
                photoURL: data.createdBy?.photoURL || null
              }
            } as Location;
            
            locs.push(locationData);
            console.log('Loaded location:', locationData);
          });
          
          console.log('Total locations loaded:', locs.length);
          setAllLocations(locs);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSnackbarMessage('Error loading locations');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchLocations();
  }, []);

  // Update the locate me handler to use the same options
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      const errorMessage = 'Geolocation is not supported by your browser.';
      setGeoError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setGeoError('');
    setIsLocating(true);
    setSnackbarMessage('Finding your location...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    // Get the last known position without checking
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCurrentPosition(coords);
        setIsLocating(false);
        if (mapRef.current) {
          mapRef.current.flyTo(coords, 15, {
            animate: true,
            duration: 0.8,
            easeLinearity: 0.35,
            noMoveStart: true
          });
        }
        setSnackbarMessage('Location found!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => setSnackbarOpen(false), 2000);
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Unable to access your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        setGeoError(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      },
      {
        enableHighAccuracy: false,
        maximumAge: Infinity,
        timeout: 0
      }
    );
  }, []);

  // Update createPinIcon to use yellow for sponsored markers
  const createPinIcon = (options: { 
    isSelected?: boolean;
    isOwner?: boolean;
    isHovering?: boolean;
    locationId?: string;
    isSponsored?: boolean;
  } = {}) => {
    const { isSelected = false, isOwner = false, isHovering = false, locationId, isSponsored = false } = options;
    
    // Size multiplier for selected pins
    const sizeMultiplier = isSelected ? 1.5 : 1;
    
    // Determine pin color based on state
    let fillColor;
    if (isHovering) {
      fillColor = '#ff4444'; // hovering pin is red
    } else if (isSponsored) {
      fillColor = '#FFD700'; // sponsored pins are yellow
    } else if (isOwner) {
      fillColor = '#4CAF50'; // user's own pins are green
    } else {
      fillColor = '#ff3366'; // pins from other users are red
    }
    
    const size = Math.round(24 * sizeMultiplier);
    
    return L.divIcon({
      className: `custom-div-icon${locationId ? ` location-${locationId}` : ''}`,
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          transition: all 0.2s ease;
        ">
          <svg viewBox="0 0 24 24" style="width: 100%; height: 100%;">
            <path 
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="${fillColor}"
              stroke="#ffffff"
              stroke-width="1.5"
            />
            <circle cx="12" cy="9" r="3" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size],
      popupAnchor: [0, -size],
    });
  };

  // Cursor Marker Component with green color
  const CursorMarkerComponent = useCallback(() => {
    if (!isPinMode || !cursorPosition) return null;
    
    return (
      <Marker
        position={cursorPosition}
        icon={L.divIcon({
          className: 'cursor-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              transition: all 0.2s ease;
            ">
              <svg viewBox="0 0 24 24" style="width: 100%; height: 100%;">
                <path 
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#4CAF50"
                  stroke="#ffffff"
                  stroke-width="1.5"
                />
                <circle cx="12" cy="9" r="3" fill="#ffffff"/>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24],
        })}
        zIndexOffset={1000}
      />
    );
  }, [isPinMode, cursorPosition]);

  // Update handleSubmit for new pins
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submit started - Form data:", formState);
    console.log("Pin location:", pinLocation);
    
    if (!pinLocation || !formState.name || !formState.description) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.log("Validation failed - missing required fields");
      return;
    }

    const newPin: Omit<Location, "id"> = {
      name: formState.name,
      description: formState.description,
      coordinates: pinLocation || [0, 0], // Provide default coordinates if null
      tags: formState.tags,
      photos: [], // We'll handle the upload separately
      createdBy: {
        uid: currentUser?.uid || 'anonymous',
        displayName: currentUser?.displayName || null,
        photoURL: currentUser?.photoURL || null
      },
      createdAt: new Date(),
      likes: [],
      views: 0,
      // Add sponsored expiration if it's a sponsored post
      ...(formState.tags.includes('Sponsored') && {
        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      })
    };

    console.log("Created newPin object:", newPin);
    console.log("Current user:", currentUser);

    // First handle photo uploads
    const photoUrls: string[] = [];
    if (formState.photos.length > 0) {
      try {
        console.log("Starting photo uploads:", formState.photos.length);
        setIsUploading(true);
        for (const photo of formState.photos) {
          console.log("Uploading photo:", photo.name);
          const url = await uploadImage(photo);
          photoUrls.push(url);
          console.log("Photo uploaded successfully:", url);
        }
        setIsUploading(false);
        newPin.photos = photoUrls;
        console.log("All photos uploaded:", photoUrls);
      } catch (uploadError) {
        console.error('Error uploading photos:', uploadError);
        setSnackbarMessage('Error uploading photos. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsUploading(false);
        return;
      }
    }

    try {
      console.log("Saving pinpoint to Firestore...");
      // Create the location document
      const docRef = await addDoc(collection(db, 'locations'), newPin);
      console.log('Added new location with ID:', docRef.id);
      
      // Get user data for the post
      const userDoc = await getDoc(doc(db, 'users', currentUser?.uid || ''));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      // Always create a feed post to ensure map and feed are in sync
      console.log("Creating social post for the pinpoint...");
      
      // Create a post in the posts collection
      await addDoc(collection(db, 'posts'), {
        location: {
          id: docRef.id,
          title: formState.name,
          description: formState.description,
          latitude: pinLocation[0],
          longitude: pinLocation[1],
          images: photoUrls.length > 0 ? photoUrls : [], // Use actual uploaded URLs
          tags: formState.tags
        },
        createdAt: serverTimestamp(),
        user: {
          uid: currentUser?.uid || 'anonymous',
          displayName: currentUser?.displayName || 'Anonymous',
          username: userData?.username || 'user',
          photoURL: currentUser?.photoURL || null
        },
        likes: [],
        comments: [],
        isPublic: formState.socialShare ? formState.isPublic : true, // Default to public if socialShare is false
        shareNote: formState.socialShare ? formState.shareNote : ''
      });
      console.log("Social post created successfully");
      
      // Create notifications for friends only if socialShare is enabled
      if (formState.socialShare && userData?.friends && userData.friends.length > 0) {
        console.log("Creating friend notifications...");
        // Get batch write for Firestore
        const batch = writeBatch(db);
        
        // Create a notification for each friend
        userData.friends.forEach((friendId: string) => {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
            type: 'pinpoint',
            fromUser: {
              uid: currentUser?.uid,
              displayName: currentUser?.displayName,
              photoURL: currentUser?.photoURL
            },
            toUserId: friendId,
            locationId: docRef.id,
            createdAt: serverTimestamp(),
            read: false
          });
        });
        
        // Commit the batch
        await batch.commit();
        console.log("Friend notifications created");
      }
      
      // Reset the form state
      setFormState({
        name: '',
        description: '',
        tags: [],
        photos: [],
        videos: [],
        socialShare: true,
        isPublic: true,
        shareNote: ''
      });
      
      // Close the modal
      setShowPinModal(false);
      
      setSnackbarMessage('Pinpoint added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      console.log("Pinpoint creation completed successfully");
    } catch (error: any) {
      console.error('Error adding pinpoint:', error);
      setSnackbarMessage(`Error adding pinpoint: ${error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${transportMode}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.code !== 'Ok') {
        throw new Error('Route not found');
      }

      const route: RouteData = {
        coordinates: data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
        distance: data.routes[0].distance,
        duration: data.routes[0].duration
      };

      setRoute(route);
      
      // Fit the map to show the entire route
      if (mapRef.current) {
        const bounds = L.latLngBounds(route.coordinates);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }

      return route;
    } catch (error) {
      console.error('Error fetching route:', error);
      setUploadError('Failed to get directions');
      return null;
    }
  };

  const handleNavigate = async (location: Location | GeocodingResult) => {
    if (!currentPosition) {
      setUploadError('Please enable location services for navigation');
      return;
    }

    let endCoords: [number, number];
    if ('coordinates' in location) {
      endCoords = location.coordinates;
    } else {
      endCoords = [parseFloat(location.lat), parseFloat(location.lon)];
    }

    setIsRoutingMode(true);
    const routeData = await fetchRoute(currentPosition, endCoords);
    if (routeData) {
      setRoute(routeData);
      setDistanceInfo({
        distance: routeData.distance,
        duration: routeData.duration,
        locationName: 'name' in location ? location.name : location.display_name
      });
      setShowDistancePopup(true);
    }
  };

  const formatDistance = (meters: number) => {
    return meters >= 1000 
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Enhanced search functionality
  const handleSearchDebounced = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchSuggestions([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        )
        const data = await response.json()
        setSearchSuggestions(data)
      } catch (error) {
        console.error('Error fetching search suggestions:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300),
    []
  )

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: GeocodingResult) => {
    setSelectedSuggestion(suggestion)
    const coords: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)]
    setMapCenter(coords)
    setMapZoom(15)
    
    // Fetch and display route if user's location is available
    if (currentPosition) {
      const routeData = await fetchRoute(currentPosition, coords)
      if (routeData) {
        setRoute(routeData)
        setDistanceInfo({
          distance: routeData.distance,
          duration: routeData.duration,
          locationName: suggestion.display_name
        })
        setShowDistancePopup(true)
      }
    }
  }

  // Add function to get weighted random location
  const getWeightedRandomLocation = useCallback(async (currentLocationId: string) => {
    // Only consider locations that are currently visible (not hidden)
    const otherLocations = displayLocations.filter(loc => loc.id !== currentLocationId);
    if (otherLocations.length === 0) return null;

    // Separate sponsored and non-sponsored locations
    const sponsoredLocations = otherLocations.filter(loc => loc.tags.includes('Sponsored'));
    const regularLocations = otherLocations.filter(loc => !loc.tags.includes('Sponsored'));

    // Get the current user's viewed pinpoints
    let viewedPinpoints = new Set<string>();
    if (currentUser) {
      try {
        const viewedRef = collection(db, 'viewedPinpoints');
        const q = query(viewedRef, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        viewedPinpoints = new Set(snapshot.docs.map(doc => doc.data().locationId));
      } catch (error) {
        console.error('Error fetching viewed pinpoints:', error);
      }
    }

    // Get unviewed locations
    const unviewedLocations = regularLocations.filter(loc => !viewedPinpoints.has(loc.id));
    
    // Check if we should show a sponsored post (exactly 1 in 7)
    const shouldShowSponsored = Math.random() < (1/7) && sponsoredLocations.length > 0;

    if (shouldShowSponsored) {
      // Randomly select from sponsored locations
      return sponsoredLocations[Math.floor(Math.random() * sponsoredLocations.length)];
    }

    // If there are unviewed locations and we're not showing a sponsored post, prioritize them
    if (unviewedLocations.length > 0) {
      return unviewedLocations[Math.floor(Math.random() * unviewedLocations.length)];
    }

    // For regular locations, use weighted logic that considers likes and views
    const totalWeight = regularLocations.reduce((sum, loc) => {
      // Base weight from likes
      const likeWeight = (loc.likes?.length || 0) + 1;
      // Reduce weight based on views (more views = less likely to appear)
      const viewPenalty = Math.min(0.8, (loc.views || 0) * 0.1); // Cap penalty at 80%
      const finalWeight = likeWeight * (1 - viewPenalty);
      return sum + finalWeight;
    }, 0);

    // Generate random number between 0 and total weight
    let random = Math.random() * totalWeight;
    
    // Find the location that corresponds to the random number
    for (const location of regularLocations) {
      const likeWeight = (location.likes?.length || 0) + 1;
      const viewPenalty = Math.min(0.8, (location.views || 0) * 0.1);
      const finalWeight = likeWeight * (1 - viewPenalty);
      random -= finalWeight;
      if (random <= 0) {
        return location;
      }
    }

    // Fallback to first location (should never happen due to math)
    return regularLocations[0];
  }, [displayLocations, currentUser]);

  // Update handleNextPinpoint to handle async getWeightedRandomLocation
  const handleNextPinpoint = useCallback(async (currentLocationId: string) => {
    const nextLocation = await getWeightedRandomLocation(currentLocationId);
    if (!nextLocation) return;

    if (mapRef.current) {
      const map = mapRef.current;
      const currentZoom = map.getZoom();
      const targetZoom = currentZoom < 10 ? 17 : 15;
      
      // Calculate the optimal view center
        const bounds = map.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
      const latOffset = (northEast.lat - southWest.lat) * 0.25;
        const targetViewCenter: [number, number] = [
          nextLocation.coordinates[0] + latOffset,
          nextLocation.coordinates[1]
        ];

      // Calculate distance between current center and target location
      const currentCenter = map.getCenter();
      const distance = currentCenter.distanceTo(L.latLng(nextLocation.coordinates));
      
      // Adjust animation duration based on distance
      // For distances > 100km, use longer duration
      // For distances < 10km, use shorter duration
      const duration = distance > 100000 ? 2.0 : 
                      distance > 50000 ? 1.5 :
                      distance > 10000 ? 1.0 : 0.8;

      map.flyTo(targetViewCenter, targetZoom, {
        animate: true,
        duration: duration,
        easeLinearity: 0.35,
        noMoveStart: true
      }).once('moveend', () => {
        const marker = markerRefs.current[nextLocation.id];
        if (marker && !marker.isPopupOpen()) {
          marker.openPopup();
        }
      });
    }
  }, [getWeightedRandomLocation]);

  // Add this function near the top of the component
  const handleShare = (locationId: string) => {
    const url = `${window.location.origin}/map?location=${locationId}`;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage('Link copied to clipboard!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch(() => {
      setSnackbarMessage('Failed to copy link');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  // Add this function to format the date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  };

  // Add this function to check if a sponsored post is expired
  const isSponsoredExpired = (location: Location) => {
    if (!location.tags.includes('Sponsored') || !location.sponsoredUntil) return false;
    return new Date() > location.sponsoredUntil;
  };

  // Add this function to get days remaining for sponsored posts
  const getDaysRemaining = (location: Location) => {
    if (!location.tags.includes('Sponsored') || !location.sponsoredUntil) return null;
    const now = new Date();
    const diff = location.sponsoredUntil.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Add handler for tag selection
  const handleTagClick = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

  // Enhanced location card component with dark mode styling
  const LocationCard = ({ location }: { location: Location }): JSX.Element => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;
    const isCreator = currentUser?.uid === location.createdBy.uid;
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [likes, setLikes] = useState<string[]>(location.likes || []);
    const [isFriend, setIsFriend] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
    const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
    const [isRequestSent, setIsRequestSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savingInProgress, setSavingInProgress] = useState(false);
    const [showCleanImage, setShowCleanImage] = useState(false);

    // Check if the post creator is in the user's friends list
    useEffect(() => {
      const checkFriendship = async () => {
        if (!currentUser) return;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const friendsList = userData.friends || [];
            const sentRequests = userData.sentRequests || [];
            setIsFriend(friendsList.includes(location.createdBy.uid));
            setIsRequestSent(sentRequests.includes(location.createdBy.uid));
          }
        } catch (error) {
          console.error('Error checking friendship:', error);
        }
      };
      
      checkFriendship();
    }, [currentUser, location.createdBy.uid]);
    
    const handleImageLoad = (index: number) => {
      setLoadingImages((prev: Record<number, boolean>) => ({
        ...prev,
        [index]: false
      }));
    };

    const handleImageLoadStart = (index: number) => {
      setLoadingImages((prev: Record<number, boolean>) => ({
        ...prev,
        [index]: true
      }));
    };
    
    const handleLike = async () => {
      if (!currentUser) {
        setSnackbarMessage('You must be logged in to like a location');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      try {
        const locationRef = doc(db, 'locations', location.id);
        const isLiked = likes.includes(currentUser.uid);
        
        if (isLiked) {
          // Remove like
          await updateDoc(locationRef, {
            likes: arrayRemove(currentUser.uid)
          });
          setLikes(likes.filter(id => id !== currentUser.uid));
        } else {
          // Add like
          await updateDoc(locationRef, {
            likes: arrayUnion(currentUser.uid)
          });
          setLikes([...likes, currentUser.uid]);
        }
      } catch (error) {
        console.error('Error updating like:', error);
        // Revert visual state on error
        const isLiked = likes.includes(currentUser.uid);
        if (isLiked) {
          setLikes([...likes.filter(id => id !== currentUser.uid), currentUser.uid]);
        } else {
          setLikes(likes.filter(id => id !== currentUser.uid));
        }
        setSnackbarMessage('Error updating like. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    
    // Photo navigation
    const nextPhoto = () => {
      if (location.photos && location.photos.length > 0) {
        setCurrentPhotoIndex((prev) => (prev + 1) % location.photos.length);
      }
    };

    const prevPhoto = () => {
      if (location.photos && location.photos.length > 0) {
        setCurrentPhotoIndex((prev) => (prev === 0 ? location.photos.length - 1 : prev - 1));
      }
    };

    // Check if sponsored post is expired
    const isExpired = isSponsoredExpired(location);
    const daysRemaining = getDaysRemaining(location);

    // If sponsored post is expired, don't render it
    if (isExpired) return <></>;

    const handleRespond = async (location: Location): Promise<void> => {
      if (!currentUser) return;

      try {
        // First, check if a chat already exists with the pinpoint creator
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('members', 'array-contains', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        let chatId = null;
        
        querySnapshot.forEach(doc => {
          const chatData = doc.data();
          if (chatData.members.includes(location.createdBy.uid)) {
            chatId = doc.id;
          }
        });
        
        // If no chat exists, create one
        if (!chatId) {
          const newChatRef = await addDoc(chatsRef, {
            members: [currentUser.uid, location.createdBy.uid],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: '',
            isBot: false
          });
          
          chatId = newChatRef.id;
        }

        // Create the message with the pinpoint link
        const pinpointLink = `${window.location.origin}/map?location=${location.id}`;
        const messageText = `${currentUser.displayName || 'Someone'} responded to your pinpoint "${location.name}". View it here: ${pinpointLink}`;

        // Add the response message
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: currentUser.uid,
          text: messageText,
          timestamp: serverTimestamp(),
          status: 'sent',
          type: 'text',
          pinpointId: location.id,
          pinpointName: location.name,
          pinpointLink: pinpointLink
        });

        // Update the chat's last message
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: messageText,
          lastMessageId: chatId,
          updatedAt: serverTimestamp(),
          lastSenderId: currentUser.uid
        });

        // Show success message
        setSuccessMessage('Message sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Remove navigation to add-pinpoint page
      } catch (error) {
        console.error('Error creating chat message:', error);
        setError('Failed to send message');
      }
    };

    // Check if the pinpoint is saved
    useEffect(() => {
      const checkIfSaved = async () => {
        if (!currentUser) return;
        
        try {
          const savedPinpointsRef = collection(db, 'savedPinpoints');
          const q = query(
            savedPinpointsRef, 
            where('userId', '==', currentUser.uid),
            where('pinpointId', '==', location.id)
          );
          const querySnapshot = await getDocs(q);
          setIsSaved(!querySnapshot.empty);
        } catch (err) {
          console.error('Error checking if pinpoint is saved:', err);
        }
      };

      checkIfSaved();
    }, [currentUser, location.id]);

    const handleSave = async () => {
      if (!currentUser) {
        setSnackbarMessage('Please log in to save pinpoints');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      try {
        setSavingInProgress(true);
        
        if (isSaved) {
          // Find and delete the saved pinpoint
          const savedPinpointsRef = collection(db, 'savedPinpoints');
          const q = query(
            savedPinpointsRef, 
            where('userId', '==', currentUser.uid),
            where('pinpointId', '==', location.id)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            await deleteDoc(querySnapshot.docs[0].ref);
          }
          
          setIsSaved(false);
          setSnackbarMessage('Pinpoint removed from saved');
        } else {
          // Save the pinpoint
          await addDoc(collection(db, 'savedPinpoints'), {
            userId: currentUser.uid,
            pinpointId: location.id,
            savedAt: new Date()
          });
          
          setIsSaved(true);
          setSnackbarMessage('Pinpoint saved successfully');
        }
        
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        console.error('Error saving/unsaving pinpoint:', err);
        setSnackbarMessage('Failed to save/unsave pinpoint');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setSavingInProgress(false);
      }
    };

    return (
      <Box sx={{
        width: '100%',
        display: 'flex',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        p: { xs: 0.25, sm: 0.5, md: 0.75 },
        gap: { xs: 0.25, sm: 0.5, md: 0.75 },
      }}>
        {/* Add UserProfilePopup */}
        <UserProfilePopup
          user={location.createdBy}
          anchorEl={profileAnchorEl}
          onClose={() => setProfileAnchorEl(null)}
        />
        
        {/* Photo section with improved styling */}
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          mb: { xs: 0.5, sm: 0.5 },
          height: 'auto', // Changed from paddingTop to auto height
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
        }}>
          {location.photos && location.photos.length > 0 && (
            <>
              <Box sx={{
                position: 'relative', // Changed from absolute to relative
                width: '100%',
                height: 'auto', // Changed from 100% to auto
                overflow: 'hidden',
                borderRadius: '12px',
                cursor: 'zoom-in',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
                  pointerEvents: 'none',
                }
              }}>
                {loadingImages[currentPhotoIndex] && (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                )}
                <img
                  src={location.photos[currentPhotoIndex]}
                  alt={`Location photo ${currentPhotoIndex + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    opacity: loadingImages[currentPhotoIndex] ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                    cursor: 'zoom-in'
                  }}
                  onLoadStart={() => handleImageLoadStart(currentPhotoIndex)}
                  onLoad={() => handleImageLoad(currentPhotoIndex)}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setZoomOpen(true);
                  }}
                  className="notranslate"
                />
                
                {/* Clean image view button */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCleanImage(!showCleanImage);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                    width: 32,
                    height: 32,
                    zIndex: 2,
                  }}
                >
                  {showCleanImage ? (
                    <FullscreenExitIcon sx={{ fontSize: '1.2rem' }} />
                  ) : (
                    <FullscreenIcon sx={{ fontSize: '1.2rem' }} />
                  )}
                </IconButton>

                {/* Photo counter badge */}
                {location.photos.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backdropFilter: 'blur(4px)',
                      zIndex: 1,
                    }}
                  >
                    <CollectionsIcon sx={{ fontSize: '1rem' }} />
                    {currentPhotoIndex + 1}/{location.photos.length}
                  </Box>
                )}

                {/* Navigation hints on hover */}
                {location.photos.length > 1 && (
                  <>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        prevPhoto();
                      }}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '30%',
                        background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: '0 16px',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    >
                      <ChevronLeftIcon sx={{ 
                        color: '#fff', 
                        fontSize: '2rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }} />
                    </Box>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        nextPhoto();
                      }}
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '30%',
                        background: 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '0 16px',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    >
                      <ChevronRightIcon sx={{ 
                        color: '#fff', 
                        fontSize: '2rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }} />
                    </Box>
                  </>
                )}

                {/* Overlay content */}
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: showCleanImage ? 0 : 1,
                  visibility: showCleanImage ? 'hidden' : 'visible',
                  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
                }}>
                  {/* Gradients container */}
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}>
                    {/* Top gradient */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: { xs: '20%', sm: '30%' },
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                    {/* Bottom gradient */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: { xs: '35%', sm: '50%' },
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                  </Box>

                  {/* Content container */}
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                  }}>
                    {/* Top content */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        p: { xs: 1, sm: 1.5 },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        color: '#fff',
                        transform: showCleanImage ? 'translateY(-10px)' : 'translateY(0)',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                        <Avatar
                          src={location.createdBy.photoURL || undefined}
                          alt={location.createdBy.displayName || 'User'}
                          sx={{ 
                            width: { xs: 20, sm: 28 },
                            height: { xs: 20, sm: 28 },
                            border: '2px solid rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileAnchorEl(e.currentTarget);
                          }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              fontWeight: 500,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                              cursor: 'pointer',
                              lineHeight: { xs: 1.1, sm: 1.2 },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileAnchorEl(e.currentTarget);
                            }}
                          >
                            {location.createdBy.displayName || 'Anonymous'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: { xs: '0.55rem', sm: '0.65rem' },
                              color: 'rgba(255, 255, 255, 0.8)',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                              display: 'block',
                              lineHeight: { xs: 1.1, sm: 1.2 },
                            }}
                          >
                            {formatDate(location.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom content */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: { xs: 1, sm: 1.5 },
                        color: '#fff',
                        transform: showCleanImage ? 'translateY(10px)' : 'translateY(0)',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.95rem' },
                          fontWeight: 600,
                          mb: { xs: 0.25, sm: 0.5 },
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          lineHeight: 1.2,
                        }}
                      >
                        {location.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          mb: { xs: 0.5, sm: 1 },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          lineHeight: 1.3,
                        }}
                      >
                        {location.description}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: { xs: 0.25, sm: 0.5 },
                        mb: { xs: 0.25, sm: 0.5 }
                      }}>
                        {location.tags.map((tag, index) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(tag);
                              }}
                              sx={{
                                height: { xs: 16, sm: 24 },
                                fontSize: { xs: '0.55rem', sm: '0.7rem' },
                                cursor: 'pointer',
                                backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.2) : 'rgba(255, 255, 255, 0.08)',
                                color: isSelected ? theme.palette.primary.main : 'inherit',
                                fontWeight: isSelected ? 500 : 400,
                                '& .MuiChip-label': {
                                  px: { xs: 0.5, sm: 0.75 },
                                  py: { xs: 0.25, sm: 0.5 },
                                },
                                '&:hover': {
                                  backgroundColor: isSelected 
                                    ? alpha(theme.palette.primary.main, 0.3)
                                    : alpha(theme.palette.primary.main, 0.15),
                                },
                                transition: 'all 0.2s ease'
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Clean image toggle button */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCleanImage(!showCleanImage);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '6px',
                    zIndex: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                    transition: 'background-color 0.2s ease-in-out, transform 0.2s ease-in-out',
                    transform: showCleanImage ? 'scale(1.1)' : 'scale(1)',
                  }}
                  size="small"
                >
                  {showCleanImage ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                </IconButton>
              </Box>
            </>
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: { xs: 0.75, sm: 1 }, // Reduced to match bottom padding
          gap: 0.5,
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 0.75, sm: 1 }, // Keeping the same as top margin
        }}>
          {/* Left side - Action buttons */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              onClick={() => handleNavigate(location)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                width: 32,
                height: 32,
              }}
            >
              <NavigationIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
            <IconButton
              onClick={() => handleRespond(location)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                width: 32,
                height: 32,
              }}
            >
              <RateReviewIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
            <IconButton
              onClick={() => handleShare(location.id)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                width: 32,
                height: 32,
              }}
            >
              <ShareIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
            <IconButton
              onClick={handleSave}
              size="small"
              disabled={savingInProgress}
              sx={{
                backgroundColor: isSaved ? 'rgba(33, 150, 243, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: isSaved ? 'rgba(33, 150, 243, 0.4)' : 'rgba(255, 255, 255, 0.25)',
                },
                width: 32,
                height: 32,
              }}
            >
              {isSaved ? (
                <BookmarkIcon sx={{ fontSize: '1.2rem' }} />
              ) : (
                <BookmarkBorderIcon sx={{ fontSize: '1.2rem' }} />
              )}
            </IconButton>
          </Box>

          {/* Right side - Next button */}
          <Button
            variant="contained"
            size="medium"
            startIcon={<ExploreIcon sx={{ fontSize: '1.2rem' }} />}
            onClick={() => handleNextPinpoint(location.id)}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
              fontSize: '0.9rem',
              height: '36px',
              minWidth: 'auto',
              px: 2,
              borderRadius: '18px',
            }}
          >
            Next
          </Button>
        </Box>

        {/* Snackbar for save/unsave feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Add Modal for full-screen image view */}
        <Modal
          open={zoomOpen}
          onClose={() => setZoomOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 1500,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setZoomOpen(false);
              }
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={() => setZoomOpen(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: '#fff',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 2,
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Navigation buttons */}
            {location.photos && location.photos.length > 1 && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  sx={{
                    position: 'absolute',
                    left: { xs: 8, sm: 32 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#fff',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  sx={{
                    position: 'absolute',
                    right: { xs: 8, sm: 32 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#fff',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
              </>
            )}

            {/* Photo counter */}
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '0.9rem',
              zIndex: 2,
            }}>
              {currentPhotoIndex + 1}/{location.photos?.length}
            </Box>

            {/* Main image */}
            <Box
              sx={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
              }}
            >
              <img
                src={location.photos?.[currentPhotoIndex]}
                alt={`Location photo ${currentPhotoIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                className="notranslate"
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  };

  // Update the CSS for popup styling
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    // Define the CSS
    style.textContent = `
      .leaflet-popup {
        margin-bottom: 15px;
        opacity: 1;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }

      .leaflet-popup-content-wrapper {
        background-color: rgba(30, 32, 38, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        min-width: min(800px, calc(100vw - 32px));
        max-width: min(900px, calc(100vw - 32px));
        padding: 0;
        margin: 0;
        animation: popup-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: bottom center;
        position: relative;
        left: 0;
        transform: none;
      }
      
      .leaflet-popup-tip-container {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 50%;
        margin-left: -10px;
        overflow: hidden;
        pointer-events: none;
        bottom: -19px;
      }
      
      .leaflet-popup-tip {
        background-color: rgba(30, 32, 38, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: none;
        width: 17px;
        height: 17px;
        padding: 1px;
        margin: -9px auto 0;
        pointer-events: none;
        transform-origin: center;
        transform: rotate(45deg);
        animation: tip-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      @keyframes popup-fade-in {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes popup-fade-out {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
      }
      
      @keyframes tip-fade-in {
        0% {
          opacity: 0;
          transform: translateY(-5px) rotate(45deg);
        }
        100% {
          opacity: 1;
          transform: translateY(0) rotate(45deg);
        }
      }
      
      .leaflet-popup.leaflet-popup--closing {
        animation: popup-fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .leaflet-popup-content {
        margin: 0;
        padding: 0;
        line-height: 1;
        color: #fff;
        width: 100% !important;
      }
      
      .leaflet-popup-close-button {
        display: none !important;
      }
      
      /* Fix modal input fields */
      .MuiModal-root .MuiInputBase-input {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }
      .MuiModal-root {
        z-index: 9999 !important;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(style);
    
    // Add event listeners for popup close animation
    const addPopupCloseAnimation = () => {
      const popups = document.querySelectorAll('.leaflet-popup');
      popups.forEach(popup => {
        const closeButton = popup.querySelector('.leaflet-popup-close-button');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            popup.classList.add('leaflet-popup--closing');
          });
        }
      });
    };

    // Create a MutationObserver to watch for new popups
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          addPopupCloseAnimation();
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up
    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  // Add DistancePopup component
  const DistancePopup = () => {
    if (!showDistancePopup || !distanceInfo) return null;

    const slideUp = keyframes`
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    `;

    return (
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 2,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          animation: `${slideUp} 0.3s ease-out`,
          zIndex: 2000,
          minWidth: 260,
          maxWidth: 400,
          boxShadow: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StraightenIcon color="primary" />
          <Typography>
            {distanceInfo.distance < 1000
              ? `${Math.round(distanceInfo.distance)} m`
              : `${(distanceInfo.distance / 1000).toFixed(1)} km`}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="primary" />
          <Typography>
            {distanceInfo.duration < 3600
              ? `${Math.round(distanceInfo.duration / 60)} min`
              : `${Math.floor(distanceInfo.duration / 3600)} h ${Math.round((distanceInfo.duration % 3600) / 60)} min`}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Typography sx={{ flex: 1, fontWeight: 500, color: 'text.primary', ml: 1, fontSize: '0.95rem' }}>
          {distanceInfo.locationName}
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            setShowDistancePopup(false);
            setRoute(null);
          }}
          sx={{ ml: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Paper>
    );
  };

  // Toggle add location mode
  const toggleAddLocationMode = () => {
    setIsPinMode(prev => !prev);
    if (isPinMode) {
      setPinLocation(null);
      setShowPinModal(false);
    }
    setSnackbarMessage(isPinMode ? '' : 'Click anywhere on the map to add a pinpoint');
    setSnackbarSeverity('info');
    setSnackbarOpen(!isPinMode);
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (pinData.photos.length + newFiles.length > 4) {
        setSnackbarMessage('Maximum of 4 photos allowed');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      setPinData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles]
      }));
    }
  };

  // Map Events Component
  const EventsComponent = useCallback(() => {
    const map = useMapEvents({
      mousemove: (e: L.LeafletMouseEvent) => {
        if (isPinMode) {
          setCursorPosition([e.latlng.lat, e.latlng.lng]);
        }
      },
      mouseout: () => {
        setCursorPosition(null);
      },
      click: handleMapClick
    });

    // Store map reference
    useEffect(() => {
      if (map) mapRef.current = map;
    }, [map]);

    return null;
  }, [isPinMode, handleMapClick]);

  // Pin Modal Component
  const ModalComponent = useCallback(() => {
    const handleModalClose = () => {
      setShowPinModal(false);
      setFormState({
        name: '',
        description: '',
        photos: [],
        videos: [],
        tags: [],
        socialShare: true,
        isPublic: true,
        shareNote: ''
      });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      let newValue = value;
      if (name === 'name') {
        newValue = value.slice(0, 30);
      } else if (name === 'description') {
        newValue = value.slice(0, 250);
      }
      setFormState(prev => ({
        ...prev,
        [name]: newValue
      }));
    };

    const handleTagsChange = (_: any, newValue: string[]) => {
      setFormState(prev => ({
        ...prev,
        tags: newValue
      }));
    };

    // Filter tags based on input for autocomplete
    const handleTagInputChange = (event: React.SyntheticEvent, value: string, reason: string) => {
      // You can add additional logic here if needed
      console.log("Tag input changed:", value);
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'photos' | 'videos') => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        
        // Check combined limit for photos and videos
        const totalMediaCount = 
          (mediaType === 'photos' ? formState.photos.length : formState.videos.length) + 
          newFiles.length;
          
        if (totalMediaCount > 4) {
          setSnackbarMessage(`Maximum of 4 ${mediaType} allowed`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
        
        setFormState(prev => ({
          ...prev,
          [mediaType]: [...prev[mediaType], ...newFiles]
        }));
      }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleMediaUpload(e, 'photos');
    };

    const handleMediaRemove = (indexToRemove: number, mediaType: 'photos' | 'videos') => {
      setFormState(prev => ({
        ...prev,
        [mediaType]: prev[mediaType].filter((_, index) => index !== indexToRemove)
      }));
    };

    const handlePhotoRemove = (indexToRemove: number) => {
      handleMediaRemove(indexToRemove, 'photos');
    };
    
    // Get tag options for autocomplete from popular tags
    const tagOptions = popularTags.map(item => item.tag);

    // Function to get tag frequency info for display
    const getTagFrequency = (tag: string) => {
      const tagInfo = popularTags.find(item => item.tag === tag);
      return tagInfo ? tagInfo.count : 0;
    };

    return (
      <Dialog
        open={showPinModal}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        TransitionProps={{
          timeout: 0
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme => theme.shadows[10],
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: '8px 8px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PinDropIcon />
            <Typography variant="h6" component="span" fontWeight="500">
              {t('map.add_new_location')}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleModalClose} 
            size="small"
            sx={{ color: 'white' }}
          >
              <CloseIcon />
            </IconButton>
        </DialogTitle>
          
          <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={3}>
              {/* Location name */}
              <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label={t('map.location_name')}
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="primary" />
                  </InputAdornment>
                )
              }}
              inputProps={{ maxLength: 30 }}
              helperText={`${formState.name.length}/30`}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'right' }}>
              {formState.name.length}/30
            </Typography>
              </Grid>
              
              {/* Description */}
              <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              name="description"
              label={t('map.description')}
              value={formState.description}
              onChange={handleInputChange}
              variant="outlined"
              placeholder={t('map.describe_location')}
              inputProps={{ maxLength: 250 }}
              helperText={`${formState.description.length}/250`}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'right' }}>
              {formState.description.length}/250
            </Typography>
              </Grid>
            
              {/* Tags with autocomplete */}
              <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
                  options={tagOptions}
              value={formState.tags}
              onChange={handleTagsChange}
                  onInputChange={handleTagInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t('map.tags')}
                  placeholder={t('map.add_tags')}
                  InputProps={{
                    ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <TagIcon color="primary" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                  }}
                />
              )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const frequency = getTagFrequency(option);
                      return (
                        <Chip 
                          {...getTagProps({ index })}
                          key={index}
                          label={option}
                          color="primary" 
                          variant="outlined"
                          size="medium"
                          deleteIcon={<CloseIcon />}
                          // Add count if it's a popular tag
                          avatar={frequency > 1 ? (
                            <Avatar sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)', color: 'text.primary', fontWeight: 'bold', fontSize: '0.7rem' }}>
                              {frequency}
                            </Avatar>
                          ) : undefined}
                        />
                      );
                    })
                  }
                  renderOption={(props, option) => {
                    const frequency = getTagFrequency(option);
                    return (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body1">{option}</Typography>
                          {frequency > 0 && (
                            <Chip 
                              label={frequency} 
                              size="small" 
                              color="primary" 
                              sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.7rem' } }}
                            />
                          )}
                        </Box>
                      </li>
                    );
                  }}
                />
              </Grid>
              
              {/* Photos section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom fontWeight="500" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AddPhotoAlternateIcon color="primary" />
                    {t('map.photos')}
                  </Typography>
                  
              <input
                accept="image/*"
                id="photo-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
                  
                  {formState.photos.length === 0 ? (
                    <Box sx={{ my: 2 }}>
              <label htmlFor="photo-upload">
                <Button
                  component="span"
                  variant="outlined"
                          startIcon={<AddIcon />}
                          sx={{ borderStyle: 'dashed' }}
                >
                          {t('map.add_photos')}
                </Button>
              </label>
                      <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                        {t('map.max_photos')}
                      </Typography>
            </Box>
                  ) : (
                    <>
                      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {formState.photos.map((photo, idx) => (
                  <Box
                    key={`preview-image-${idx}`}
                            sx={{ 
                              position: 'relative', 
                              paddingTop: '100%', // 1:1 aspect ratio
                              borderRadius: 1,
                              overflow: 'hidden',
                              boxShadow: 1
                            }}
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${idx}`}
                      style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                        width: '100%',
                        height: '100%',
                                objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                      }}
                      onClick={() => handlePhotoRemove(idx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                        
                        {formState.photos.length < 4 && (
                          <Box
                            sx={{ 
                              position: 'relative', 
                              paddingTop: '100%', // 1:1 aspect ratio
                              borderRadius: 1,
                              border: '1px dashed',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <label htmlFor="photo-upload" style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}>
                              <AddIcon color="action" />
                            </label>
              </Box>
            )}
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            

            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleModalClose} 
              color="inherit"
              startIcon={<CloseIcon />}
            >
                {t('map.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              disabled={!formState.name || !formState.description || isUploading}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <AddLocationIcon />}
              >
              {isUploading ? t('map.uploading') : t('map.save_location')}
              </Button>
          </DialogActions>
          </form>
      </Dialog>
    );
  }, [pinLocation, showPinModal, t, currentUser, isUploading, popularTags, handleSubmit]);

  // Add handleDeletePin function
  const handleDeletePin = async (pinId: string) => {
    try {
      setIsDeletingPin(true);
      
      // Get location data before deletion for notification/logging purposes
      const locationDoc = await getDoc(doc(db, 'locations', pinId));
      const locationData = locationDoc.exists() ? locationDoc.data() : null;
      const locationName = locationData?.name || "Unnamed location";
      
      // Delete the location document
      await deleteDoc(doc(db, 'locations', pinId));
      
      // Success message
      let successMessage = `Pinpoint "${locationName}" deleted successfully`;
      setSnackbarMessage(successMessage);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Refresh locations to update the map
      fetchLocations();
      
    } catch (error) {
      console.error('Error deleting pinpoint:', error);
      setSnackbarMessage('Error deleting pinpoint. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeletingPin(false);
    }
  };

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }
      
      try {
        // Admin UIDs - replace with your admin users
        const adminUids = ['2wr5fAItFyXmnWOSfL42EUOW1ON2'];
        const isUserAdmin = adminUids.includes(currentUser.uid);
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [currentUser]);

  // Function to handle deleting all pinpoints
  const handleDeleteAllPins = async () => {
    if (!currentUser) {
      setSnackbarMessage('You must be logged in to delete pinpoints');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Extra security check - make sure only admins can access this functionality
    if (!isAdmin) {
      setSnackbarMessage('Only administrators can perform this action');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setDeleteAllDialogOpen(false);
      return;
    }
    
    setIsDeletingAll(true);
    
    try {
      // Show message that operation is starting
      setSnackbarMessage('Deleting pinpoints...');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      
      // Create a query based on delete option
      let pinpointsQuery;
      
      if (deleteOption === 'all' && isAdmin) {
        // Admin can delete all pinpoints
        pinpointsQuery = query(collection(db, 'locations'));
      } else {
        // Regular users can only delete their own pinpoints
        pinpointsQuery = query(
          collection(db, 'locations'),
          where('createdBy.uid', '==', currentUser.uid)
        );
      }
      
      const querySnapshot = await getDocs(pinpointsQuery);
      
      if (querySnapshot.empty) {
        setSnackbarMessage('No pinpoints to delete');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setIsDeletingAll(false);
        setDeleteAllDialogOpen(false);
        return;
      }
      
      // Use batched writes for better performance (max 500 operations per batch)
      const MAX_BATCH_SIZE = 500;
      let operationCount = 0;
      let batch = writeBatch(db);
      
      // Process the documents in batches
      for (const doc of querySnapshot.docs) {
        batch.delete(doc.ref);
        operationCount++;
        
        // If we reach the batch limit, commit and create a new batch
        if (operationCount >= MAX_BATCH_SIZE) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }
      }
      
      // Commit any remaining operations
      if (operationCount > 0) {
        await batch.commit();
      }
      
      // Success message with count
      const count = querySnapshot.size;
      const message = `Deleted ${count} pinpoint${count !== 1 ? 's' : ''}`;
      setSnackbarMessage(message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Refresh the map 
      fetchLocations();
      
    } catch (error) {
      console.error('Error deleting pinpoints:', error);
      setSnackbarMessage('Error deleting pinpoints. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeletingAll(false);
      setDeleteAllDialogOpen(false);
    }
  };

  // Update loadLocationDetails to remove feed references
  const loadLocationDetails = async (id: string | null) => {
    if (!id) {
      setLocationDetails(null);
      return;
    }
    
    setCurrentLocationId(id);
    
    try {
      const docRef = doc(db, 'locations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const locationData = docSnap.data();
        
        // Get user data for the post
        let createdByDetails = locationData.createdBy || {
          uid: 'unknown',
          displayName: 'Unknown User',
          photoURL: null
        };
        
        // Get likes (if any)
        const likes = locationData.likes || [];
        setLikes(likes);
        
        // Set location details
        const location = {
          id,
          name: locationData.name || 'Unnamed location',
          description: locationData.description || 'No description available',
          coordinates: locationData.coordinates || [0, 0],
          photos: locationData.photos || [],
          tags: locationData.tags || [],
          createdBy: createdByDetails,
          createdAt: locationData.createdAt ? locationData.createdAt.toDate() : new Date(),
          likes,
          views: locationData.views || 0,
          sponsoredUntil: locationData.sponsoredUntil ? locationData.sponsoredUntil.toDate() : undefined
        };
        
        setLocationDetails(location);
        setCurrentPhotoIndex(0);
        
        // Increment views when location details are loaded
        incrementViews(id);
      } else {
        setSnackbarMessage('Location not found');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLocationDetails(null);
      }
    } catch (error) {
      console.error('Error loading location details:', error);
      setSnackbarMessage('Error loading location details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLocationDetails(null);
    }
  };

  // Update fetchLocations to not return a Promise
  const fetchLocations = async () => {
    setMapLoading(true);
    
    try {
      const locationsQuery = query(
        collection(db, 'locations'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(locationsQuery);
      const locationsData: Location[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const location = {
          id: doc.id,
          name: data.name || 'Unnamed location',
          description: data.description || '',
          coordinates: data.coordinates || [0, 0],
          photos: data.photos || [],
          tags: data.tags || [],
          createdBy: data.createdBy || { uid: 'unknown', displayName: 'Anonymous', photoURL: null },
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          likes: data.likes || [],
          views: data.views || 0,
          sponsoredUntil: data.sponsoredUntil ? data.sponsoredUntil.toDate() : undefined
        };
        
        // Only add non-expired sponsored posts
        if (!isSponsoredExpired(location)) {
          locationsData.push(location);
        }
      });
      
      setAllLocations(locationsData);
      
      // Update markers list for map
      const markerList = locationsData.map((loc) => ({
        id: loc.id,
        coordinates: loc.coordinates,
        owner: loc.createdBy.uid === currentUser?.uid
      }));
      
      setMarkers(markerList);
      
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSnackbarMessage('Error loading locations');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setMapLoading(false);
    }
  };

  // Load locations when the component mounts
  useEffect(() => {
    fetchLocations();
    // No cleanup needed since fetchLocations doesn't return an unsubscribe function
  }, []);

  // Add effect to refetch locations when selected tags change
  useEffect(() => {
    fetchLocations();
  }, [selectedTags]);

  // Update Current Location Marker to be more visible
  const CurrentLocationMarker = () => {
    if (!currentPosition) return null;
    
    return (
      <Marker
        position={currentPosition}
        icon={L.divIcon({
          className: 'current-location-marker',
          html: `<div style="
            position: relative;
            width: 24px;
            height: 24px;
          ">
            <div style="
              background-color: #2196F3;
              border: 3px solid white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              box-shadow: 0 0 10px rgba(33, 150, 243, 0.7);
            "></div>
            <div style="
              background-color: rgba(33, 150, 243, 0.3);
              border-radius: 50%;
              width: 24px;
              height: 24px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              animation: pulse 2s infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              70% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
          </style>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })}
      />
    );
  };

  // Add useEffect to calculate trending tags
  useEffect(() => {
    const calculateTrendingTags = () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      // Count tag usage in the last 24 hours
      const tagCounts: Record<string, number> = {};
      allLocations.forEach(location => {
        if (location.createdAt >= oneDayAgo) {
          location.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // Convert to array and sort by count
      const trending = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Get top 5 trending tags
      
      setTrendingTags(trending);
    };
    
    calculateTrendingTags();
  }, [allLocations]);

  // Add function to find and center on most popular location with a tag
  const findAndCenterOnTaggedLocation = useCallback((tag: string) => {
    // Filter locations with the tag
    const taggedLocations = allLocations.filter(loc => 
      loc.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
    
    if (taggedLocations.length === 0) return;
    
    // Sort by likes count (descending) and then alphabetically by name
    const sortedLocations = [...taggedLocations].sort((a, b) => {
      const aLikes = a.likes?.length || 0;
      const bLikes = b.likes?.length || 0;
      
      if (bLikes !== aLikes) {
        return bLikes - aLikes;
      }
      return a.name.localeCompare(b.name);
    });
    
    const mostPopularLocation = sortedLocations[0];
    
    // Center map on the location
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo(mostPopularLocation.coordinates, 17, {
        animate: true,
        duration: 1.5
      }).once('moveend', () => {
        const bounds = map.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        const latOffset = (northEast.lat - southWest.lat) * 0.20;
        const targetViewCenter: [number, number] = [
          mostPopularLocation.coordinates[0] + latOffset,
          mostPopularLocation.coordinates[1]
        ];
        map.panTo(targetViewCenter, {
          animate: true,
          duration: 0.6
        });
        
        // Open the popup for the location
        const marker = markerRefs.current[mostPopularLocation.id];
        if (marker) {
          marker.openPopup();
        }
      });
    }
  }, [allLocations]);

  // Update the incrementViews function to track unique views
  const incrementViews = async (locationId: string) => {
    if (!currentUser) {
      console.log('No current user, skipping view increment');
      return;
    }
    
    try {
      console.log('Checking view for location:', locationId, 'by user:', currentUser.uid);
      
      // Check if user has already viewed this pinpoint
      const viewedRef = doc(db, 'viewedPinpoints', `${currentUser.uid}_${locationId}`);
      const viewedDoc = await getDoc(viewedRef);
      
      if (!viewedDoc.exists()) {
        console.log('First time view, incrementing counter');
        
        // User hasn't viewed this pinpoint before
        const batch = writeBatch(db);
        
        // Increment the view count
        const locationRef = doc(db, 'locations', locationId);
        batch.update(locationRef, {
          views: increment(1)
        });
        
        // Record that this user has viewed the pinpoint
        batch.set(viewedRef, {
          userId: currentUser.uid,
          locationId: locationId,
          viewedAt: serverTimestamp()
        });
        
        // Commit both operations atomically
        await batch.commit();
        console.log('Successfully incremented view count');
      } else {
        console.log('User has already viewed this pinpoint');
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Update the Location interface
  interface Location {
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
    createdAt: Date;
    likes: string[];
    views: number;
    sponsoredUntil?: Date; // Add sponsored expiration date
  }

  // Update the location creation to include views
  const newPin: Omit<Location, "id"> = {
    name: formState.name,
    description: formState.description,
    coordinates: pinLocation || [0, 0], // Provide default coordinates if null
    tags: formState.tags,
    photos: [], // We'll handle the upload separately
    createdBy: {
      uid: currentUser?.uid || 'anonymous',
      displayName: currentUser?.displayName || null,
      photoURL: currentUser?.photoURL || null
    },
    createdAt: new Date(),
    likes: [],
    views: 0,
    // Add sponsored expiration if it's a sponsored post
    ...(formState.tags.includes('Sponsored') && {
      sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    })
  };

  // Add this function near the top of the component, after the other utility functions
  const animateToLocation = (map: L.Map, location: Location) => {
    const marker = markerRefs.current[location.id];
    const currentZoom = map.getZoom();
    const targetZoom = currentZoom < 10 ? 17 : currentZoom;
    
    // Calculate distance between current center and target location
    const currentCenter = map.getCenter();
    const distance = currentCenter.distanceTo(L.latLng(location.coordinates));
    
    // Adjust animation duration based on distance
    const duration = distance > 100000 ? 2.0 : 
                    distance > 50000 ? 1.5 :
                    distance > 10000 ? 1.0 : 0.8;
    
    // Calculate the optimal view center with offset to show pinpoint in lower portion
    const bounds = map.getBounds();
    const latSpan = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
    const latOffset = latSpan * 0.3; // Increased offset to position pinpoint lower
    
    const finalViewCenter: [number, number] = [
      location.coordinates[0] + latOffset,
      location.coordinates[1]
    ];

    // First zoom out slightly if we're very close
    if (currentZoom > targetZoom + 2) {
      map.flyTo(finalViewCenter, targetZoom - 1, {
        animate: true,
        duration: duration * 0.4,
        easeLinearity: 0.25
      }).once('moveend', () => {
        // Then zoom in to the final position
        map.flyTo(finalViewCenter, targetZoom, {
          animate: true,
          duration: duration * 0.6,
          easeLinearity: 0.25
        }).once('moveend', () => {
          ensureMarkerVisibility(map, location, marker);
        });
      });
    } else {
      // Direct animation if we're at a good distance
      map.flyTo(finalViewCenter, targetZoom, {
        animate: true,
        duration: duration,
        easeLinearity: 0.25
      }).once('moveend', () => {
        ensureMarkerVisibility(map, location, marker);
      });
    }
  };

  // Helper function to ensure marker is visible and properly positioned
  const ensureMarkerVisibility = (map: L.Map, location: Location, marker: L.Marker | undefined) => {
    if (marker) {
      const markerLatLng = marker.getLatLng();
      const isVisible = map.getBounds().contains(markerLatLng);
      
      if (!isVisible) {
        const bounds = map.getBounds();
        const latSpan = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
        const newCenter: [number, number] = [
          location.coordinates[0] + (latSpan * 0.3),
          location.coordinates[1]
        ];
        
        map.setView(newCenter, map.getZoom(), {
          animate: true,
          duration: 0.3,
          easeLinearity: 0.25
        });
      }
      
      // Open the popup after ensuring visibility
      if (!marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  };

  // Update the Marker event handlers
  {displayLocations.map((location) => {
    const isOwner = currentUser?.uid === location.createdBy.uid;
    const isSelected = selectedPinId === location.id;
    const isSponsored = location.tags.includes('Sponsored');
    
    return (
      <Marker
        key={location.id}
        position={location.coordinates}
        icon={createPinIcon({ 
          isOwner, 
          isSelected,
          locationId: location.id,
          isSponsored
        })}
        eventHandlers={{
          popupopen: () => {
            setSelectedPinId(location.id);
            incrementViews(location.id);
            if (mapRef.current) {
              animateToLocation(mapRef.current, location);
            }
          },
          popupclose: () => {
            setSelectedPinId(null);
          },
          click: (e) => {
            // Only handle click if the popup is not already open
            const marker = markerRefs.current[location.id];
            if (marker && !marker.isPopupOpen()) {
              setSelectedPinId(location.id);
              incrementViews(location.id);
              if (mapRef.current) {
                animateToLocation(mapRef.current, location);
              }
            }
          },
          moveend: () => {
            // Ensure marker position is updated after movement
            const marker = markerRefs.current[location.id];
            if (marker) {
              marker.setLatLng(location.coordinates);
            }
          }
        }}
        ref={el => {
          if (el) {
            markerRefs.current[location.id] = el;
            // Force initial position update
            el.setLatLng(location.coordinates);
          }
        }}
      >
        <Popup>
          {location.photos && location.photos.length > 0 ? (
            <LocationCard location={location} />
          ) : (
            <Box sx={{ maxWidth: 500, color: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#fff', fontSize: '1.5rem' }}>{location.name}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }}>{location.description}</Typography>
              {isOwner && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      setDeleteTargetId(location.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Popup>
      </Marker>
    );
  })}

  // ... rest of the code ...

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Tag Search Bar with suggestions and trending tags */}
      <Box sx={{
        ...modernStyles.tagSearchContainer,
        width: { xs: '90vw', sm: 400, md: 320 },
        p: { xs: 0.5, sm: 1 },
        top: { xs: 0, sm: 10, md: 16 },
        minHeight: { xs: 44, sm: 'unset' },
        display: { xs: areMenusVisible ? 'block' : 'none', sm: 'block' }
      }}>
        {/* Row for search bar and buttons on mobile */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 0.5,
          mb: { xs: 1, sm: 0 },
        }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by tag..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            sx={{
              minWidth: 0,
              flex: 1,
              p: { xs: 0.5, sm: 1.5 },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                fontSize: { xs: '0.8rem', sm: '1rem' },
                height: { xs: 36, sm: 40 },
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    opacity: 1,
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TagIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} />
                </InputAdornment>
              ),
              endAdornment: tagSearch && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setTagSearch('')}
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      p: { xs: 0.5, sm: 1 }
                    }}
                  >
                    <ClearIcon sx={{ fontSize: { xs: '1rem', sm: '1.3rem' } }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {/* Mobile Add Pinpoint & Current Location Buttons */}
          <Box sx={{
            display: { xs: 'flex', sm: 'none' },
            flexDirection: 'row',
            gap: 0.5,
            alignItems: 'center',
            height: 36,
          }}>
            <Fab
              size="small"
              onClick={toggleAddLocationMode}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#222',
                boxShadow: 2,
                minHeight: 28,
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                },
                border: isAddingLocation ? '2px solid #2196f3' : undefined,
              }}
            >
              <AddLocationIcon sx={{ fontSize: '1rem' }} />
            </Fab>
            <Fab
              size="small"
              onClick={handleLocateMe}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#222',
                boxShadow: 2,
                minHeight: 28,
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              <MyLocationIcon sx={{ fontSize: '1rem' }} />
            </Fab>
          </Box>
        </Box>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5, 
            mt: 1, 
            px: { xs: 1, sm: 1.5 }
          }}>
            {selectedTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: '#fff'
                    }
                  }
                }}
              />
            ))}
            {selectedTags.length > 0 && (
              <Chip
                label="Clear All"
                size="small"
                onClick={() => setSelectedTags([])}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              />
            )}
          </Box>
        )}
        
        {/* Tag Suggestions */}
        {suggestedTags.length > 0 && (
          <Box
            sx={{
              mt: 0.5,
              maxHeight: { xs: 150, sm: 200 },
              overflowY: 'auto',
              px: { xs: 1, sm: 1.5 },
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
              },
            }}
          >
            {suggestedTags.map((tagInfo) => (
              <Box
                key={tagInfo.tag}
                onClick={() => {
                  // Add tag to selected tags if not already selected
                  if (!selectedTags.includes(tagInfo.tag)) {
                    const newTags = [...selectedTags, tagInfo.tag];
                    setSelectedTags(newTags);
                    // Find matching locations and open a random one
                    const matchingLocations = allLocations.filter(location => 
                      newTags.every(tag => location.tags.includes(tag))
                    );
                    if (matchingLocations.length > 0) {
                      const randomLocation = matchingLocations[Math.floor(Math.random() * matchingLocations.length)];
                      if (mapRef.current) {
                        animateToLocation(mapRef.current, randomLocation);
                        const marker = markerRefs.current[randomLocation.id];
                        if (marker) {
                          marker.openPopup();
                        }
                      }
                    }
                  }
                  setTagSearch('');
                }}
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.75, sm: 1 },
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  }}
                >
                  {tagInfo.tag}
                </Typography>
                <Chip
                  label={tagInfo.count}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    height: { xs: 18, sm: 20 },
                    '& .MuiChip-label': {
                      px: { xs: 0.75, sm: 1 },
                      py: { xs: 0.25, sm: 0.5 },
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
        
        {/* Trending Tags Section */}
        <Box sx={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          mt: { xs: 0.5, sm: 1 },
          pt: { xs: 0.5, sm: 1 },
          px: { xs: 0.5, sm: 2 },
          pb: { xs: 0.5, sm: 1.5 }
        }}>
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Tooltip title="Trending Tags (24h)">
              <TrendingUpIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }} />
            </Tooltip>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 500 }}>
              24h
            </Typography>
          </Box>
          <Typography
            sx={{
              display: { xs: 'none', sm: 'flex' },
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { sm: '0.8rem' },
              fontWeight: 500,
              mb: 1,
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <TrendingUpIcon sx={{ fontSize: { sm: '1rem' } }} />
            Trending Tags (24h)
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.4, sm: 0.5 } }}>
            {trendingTags.map((tagInfo) => (
              <Chip
                key={tagInfo.tag}
                label={`${tagInfo.tag} (${tagInfo.count})`}
                size="small"
                onClick={() => {
                  // Add tag to selected tags if not already selected
                  if (!selectedTags.includes(tagInfo.tag)) {
                    const newTags = [...selectedTags, tagInfo.tag];
                    setSelectedTags(newTags);
                    // Find matching locations and open a random one
                    const matchingLocations = allLocations.filter(location => 
                      newTags.every(tag => location.tags.includes(tag))
                    );
                    if (matchingLocations.length > 0) {
                      const randomLocation = matchingLocations[Math.floor(Math.random() * matchingLocations.length)];
                      if (mapRef.current) {
                        animateToLocation(mapRef.current, randomLocation);
                        const marker = markerRefs.current[randomLocation.id];
                        if (marker) {
                          marker.openPopup();
                        }
                      }
                    }
                  }
                  setTagSearch('');
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  height: { xs: 22, sm: 24 },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                  '& .MuiChip-label': {
                    px: { xs: 0.75, sm: 1 },
                    py: { xs: 0.25, sm: 0.5 },
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  },
                }}
              />
            ))}
            {trendingTags.length === 0 && (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  fontStyle: 'italic'
                }}
              >
                No trending tags in the last 24 hours
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Map Container - Fixed position in background */}
      <Box
        sx={modernStyles.mapContainer}
        onMouseMove={handleMapMouseMove}
        onMouseLeave={() => setPinPosition(null)}
        translate="no"
        className="notranslate"
        lang="en"
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
          minZoom={3}
          maxZoom={18}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          inertia={true}
          inertiaDeceleration={2000}    // Increased for smoother deceleration
          inertiaMaxSpeed={15000}       // Increased for smoother movement
          easeLinearity={0.65}          // Increased for smoother transitions
          zoomAnimation={true}
          zoomAnimationThreshold={4}
          fadeAnimation={true}
          markerZoomAnimation={true}
        >
          <EventsComponent />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            noWrap={true}
            bounds={MAX_BOUNDS}
            keepBuffer={4}
            maxNativeZoom={19}
            maxZoom={18}
            updateWhenIdle={true}
            updateWhenZooming={true}
          />
          
          <CursorMarkerComponent />
          
          {/* Update Markers to use displayLocations instead of locations */}
          {displayLocations.map((location) => {
            const isOwner = currentUser?.uid === location.createdBy.uid;
            const isSelected = selectedPinId === location.id;
            const isSponsored = location.tags.includes('Sponsored');
            
            return (
              <Marker
                key={location.id}
                position={location.coordinates}
                icon={createPinIcon({ 
                  isOwner, 
                  isSelected,
                  locationId: location.id,
                  isSponsored
                })}
                eventHandlers={{
                  popupopen: () => {
                    setSelectedPinId(location.id);
                    incrementViews(location.id);
                    if (mapRef.current) {
                      animateToLocation(mapRef.current, location);
                    }
                  },
                  popupclose: () => {
                    setSelectedPinId(null);
                  },
                  click: (e) => {
                    // Only handle click if the popup is not already open
                    const marker = markerRefs.current[location.id];
                    if (marker && !marker.isPopupOpen()) {
                      setSelectedPinId(location.id);
                      incrementViews(location.id);
                      if (mapRef.current) {
                        animateToLocation(mapRef.current, location);
                      }
                    }
                  },
                  moveend: () => {
                    // Ensure marker position is updated after movement
                    const marker = markerRefs.current[location.id];
                    if (marker) {
                      marker.setLatLng(location.coordinates);
                    }
                  }
                }}
                ref={el => {
                  if (el) {
                    markerRefs.current[location.id] = el;
                    // Force initial position update
                    el.setLatLng(location.coordinates);
                  }
                }}
              >
                <Popup>
                  {location.photos && location.photos.length > 0 ? (
                    <LocationCard location={location} />
                  ) : (
                    <Box sx={{ maxWidth: 500, color: '#fff' }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontSize: '1.5rem' }}>{location.name}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }}>{location.description}</Typography>
                      {isOwner && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeleteDialogOpen(true);
                              setDeleteTargetId(location.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  )}
                </Popup>
              </Marker>
            );
          })}

          {/* Current Location Marker */}
          {currentPosition && <CurrentLocationMarker />}

          {/* Route Polyline */}
          {route && (
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: '#4CAF50',
                weight: 6,
                opacity: 0.7,
              }}
            />
          )}

          {/* Loading indicator while locating */}
          {isLocating && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2,
                boxShadow: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <CircularProgress size={24} />
              <Typography>Finding your location...</Typography>
            </Box>
          )}
        </MapContainer>
      </Box>

      {/* Zoom Controls - Fixed position */}
      <Box sx={{
        ...modernStyles.zoomControls,
        display: { xs: 'none', sm: 'flex' }, // Hide on mobile (xs), show on sm and up
        opacity: areMenusVisible ? 1 : 0,
        pointerEvents: areMenusVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}>
        <Fab
          size="small"
          onClick={() => mapRef.current?.zoomIn()}
          sx={modernStyles.controlButton}
        >
          <AddIcon />
        </Fab>
        <Fab
          size="small"
          onClick={() => mapRef.current?.zoomOut()}
          sx={modernStyles.controlButton}
        >
          <RemoveIcon />
        </Fab>
      </Box>

      {/* Map Controls - Fixed position */}
      <Box sx={{
        ...modernStyles.mapControls,
        display: { xs: 'none', sm: 'flex' },
        opacity: areMenusVisible ? 1 : 0,
        pointerEvents: areMenusVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}>
        <Fab
          size="medium"
          onClick={toggleAddLocationMode}
          sx={{
            ...modernStyles.controlButton,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#222',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
            border: isAddingLocation ? '2px solid #2196f3' : undefined,
          }}
        >
          <AddLocationIcon />
        </Fab>
        <Fab
          size="medium"
          onClick={handleLocateMe}
          sx={modernStyles.controlButton}
        >
          <MyLocationIcon />
        </Fab>
        {/* Add Delete All button - Only for admin users */}
        {currentUser && isAdmin && (
          <Fab
            size="medium"
            onClick={() => setDeleteAllDialogOpen(true)}
            sx={{
              ...modernStyles.controlButton,
              backgroundColor: 'rgba(255, 67, 67, 0.9)',
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 67, 67, 0.95)',
              },
              mt: 1
            }}
            aria-label="Delete all pinpoints"
          >
            <DeleteSweepIcon />
          </Fab>
        )}
      </Box>

      {/* Error Alert - Fixed position */}
      {showGeoError && (
        <Alert
          severity="error"
          sx={modernStyles.alerts}
          onClose={() => setShowGeoError(false)}
        >
          {geoError}
        </Alert>
      )}

      {/* Floating Pin */}
      {isAddingLocation && pinPosition && (
        <Box
          sx={{
            position: 'fixed',
            left: pinPosition.x,
            top: pinPosition.y,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 1000,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="#ff4444"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
          </svg>
        </Box>
      )}

      {/* Snackbar with fixed positioning */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={modernStyles.snackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle>Delete Pinpoint</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this pinpoint? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteTargetId) {
                handleDeletePin(deleteTargetId);
                setDeleteDialogOpen(false);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog 
        open={deleteAllDialogOpen} 
        onClose={() => setDeleteAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Delete Pinpoints
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            As an admin, you can delete all pinpoints or just your own. This action cannot be undone.
          </Typography>
          
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={deleteOption}
              onChange={(e) => setDeleteOption(e.target.value as 'mine' | 'all')}
            >
              <FormControlLabel value="mine" control={<Radio />} label="Delete only my pinpoints" />
              <FormControlLabel value="all" control={<Radio />} label="Delete ALL pinpoints (admin only)" />
            </RadioGroup>
          </FormControl>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {deleteOption === 'all' 
                ? 'This will permanently delete ALL pinpoints created by ALL users on the map.' 
                : 'This will permanently delete all pinpoints that you have created.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAllPins}
            color="error"
            variant="contained"
            disabled={isDeletingAll}
            startIcon={isDeletingAll ? <CircularProgress size={20} color="inherit" /> : <DeleteSweepIcon />}
          >
            {isDeletingAll ? 'Deleting...' : 'Delete Pinpoints'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Details Card */}
      {locationDetails && (
        <Card sx={modernStyles.locationCard}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, pb: 0.75, gap: 1 }}>
            <IconButton onClick={() => setLocationDetails(null)} size="small" sx={{ mr: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
              {locationDetails.name}
            </Typography>
            <IconButton onClick={() => setLocationDetails(null)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <LocationCard location={locationDetails} />
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, pt: 0.75 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DirectionsIcon />}
              onClick={() => handleNavigate(locationDetails)}
              size="small"
            >
              Navigate
            </Button>
            {currentUser && (currentUser.uid === locationDetails.createdBy.uid || isAdmin) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setDeleteDialogOpen(true);
                  setDeleteTargetId(locationDetails.id);
                }}
                size="small"
              >
                Delete
              </Button>
            )}
          </Box>
        </Card>
      )}
      <DistancePopup />

      {/* Success and Error messages */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Add Filter Section with visibility control */}
      <Paper
        elevation={0}
        sx={{
          ...modernStyles.filterMenu,
          opacity: { xs: areMenusVisible ? 1 : 0, sm: 1 },
          pointerEvents: { xs: areMenusVisible ? 'auto' : 'none', sm: 'auto' },
          transition: 'all 0.3s ease',
          transform: { 
            xs: areMenusVisible ? 'translateY(0)' : 'translateY(20px)',
            sm: 'translateY(0)'
          },
        }}
      >
        {/* Minimalist 2x2 grid for mobile */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tooltip title={t('map.posts_in_area')} placement="top">
                <IconButton
                  onClick={() => setShowNearbyOnly(!showNearbyOnly)}
                  sx={{
                    backgroundColor: showNearbyOnly ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    p: 1,
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: showNearbyOnly ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <MyLocationIcon sx={{ fontSize: 18, color: showNearbyOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: '0.65rem', color: showNearbyOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', mt: 0.5, textAlign: 'center' }}>
                {t('map.posts_in_area')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tooltip title={t('map.posted_last_24h')} placement="top">
                <IconButton
                  onClick={() => setShowRecentOnly(!showRecentOnly)}
                  sx={{
                    backgroundColor: showRecentOnly ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    p: 1,
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: showRecentOnly ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 18, color: showRecentOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: '0.65rem', color: showRecentOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', mt: 0.5, textAlign: 'center' }}>
                {t('map.posted_last_24h')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tooltip title={t('map.made_by_friends')} placement="top">
                <IconButton
                  onClick={() => setShowFriendsOnly(!showFriendsOnly)}
                  sx={{
                    backgroundColor: showFriendsOnly ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    p: 1,
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: showFriendsOnly ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <GroupIcon sx={{ fontSize: 18, color: showFriendsOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: '0.65rem', color: showFriendsOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', mt: 0.5, textAlign: 'center' }}>
                {t('map.made_by_friends')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tooltip title={t('map.made_by_you')} placement="top">
                <IconButton
                  onClick={() => setShowMineOnly(!showMineOnly)}
                  sx={{
                    backgroundColor: showMineOnly ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    p: 1,
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: showMineOnly ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <PersonIcon sx={{ fontSize: 18, color: showMineOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: '0.65rem', color: showMineOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', mt: 0.5, textAlign: 'center' }}>
                {t('map.made_by_you')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Desktop filter section */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', width: '100%' }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: '#fff', 
              px: 1.5, 
              pb: 1.5,
              borderBottom: '1px solid rgba(255,255,255,0.12)', 
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            {t('map.additional_filters')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5, px: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showNearbyOnly}
                  onChange={(e) => setShowNearbyOnly(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MyLocationIcon sx={{ fontSize: 18, color: showNearbyOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography variant="body2" sx={{ color: showNearbyOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {t('map.posts_in_area')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showRecentOnly}
                  onChange={(e) => setShowRecentOnly(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: showRecentOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography variant="body2" sx={{ color: showRecentOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {t('map.posted_last_24h')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showFriendsOnly}
                  onChange={(e) => setShowFriendsOnly(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon sx={{ fontSize: 18, color: showFriendsOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography variant="body2" sx={{ color: showFriendsOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {t('map.made_by_friends')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showMineOnly}
                  onChange={(e) => setShowMineOnly(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: showMineOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography variant="body2" sx={{ color: showMineOnly ? '#fff' : 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {t('map.made_by_you')}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default MapPage 