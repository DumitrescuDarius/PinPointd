import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import { sendEmailVerification as resendVerificationEmail } from 'firebase/auth';
import RefreshIcon from '@mui/icons-material/Refresh';

interface EmailVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({
  open,
  onClose,
  onVerificationComplete
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (open) {
      setVerificationCode('');
      setError('');
      setSuccess(false);
      setRemainingAttempts(3);
      setResendSuccess(false);
    }
  }, [open]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      if (!currentUser) return;
      
      // Generate a new verification code (6 digits)
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update the verification code in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        verificationCode: newVerificationCode,
        verificationCodeCreatedAt: new Date()
      });
      
      // Send a new verification email
      await resendVerificationEmail(currentUser, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError(t('auth.email_verification.errors.resend_failed'));
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t('auth.email_verification.errors.invalid_code'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!currentUser) {
        setError(t('auth.email_verification.errors.not_authenticated'));
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError(t('auth.email_verification.errors.user_not_found'));
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const correctCode = userData.verificationCode;

      // Check if code is correct
      if (verificationCode === correctCode) {
        // Mark email as verified
        await updateDoc(userRef, {
          emailVerified: true,
          verificationCode: null  // Remove the verification code
        });
        
        setSuccess(true);
        
        // Notify parent component that verification is complete
        setTimeout(() => {
          onVerificationComplete();
          onClose();
        }, 2000);
      } else {
        // Decrease remaining attempts
        setRemainingAttempts(prev => prev - 1);
        
        if (remainingAttempts <= 1) {
          setError(t('auth.email_verification.errors.too_many_attempts'));
        } else {
          setError(t('auth.email_verification.errors.invalid_code_retry'));
        }
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(t('auth.email_verification.errors.general_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={remainingAttempts > 0 && !loading ? onClose : undefined}>
      <DialogTitle>
        {t('auth.email_verification.title')}
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.email_verification.success')}
            </Alert>
            <Typography variant="body1">
              {t('auth.email_verification.access_features')}
            </Typography>
          </Box>
        ) : (
          <>
            <DialogContentText>
              {t('auth.email_verification.check_email')}
            </DialogContentText>
            
            <Box sx={{ mt: 2, mb: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label={t('auth.email_verification.verification_code')}
                type="text"
                fullWidth
                value={verificationCode}
                onChange={(e) => {
                  // Only allow numeric input with max 6 characters
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                placeholder="123456"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        title={t('auth.email_verification.resend_code')}
                      >
                        {resendLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RefreshIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
            
            {resendSuccess && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {t('auth.email_verification.code_sent')}
              </Alert>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {t('auth.email_verification.attempts_remaining')}: {remainingAttempts}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!success && (
          <>
            <Button onClick={onClose} disabled={loading}>
              {t('auth.email_verification.cancel')}
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6 || loading || remainingAttempts <= 0}
              color="primary"
              variant="contained"
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t('auth.email_verification.verify')
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmailVerificationDialog; 