import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { createPinpointNotification } from '../services/NotificationService';
import { uploadImage } from '../config/cloudinary';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper,
  Autocomplete,
  InputAdornment,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Divider,
  useTheme,
  Fade,
  Grow,
  Zoom,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Tag as TagIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Share as ShareIcon,
  Crop as CropIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';

interface FormState {
  name: string;
  description: string;
  tags: string[];
  photos: File[];
  videos: File[];
  socialShare: boolean;
  isPublic: boolean;
  shareNote?: string;
  isBusinessPost: boolean;
}

interface LocationState {
  coordinates: [number, number];
  popularTags: { tag: string; count: number }[];
}

// Add interface for crop area
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const AddPinpoint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Add error state
  const [error, setError] = useState<string | null>(null);

  // Safely get location state
  const locationState = location.state as LocationState | null;
  const coordinates = locationState?.coordinates;
  const popularTags = locationState?.popularTags || [];

  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);

  // Update useEffect to fetch token count with better error handling
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          setTokenCount(0);
          setIsBusiness(false);
          return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.error('User document not found');
          setTokenCount(0);
          setIsBusiness(false);
          return;
        }

        const userData = userDoc.data();
        const userTokenCount = userData?.tokenCount;
        
        // Ensure tokens is a valid number
        if (typeof userTokenCount !== 'number' || isNaN(userTokenCount)) {
          console.error('Invalid token count:', userTokenCount);
          setTokenCount(0);
        } else {
          console.log('Fetched token count:', userTokenCount); // Debug log
          setTokenCount(userTokenCount);
        }

        // Set business status
        setIsBusiness(!!userData.isBusiness);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setTokenCount(0);
        setIsBusiness(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Validate required location state
  useEffect(() => {
    if (!coordinates) {
      setError('No location selected. Please select a location on the map first.');
    }
  }, [coordinates]);

  const [formState, setFormState] = useState<FormState>({
    name: '',
    description: '',
    tags: [],
    photos: [],
    videos: [],
    socialShare: true,
    isPublic: true,
    shareNote: '',
    isBusinessPost: false
  });

  const [isUploading, setIsUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [inputValue, setInputValue] = useState('');

  const [cropperOpen, setCropperOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<Blob | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [aspect] = useState(16 / 9);
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<'crop' | 'move'>('crop');
  const [loadingImages, setLoadingImages] = useState<boolean[]>([]);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'name') {
      newValue = value.slice(0, 50);
    } else if (name === 'description') {
      newValue = value.slice(0, 250);
    }
    setFormState(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleTagsChange = (_: any, newValue: string[]) => {
    // Filter out "Sponsored" from manual additions
    const filteredTags = newValue.filter(tag => tag !== 'Sponsored');
    
    // If it's a business post, add "Sponsored" tag
    const finalTags = formState.isBusinessPost 
      ? [...filteredTags, 'Sponsored']
      : filteredTags;

    setFormState(prev => ({
      ...prev,
      tags: finalTags
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'photos' | 'videos') => {
    console.log('handleMediaUpload called with files:', e.target.files);
    
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      console.log('New files to add:', newFiles);
      
      const totalMediaCount = formState[mediaType].length + newFiles.length;
      console.log('Total media count:', totalMediaCount);
      
      if (totalMediaCount > 4) {
        setSnackbarMessage(`Maximum of 4 ${mediaType} allowed`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      if (mediaType === 'photos') {
        // For photos, open the cropper with the first image
        const file = newFiles[0];
        console.log('First file for cropping:', file);
        
        const imageUrl = URL.createObjectURL(file);
        setCurrentImage(file);
        setCurrentImageIndex(-1); // -1 means new image
        setCropperOpen(true);
        
        // Store the remaining images for later cropping
        if (newFiles.length > 1) {
          const remainingFiles = newFiles.slice(1);
          console.log('Remaining files to add:', remainingFiles);
          
          // Set loading state for new images
          const newLoadingState = [...loadingImages];
          remainingFiles.forEach((_, index) => {
            newLoadingState[formState.photos.length + index] = true;
          });
          setLoadingImages(newLoadingState);
          
          // Add remaining files to form state
          setFormState(prev => {
            console.log('Previous photos:', prev.photos);
            const updatedPhotos = [...prev.photos, ...remainingFiles];
            console.log('Updated photos:', updatedPhotos);
            return {
            ...prev,
              photos: updatedPhotos
            };
          });
        }
      } else {
        // For videos, just add them to the form state
        setFormState(prev => ({
          ...prev,
          [mediaType]: [...prev[mediaType], ...newFiles]
        }));
      }
    }
  };

  const handleMediaRemove = (indexToRemove: number, mediaType: 'photos' | 'videos') => {
    setFormState(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coordinates || !formState.name || !formState.description) {
      setSnackbarMessage('Please fill in all required fields (Title, Description, etc.)');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    // Require at least one photo
    if (!formState.photos || formState.photos.length === 0) {
      setSnackbarMessage('Please upload at least one photo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Check if user has enough tokens for business post
    if (formState.isBusinessPost) {
      const userRef = doc(db, 'users', currentUser?.uid || '');
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData || userData.tokenCount < 1) {
        setSnackbarMessage('Not enough tokens to create a business post');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    setIsUploading(true);

    // --- NEW: Reverse geocode city from coordinates ---
    let cityTag = null;
    try {
      if (coordinates) {
        const [lat, lon] = coordinates;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
        if (response.ok) {
          const data = await response.json();
          // Try to get city, town, or village
          cityTag = data.address.city || data.address.town || data.address.village || data.address.county || null;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      setSnackbarMessage('Could not determine city for tag. Pinpoint will be added without city tag.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }

    try {
      // Handle photo uploads
      const compressedPhotos = await uploadCompressedImages(formState.photos);
      const photoUrls = await Promise.all(compressedPhotos.map(photo => uploadImage(photo)));

      // Handle tags - ensure no duplicate Sponsored tag
      let tags = [...formState.tags];
      if (formState.isBusinessPost && !tags.includes('Sponsored')) {
        tags.push('Sponsored');
      }
      // Add city tag if found and not already present
      if (cityTag && !tags.includes(cityTag)) {
        tags.push(cityTag);
      }

      // Create the location document
      const newPin = {
        name: formState.name,
        description: formState.description,
        coordinates: coordinates,
        tags: tags,
        photos: photoUrls,
        views: 0,
        isBusinessPost: formState.isBusinessPost,
        createdBy: {
          uid: currentUser?.uid || 'anonymous',
          displayName: currentUser?.displayName || null,
          photoURL: currentUser?.photoURL || null
        },
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'locations'), newPin);

      // If it's a business post, consume a token
      if (formState.isBusinessPost) {
        const userRef = doc(db, 'users', currentUser?.uid || '');
        await updateDoc(userRef, {
          tokenCount: increment(-1)
        });
      }

      // Create notifications for friends if the pinpoint is public
      if (formState.isPublic && currentUser) {
        // Get user's friends
        const friendsQuery = query(
          collection(db, 'friends'),
          where('users', 'array-contains', currentUser.uid)
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        
        // Create notifications for each friend
        const notificationPromises = friendsSnapshot.docs.map(async (friendDoc) => {
          const friendData = friendDoc.data();
          const friendId = friendData.users.find((id: string) => id !== currentUser.uid);
          
          if (friendId) {
            await createPinpointNotification(
              {
                uid: currentUser.uid,
                displayName: currentUser.displayName || '',
                photoURL: currentUser.photoURL || ''
              },
              friendId,
              docRef.id
            );
          }
        });
        
        await Promise.all(notificationPromises);
      }
      
      // Navigate back to map with success
      navigate(`/map?location=${docRef.id}`);
    } catch (error) {
      console.error('Error adding pinpoint:', error);
      setSnackbarMessage('Error adding pinpoint. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsUploading(false);
    }
  };

  // Function to get tag frequency info for display
  const getTagFrequency = (tag: string) => {
    const tagInfo = popularTags.find(item => item.tag === tag);
    return tagInfo ? tagInfo.count : 0;
  };

  // Add new handlers for cropping
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
    generatePreview(croppedAreaPixels);
  }, [currentImage, rotation]);

  const generatePreview = useCallback(async (pixelCrop: CropArea) => {
    if (!pixelCrop || !currentImage) return;

    try {
      const image = new Image();
      image.src = URL.createObjectURL(currentImage as Blob);
      
      // Wait for image to load
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(croppedImageUrl);
    } catch (e) {
      console.error('Error generating preview:', e);
    }
  }, [currentImage]);

  const createCroppedImage = async () => {
    if (!currentImage || !croppedAreaPixels) return null;

    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = URL.createObjectURL(currentImage);
      
      // Wait for image to load
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg');
      });
    } catch (e) {
      console.error('Error creating cropped image:', e);
      return null;
    }
  };

  const handleCropSave = async () => {
    if (!currentImage) return;

    try {
      const croppedFile = await createCroppedImage();
      if (!croppedFile) {
        console.error('Failed to create cropped image');
        return;
      }

      if (currentImageIndex === -1) {
        // Adding new cropped image
        console.log('Adding new cropped image');
        const newIndex = formState.photos.length;
        setLoadingImages(prev => [...prev, true]);
        setFormState(prev => {
          const updatedPhotos = [...prev.photos, croppedFile];
          return {
            ...prev,
            photos: updatedPhotos
          };
        });
      } else {
        // Replacing existing image
        console.log('Replacing existing image at index:', currentImageIndex);
        setLoadingImages(prev => [...prev.slice(0, currentImageIndex), true, ...prev.slice(currentImageIndex + 1)]);
        setFormState(prev => {
          const newPhotos = [...prev.photos];
          newPhotos[currentImageIndex] = croppedFile;
          return {
            ...prev,
            photos: newPhotos
          };
        });
      }

      setCropperOpen(false);
      setCurrentImage(null);
      setCurrentImageIndex(-1);
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (e) {
      console.error('Error saving cropped image:', e);
    }
  };

  // Add image load handler
  const handleImageLoad = (index: number) => {
    console.log('Image loaded at index:', index);
    setLoadingImages(prev => [...prev.slice(0, index), false, ...prev.slice(index + 1)]);
  };

  const handleEditImage = (index: number) => {
    const file = formState.photos[index];
    const imageUrl = URL.createObjectURL(file);
    setCurrentImage(file);
    setCurrentImageIndex(index);
    setCropperOpen(true);
    // Reset cropper state
    setPreviewUrl(null);
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const newRotation = direction === 'left' 
      ? (rotation - 90) % 360 
      : (rotation + 90) % 360;
    setRotation(newRotation);
    
    // Regenerate preview with new rotation
    if (croppedAreaPixels) {
      generatePreview(croppedAreaPixels);
    }
  };

  const handleDragModeToggle = () => {
    setDragMode(prevMode => prevMode === 'crop' ? 'move' : 'crop');
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    setPreviewUrl(null);
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (currentImage) {
      URL.revokeObjectURL(URL.createObjectURL(currentImage as Blob));
    }
  };

  // Update the business post section to handle tags
  const renderBusinessPostSection = () => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          {t('map.business_post')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('map.tokens')}: {tokenCount === null ? '...' : tokenCount}
          </Typography>
          <Switch
            checked={formState.isBusinessPost}
            onChange={(e) => {
              const isBusinessPost = e.target.checked;
              setFormState(prev => ({
                ...prev,
                isBusinessPost,
                // Only add Sponsored tag if it's not already there
                tags: isBusinessPost && !prev.tags.includes('Sponsored')
                  ? [...prev.tags, 'Sponsored']
                  : prev.tags.filter(tag => !isBusinessPost && tag !== 'Sponsored')
              }));
            }}
            disabled={tokenCount === null || tokenCount < 1}
          />
        </Box>
      </Box>
      {formState.isBusinessPost ? (
        <Typography variant="body2" color="text.secondary">
          {t('map.business_post_featured')}
        </Typography>
      ) : tokenCount === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="error">
            {t('map.need_tokens')}
          </Typography>
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => navigate('/tokens')}
            startIcon={<MonetizationOnIcon />}
          >
            {t('map.buy_tokens')}
          </Button>
        </Box>
      ) : null}
    </Paper>
  );

  // If there's an error, show it
  if (error) {
  return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/map')}
            startIcon={<ArrowBackIcon />}
          >
            {t('map.back_to_map')}
          </Button>
        </Paper>
      </Box>
    );
  }

  // If no coordinates, show error
  if (!coordinates) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error" gutterBottom>
            {t('map.no_location_selected')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/map')}
            startIcon={<ArrowBackIcon />}
          >
            {t('map.back_to_map')}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Grow in timeout={800}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
                {t('map.add_new_pinpoint')}
          </Typography>
        </Box>

            <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
                {/* Name field */}
          <Grid item xs={12}>
                  <Zoom in timeout={1000} style={{ transitionDelay: '100ms' }}>
            <TextField
              fullWidth
              required
              name="name"
              label={t('map.title')}
              value={formState.name}
              onChange={handleInputChange}
              variant="outlined"
              autoComplete="off"
              placeholder={t('map.enter_title')}
              inputProps={{ maxLength: 50 }}
              helperText={`${formState.name.length}/50`}
            />
                  </Zoom>
          </Grid>

                {/* Description field */}
          <Grid item xs={12}>
                  <Zoom in timeout={1000} style={{ transitionDelay: '200ms' }}>
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
              autoComplete="off"
              placeholder={t('map.enter_description')}
              inputProps={{ maxLength: 250 }}
              helperText={`${formState.description.length}/250`}
            />
                  </Zoom>
          </Grid>

          {/* Tags with autocomplete */}
          <Grid item xs={12}>
                  <Zoom in timeout={1000} style={{ transitionDelay: '300ms' }}>
            <Autocomplete
              multiple
              freeSolo
              options={popularTags
                .filter(tag => 
                  !formState.tags.includes(tag.tag) &&
                  tag.tag !== 'Sponsored' && // Filter out Sponsored from available tags
                  (!inputValue || tag.tag.toLowerCase().startsWith(inputValue.toLowerCase()))
                )
                .sort((a, b) => b.count - a.count)
                .map(item => item.tag)
              }
              value={formState.isBusinessPost ? formState.tags : formState.tags.filter(tag => tag !== 'Sponsored')}
              onChange={handleTagsChange}
              onInputChange={(event, newInputValue) => {
                // Prevent typing 'Sponsored'
                if (newInputValue.toLowerCase() === 'sponsored') {
                  setInputValue('');
                } else {
                  setInputValue(newInputValue);
                }
              }}
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
                value.filter(option => formState.isBusinessPost || option !== 'Sponsored').map((option, index) => {
                  const frequency = getTagFrequency(option);
                  const isSponsored = option === 'Sponsored';
                  return (
                    <Chip
                      {...getTagProps({ index })}
                      key={index}
                      label={option}
                      color={isSponsored ? "warning" : "primary"}
                      variant={isSponsored ? "filled" : "outlined"}
                      size="medium"
                      avatar={frequency > 1 && !isSponsored ? (
                        <Avatar sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)', color: 'text.primary', fontWeight: 'bold', fontSize: '0.7rem' }}>
                          {frequency}
                        </Avatar>
                      ) : undefined}
                      sx={isSponsored ? {
                        bgcolor: '#FFD700',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#FFC800' },
                        '& .MuiChip-label': { color: '#000000' },
                      } : undefined}
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
                  </Zoom>
          </Grid>

          {/* Photos */}
          <Grid item xs={12}>
                  <Zoom in timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddPhotoAlternateIcon color="primary" />
                {t('map.photos')}
              </Typography>

              <input
                accept="image/*"
                id="photo-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleMediaUpload(e, 'photos')}
              />

              {formState.photos.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 2 }}>
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
                <Grid container spacing={2} sx={{ mt: 2 }}>
                          {formState.photos.map((photo, idx) => {
                            console.log('Rendering photo at index:', idx, photo);
                            return (
                    <Grid item xs={3} key={idx}>
                                <Grow in timeout={500} style={{ transitionDelay: `${idx * 100}ms` }}>
                      <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                                    {loadingImages[idx] && (
                                      <Skeleton
                                        variant="rectangular"
                                        animation="wave"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          borderRadius: 8
                                        }}
                                      />
                                    )}
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${idx}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                                        borderRadius: 8,
                                        opacity: loadingImages[idx] ? 0 : 1,
                                        transition: 'opacity 0.3s ease-in-out'
                          }}
                                      onLoad={() => handleImageLoad(idx)}
                        />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          display: 'flex', 
                          gap: 1 
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditImage(idx)}
                            sx={{
                              bgcolor: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                            }}
                          >
                            <CropIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMediaRemove(idx, 'photos')}
                            sx={{
                              bgcolor: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                                </Grow>
                    </Grid>
                            );
                          })}
                  {formState.photos.length < 4 && (
                    <Grid item xs={3}>
                              <Grow in timeout={500} style={{ transitionDelay: `${formState.photos.length * 100}ms` }}>
                      <label htmlFor="photo-upload">
                        <Paper
                          variant="outlined"
                          sx={{
                            paddingTop: '100%',
                            position: 'relative',
                            cursor: 'pointer',
                            borderStyle: 'dashed'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <AddIcon color="action" />
                          </Box>
                        </Paper>
                      </label>
                              </Grow>
                    </Grid>
                  )}
                </Grid>
              )}
            </Paper>
                  </Zoom>
          </Grid>

        {/* Business Post Toggle - Only show if user has business account */}
        <Grid item xs={12}>
          {isBusiness && (
            <Zoom in timeout={1000} style={{ transitionDelay: '550ms' }}>
              {renderBusinessPostSection()}
            </Zoom>
          )}
        </Grid>

        {/* Submit button */}
                <Grid item xs={12}>
                  <Zoom in timeout={1000} style={{ transitionDelay: '600ms' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formState.name || !formState.description || isUploading || formState.photos.length === 0}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {isUploading ? t('map.saving') : t('map.save_pinpoint')}
          </Button>
        </Box>
                  </Zoom>
                </Grid>
              </Grid>
            </form>
      </Paper>
        </Grow>

        {/* Add the Cropper Dialog */}
      <Dialog
        open={cropperOpen}
        onClose={handleCropperClose}
          maxWidth="md"
        fullWidth
      >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Crop Image</Typography>
              <IconButton onClick={handleCropperClose}>
            <CloseIcon />
          </IconButton>
            </Box>
        </DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', height: 400, width: '100%', bgcolor: 'black' }}>
              {currentImage && (
                <Cropper
                  image={URL.createObjectURL(currentImage as Blob)}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  rotation={rotation}
                />
              )}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => handleRotate('left')}>
                <RotateLeftIcon />
                </IconButton>
              <IconButton onClick={() => handleRotate('right')}>
                <RotateRightIcon />
              </IconButton>
              <IconButton onClick={() => setZoom(prev => Math.min(prev + 0.1, MAX_ZOOM))}>
                  <ZoomInIcon />
                </IconButton>
              <IconButton onClick={() => setZoom(prev => Math.max(prev - 0.1, MIN_ZOOM))}>
                <ZoomOutIcon />
                </IconButton>
              <IconButton onClick={handleDragModeToggle}>
                <FullscreenIcon />
                </IconButton>
          </Box>
        </DialogContent>
          <DialogActions>
            <Button onClick={handleCropperClose}>Cancel</Button>
            <Button onClick={handleCropSave} variant="contained" color="primary">
              Save
          </Button>
        </DialogActions>
      </Dialog>

        {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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
    </Box>
    </Fade>
  );
};

// Update the function that uploads images to compress them first
const uploadCompressedImages = async (images: File[]): Promise<File[]> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  const compressed: File[] = [];
  for (const img of images) {
    try {
      const compressedFile = await imageCompression(img, options);
      compressed.push(compressedFile);
    } catch (err) {
      console.error('Image compression failed, using original', err);
      compressed.push(img);
    }
  }
  return compressed;
};

export default AddPinpoint; 