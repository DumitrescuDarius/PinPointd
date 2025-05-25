import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { updatePassword, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface PasswordPromptDialogProps {
  open: boolean;
  onPasswordSet: () => void;
  currentUser: any;
}

const PasswordPromptDialog = ({ open, onPasswordSet, currentUser }: PasswordPromptDialogProps) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.password.errors.min_length'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.password.errors.mismatch'));
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate with Google first
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(currentUser, provider);

      // Now we can set up the password
      await updatePassword(currentUser, password);

      // Mark password setup as complete
      await updateDoc(doc(db, 'users', currentUser.uid), {
        hasSetupPassword: true
      });

      onPasswordSet();
    } catch (err: any) {
      console.error('Error setting up password:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError(t('auth.password.errors.security_reason'));
      } else {
        setError(t('auth.password.errors.setup_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown onClose={() => {}}>
      <DialogTitle>{t('auth.password.title')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {t('auth.password.description')}
          </Typography>
          <TextField
            label={t('auth.password.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('auth.password.confirm_password')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : t('auth.password.set_password')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PasswordPromptDialog; 