import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onClose
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError(t('auth.forgot_password.errors.invalid_email'));
      } else if (err.code === 'auth/user-not-found') {
        setError(t('auth.forgot_password.errors.user_not_found'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('auth.forgot_password.errors.too_many_requests'));
      } else {
        setError(t('auth.forgot_password.errors.send_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('auth.forgot_password.title')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('auth.forgot_password.description')}
          </DialogContentText>

          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.forgot_password.success')}
            </Alert>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label={t('auth.forgot_password.email')}
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {success ? t('auth.forgot_password.back_to_login') : t('auth.email_verification.cancel')}
          </Button>
          {!success && (
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !email}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t('auth.forgot_password.send_link')
              )}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ForgotPasswordDialog; 