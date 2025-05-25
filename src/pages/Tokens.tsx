import React from 'react';
import { Box, Typography, Paper, Button, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useState, useEffect } from 'react';

const TokensPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isBusiness, setIsBusiness] = useState(false);
  const [openBuy, setOpenBuy] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!currentUser) return;
    // Fetch isBusiness from Firestore
    db && doc && getDoc && (async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setIsBusiness(!!userDoc.data().isBusiness);
      }
    })();
  }, [currentUser]);

  const handleBuy = async () => {
    if (!currentUser) return;
    // Mock payment process here (replace with Stripe/PayPal integration in production)
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      // Atomically increment tokenCount
      await updateDoc(userRef, {
        tokenCount: increment(buyAmount)
      });
      setSnackbar({ open: true, message: `Successfully purchased ${buyAmount} token${buyAmount > 1 ? 's' : ''}!`, severity: 'success' });
      setOpenBuy(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to purchase tokens. Please try again.', severity: 'error' });
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: 6,
      px: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper elevation={4} sx={{
        maxWidth: 600,
        width: '100%',
        p: 4,
        borderRadius: 4,
        background: 'rgba(30, 32, 38, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        mb: 4,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <MonetizationOnIcon sx={{ fontSize: 40, color: '#FFD600' }} />
          <Typography variant="h4" fontWeight={700} color="primary">
            Boost Your Business with Tokens
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Unlock new earning opportunities by creating token-based posts that reach more customers and increase your visibility.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="subtitle1" fontWeight={600}>
                Get Discovered
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Token-based posts are promoted to a wider audience, helping your business stand out and attract new customers.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MonetizationOnIcon color="warning" />
              <Typography variant="subtitle1" fontWeight={600}>
                Earn More
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Each token-based post increases your earning potential by driving more engagement and sales to your business.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AddCircleOutlineIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Easy to Use
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Creating a token-based post is simple. Just select the token option when posting and watch your reach grow!
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="info" />
              <Typography variant="subtitle1" fontWeight={600}>
                Track Your Success
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Monitor your token balance and post performance in real time to optimize your business strategy.
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          {isBusiness && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MonetizationOnIcon />}
              onClick={() => setOpenBuy(true)}
              sx={{ fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 3, mb: 2 }}
            >
              Buy Tokens (10€ each)
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/map?add=pinpoint')}
            sx={{ fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 3 }}
          >
            Create a Token-Based Post
          </Button>
        </Box>
      </Paper>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 600, textAlign: 'center' }}>
        Need help? Contact our support team to learn more about how tokens can help your business grow.
      </Typography>
      <Dialog open={openBuy} onClose={() => setOpenBuy(false)}>
        <DialogTitle>Buy Tokens</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Each token costs <b>10€</b>. Select how many tokens you want to buy:
          </Typography>
          <TextField
            type="number"
            label="Amount"
            value={buyAmount}
            onChange={e => setBuyAmount(Math.max(1, Math.min(20, Number(e.target.value))))}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Typography sx={{ mt: 2 }}>
            <b>Total:</b> {(buyAmount * 10).toFixed(2)} €
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBuy(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleBuy}>
            Pay & Buy
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TokensPage; 