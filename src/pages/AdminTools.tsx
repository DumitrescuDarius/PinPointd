import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, doc, deleteDoc, writeBatch, getDoc, query, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminTools = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [success, setSuccess] = useState('');

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Replace with your actual admin UIDs or use a Firestore collection to manage admin users
      const adminUids = ['IzankXNslASrGJpxYZ6xRxBL9p62']; // Example - replace with your admin UID
      if (adminUids.includes(currentUser.uid)) {
        setIsAdmin(true);
      } else {
        // Not an admin, redirect
        setError('Access denied. You must be an admin to view this page.');
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  // Fetch collections
  const fetchCollections = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const collectionsMap = await getDocs(collection(db, '_root_'));
      
      // This won't work directly in the client SDK, so we'll simulate by listing known collections
      // In a real application, you would create a Cloud Function to list collections
      const knownCollections = [
        'users', 
        'locations', 
        'posts', 
        'comments', 
        'likes', 
        'notifications', 
        'chats',
        'messages',
        'friendRequests'
      ];
      
      setCollections(knownCollections);
      
      // Get counts for each collection
      const counts: Record<string, number> = {};
      for (const collName of knownCollections) {
        try {
          const countQuery = query(collection(db, collName), limit(1000));
          const snapshot = await getDocs(countQuery);
          counts[collName] = snapshot.size;
          // Note: this only counts up to 1000 documents
        } catch (e) {
          console.log(`Collection ${collName} not found or empty`);
          counts[collName] = 0;
        }
      }
      
      setCollectionCounts(counts);
    } catch (err: any) {
      setError('Error fetching collections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCollections();
    }
  }, [isAdmin]);

  const handleDeleteCollection = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setConfirmDialogOpen(true);
    setConfirmText('');
  };

  const confirmDelete = async () => {
    if (confirmText !== selectedCollection) {
      setError(`Please type "${selectedCollection}" to confirm deletion`);
      return;
    }

    setIsDeleting(true);
    setError('');
    
    try {
      const collectionRef = collection(db, selectedCollection);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        setSuccess(`Collection "${selectedCollection}" is already empty.`);
        setConfirmDialogOpen(false);
        setIsDeleting(false);
        return;
      }
      
      // Delete in batches to respect quotas
      const batchSize = 100;
      let count = 0;
      
      if (snapshot.size <= batchSize) {
        // Small collection, use batch
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          count++;
        });
        
        await batch.commit();
      } else {
        // Large collection, delete one by one with delay
        for (const document of snapshot.docs) {
          await deleteDoc(doc(db, selectedCollection, document.id));
          count++;
          
          // Add small delay every 20 documents to avoid quota issues
          if (count % 20 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Update the UI periodically
          if (count % 10 === 0) {
            setSuccess(`Deleted ${count} documents so far...`);
          }
        }
      }
      
      setSuccess(`Successfully deleted ${count} documents from "${selectedCollection}"`);
      
      // Refresh the list
      fetchCollections();
    } catch (err: any) {
      setError('Error deleting collection: ' + err.message);
    } finally {
      setIsDeleting(false);
      setConfirmDialogOpen(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. You must be an admin to view this page.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">Database Management</Typography>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={fetchCollections}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Warning: Deleting collections is a destructive operation and cannot be undone.
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {collections.length === 0 ? (
              <ListItem>
                <ListItemText primary="No collections found" />
              </ListItem>
            ) : (
              collections.map((collection) => (
                <ListItem key={collection} divider>
                  <ListItemText 
                    primary={collection} 
                    secondary={`Documents: ${collectionCounts[collection] || 'Unknown'}`} 
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={collectionCounts[collection] || 0} 
                      color={collectionCounts[collection] > 0 ? 'primary' : 'default'} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteCollection(collection)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Paper>
      
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete all documents in the collection <strong>{selectedCollection}</strong>. 
            This action cannot be undone. Type the collection name to confirm.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="confirmation"
            label={`Type "${selectedCollection}" to confirm`}
            type="text"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            disabled={isDeleting || confirmText !== selectedCollection}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete Collection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTools; 