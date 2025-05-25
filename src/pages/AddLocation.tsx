import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Autocomplete,
  useTheme,
  alpha,
} from '@mui/material';
import { PhotoCamera, Close, Add } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadImage } from '../config/cloudinary';
import { useTranslation } from 'react-i18next';

interface AddLocationProps {
  open: boolean;
  onClose: () => void;
  coordinates: [number, number];
  onSuccess: () => void;
}

const CATEGORIES = [
  'Landmark',
  'Restaurant',
  'Hotel',
  'Museum',
  'Park',
  'Beach',
  'Shopping',
  'Other',
];

const TAGS = [
  'Tourist Spot',
  'Historical',
  'Architecture',
  'Nature',
  'Food',
  'Shopping',
  'Entertainment',
  'Sports',
  'Culture',
  'Nightlife',
];

const AddLocation: React.FC<AddLocationProps> = ({
  open,
  onClose,
  coordinates,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    setPhotos([...photos, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Upload photos to Cloudinary
      const photoUrls = await Promise.all(
        photos.map((photo) => uploadImage(photo))
      );

      // Add location to Firestore
      await addDoc(collection(db, 'locations'), {
        name,
        description,
        coordinates,
        rating: rating || 0,
        category,
        tags,
        photos: photoUrls,
        createdBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        },
        createdAt: new Date(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to add location. Please try again.');
      console.error('Error adding location:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Add New Location
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
              required
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            multiple
            options={TAGS}
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags"
                variant="outlined"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              ))
            }
          />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, value) => setRating(value)}
              precision={0.5}
              size="large"
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Photos (max 5)
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                mb: 1,
              }}
            >
              {previewUrls.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removePhoto(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {photos.length < 5 && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    width: 100,
                    height: 100,
                    borderStyle: 'dashed',
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                  />
                  Add Photo
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Add />}
        >
          {isSubmitting ? 'Adding...' : 'Add Location'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLocation; 