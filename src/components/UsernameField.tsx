import { useState, useEffect } from 'react';
import { TextField, Typography } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

interface UsernameFieldProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  disabled?: boolean;
  currentUsername?: string;
  autoFocus?: boolean;
  required?: boolean;
}

const UsernameField = ({ 
  value, 
  onChange, 
  disabled = false, 
  currentUsername = '',
  autoFocus = false,
  required = true
}: UsernameFieldProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const validateUsername = (username: string): boolean => {
    // Check if empty when required
    if (!username.trim() && required) {
      setError(t('auth.username.errors.required'));
      return false;
    }

    // Check if it's the current username (no change)
    if (username.trim() === currentUsername) {
      setError('');
      return true;
    }

    // Check length
    if (username.length < 3 || username.length > 20) {
      setError(t('auth.username.errors.length'));
      return false;
    }

    // Check if username contains only lowercase letters, numbers, dots, and underscores
    const validCharsRegex = /^[a-z0-9]+([._][a-z0-9]+)*$/;
    if (!validCharsRegex.test(username)) {
      setError(t('auth.username.errors.format'));
      return false;
    }

    // Check if username starts or ends with a dot or underscore
    if (username.startsWith('.') || username.startsWith('_') || 
        username.endsWith('.') || username.endsWith('_')) {
      setError(t('auth.username.errors.start_end'));
      return false;
    }

    // Check for consecutive dots or underscores
    if (username.includes('..') || username.includes('__') || 
        username.includes('._') || username.includes('_.')) {
      setError(t('auth.username.errors.consecutive'));
      return false;
    }

    return true;
  };

  const checkUsername = async (username: string) => {
    const trimmedUsername = username.trim();

    // Always accept current username without any checks
    if (trimmedUsername === currentUsername) {
      setError('');
      onChange(username, true);
      return;
    }

    // Handle empty username
    if (!trimmedUsername) {
      setError(required ? t('auth.username.errors.required') : '');
      onChange(username, !required);
      return;
    }

    // First validate the username format
    if (!validateUsername(trimmedUsername)) {
      onChange(username, false);
      return;
    }

    // Only check availability if it's a different username
    if (trimmedUsername !== currentUsername) {
      setIsChecking(true);
      try {
        const q = query(collection(db, 'users'), where('username', '==', trimmedUsername));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          setError(t('auth.username.errors.taken'));
          onChange(username, false);
        } else {
          setError('');
          onChange(username, true);
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setError(t('auth.username.errors.verify_failed'));
        onChange(username, false);
      } finally {
        setIsChecking(false);
      }
    }
  };

  // Increase debounce time to avoid interrupting typing
  const debouncedCheck = debounce(checkUsername, 1000);

  useEffect(() => {
    if (!value) {
      setError('');
      onChange(value, !required);
      return;
    }

    // Convert to lowercase and trim
    const lowercaseValue = value.toLowerCase();
    
    // If it's the current username, accept it immediately
    if (lowercaseValue === currentUsername) {
      setError('');
      onChange(lowercaseValue, true);
      return;
    }

    // If the value contained uppercase letters, convert it to lowercase
    if (lowercaseValue !== value) {
      onChange(lowercaseValue, false);
      return;
    }

    // Only check availability for new usernames
    debouncedCheck(lowercaseValue);

    return () => debouncedCheck.cancel();
  }, [value]);

  return (
    <>
      <TextField
        label={t('auth.username.username')}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value.toLowerCase();
          // Immediately valid if it's current username
          if (newValue === currentUsername) {
            onChange(newValue, true);
            setError('');
          } else {
            onChange(newValue, false);
          }
        }}
        fullWidth
        required={required}
        disabled={disabled || isChecking}
        autoFocus={autoFocus}
        error={!!error}
        helperText={error || (isChecking ? t('auth.username.checking') : t('auth.username.format_help'))}
      />
    </>
  );
};

export default UsernameField; 