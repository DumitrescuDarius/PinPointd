import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, IconButton, Skeleton, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';
import { useTranslation } from 'react-i18next';

interface SavedPinpoint {
  id: string;
  pinpointId: string;
  userId: string;
  savedAt: Date;
  pinpointData: {
    name: string;
    description: string;
    photos: string[];
    coordinates: [number, number];
    createdBy: {
      uid: string;
      displayName: string | null;
      photoURL: string | null;
    };
  };
}

const SavedPinpoints = () => {
  const [savedPinpoints, setSavedPinpoints] = useState<SavedPinpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSavedPinpoints = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const savedPinpointsRef = collection(db, 'savedPinpoints');
        const q = query(savedPinpointsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        const pinpoints: SavedPinpoint[] = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          // Fetch the actual pinpoint data
          const pinpointDoc = await getDoc(doc(db, 'locations', data.pinpointId));
          
          if (pinpointDoc.exists()) {
            pinpoints.push({
              id: docSnapshot.id,
              pinpointId: data.pinpointId,
              userId: data.userId,
              savedAt: data.savedAt.toDate(),
              pinpointData: pinpointDoc.data() as SavedPinpoint['pinpointData']
            });
          }
        }

        // Sort by most recently saved
        pinpoints.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
        setSavedPinpoints(pinpoints);
      } catch (err) {
        console.error('Error fetching saved pinpoints:', err);
        setError('Failed to load saved pinpoints');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPinpoints();
  }, [currentUser]);

  const handleViewOnMap = (pinpointId: string, coordinates: [number, number]) => {
    navigate(`/map?location=${pinpointId}`, { 
      state: { 
        center: coordinates, 
        zoom: 15 
      } 
    });
  };

  const handleDelete = async (savedId: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'savedPinpoints', savedId));
      // Update local state
      setSavedPinpoints(prev => prev.filter(p => p.id !== savedId));
    } catch (err) {
      console.error('Error deleting saved pinpoint:', err);
      setError('Failed to delete saved pinpoint');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={n}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Saved Pinpoints
      </Typography>

      {savedPinpoints.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You haven't saved any pinpoints yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {savedPinpoints.map((saved) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={saved.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => handleViewOnMap(saved.pinpointId, saved.pinpointData.coordinates)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={saved.pinpointData.photos[0] || '/placeholder-image.jpg'}
                  alt={saved.pinpointData.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {saved.pinpointData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {saved.pinpointData.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Saved {new Date(saved.savedAt).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDelete(saved.id);
                        }}
                        color="error"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SavedPinpoints; 