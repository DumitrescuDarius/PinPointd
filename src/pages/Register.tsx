import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiCheckCircle, FiLoader } from 'react-icons/fi';
import styles from './Register.module.css';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const validateForm = () => {
    let valid = true;
    
    // Clear previous errors
    setError('');
    setPasswordError('');
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      valid = false;
    }
    
    // Enhanced password strength check
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      valid = false;
    } else if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSymbols) {
      setPasswordError('Password must include uppercase letters, lowercase letters, numbers, and symbols');
      valid = false;
    }
    
    // Check terms acceptance
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      valid = false;
    }
    
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name to the full name
      await updateProfile(userCredential.user, { displayName: fullName });
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
        friends: [],
        friendRequests: [],
        sentRequests: [],
        blocked: [],
        emailVerified: false,
      });
      
      // Send verification email with link
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false, // Use link verification instead of code
      });
      
      // Show success message
      setRegistrationComplete(true);
    } catch (e: any) {
      let errorMessage = e.message;
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try to login.';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  // Show success screen after registration
  if (registrationComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.title}
            >
              {t('auth.registration_complete')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={styles.subtitle}
            >
              {t('auth.we_ve_sent_a_verification_link_to')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={styles.emailHighlight}
            >
              {email}
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.verificationMessage}
          >
            {t('auth.please_check_your_inbox_and_click_the_verification_link_to_activate_your_account')}
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.button}
            onClick={() => navigate('/login')}
          >
            <FiCheckCircle />
            {t('auth.go_to_login')}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.title}
          >
            {t('auth.create_account')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.subtitle}
          >
            {t('auth.join_today')}
          </motion.p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.error}
          >
            {error}
          </motion.div>
        )}

        {passwordError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.error}
          >
            {passwordError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <FiUser className={styles.icon} />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              placeholder="Full Name"
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <FiMail className={styles.icon} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Email address"
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Password"
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirm Password"
              disabled={loading}
            />
          </div>

          <div className={styles.passwordHint}>
            Password must include uppercase, lowercase, numbers, and special characters
          </div>

          <div className={styles.termsContainer}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              id="terms"
              className={styles.checkbox}
              disabled={loading}
            />
            <label htmlFor="terms" className={styles.termsLabel}>
              I accept the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
                Terms and Conditions
              </a>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            type="submit"
            className={styles.button}
          >
            {loading ? (
              <>
                <FiLoader className={styles.spinner} />
                {t('auth.creating_account')}
              </>
            ) : (
              t('auth.create_account')
            )}
          </motion.button>
        </form>

        <div className={styles.footer}>
          {t('auth.already_have_account')}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/login')}
            className={styles.link}
            disabled={loading}
          >
            {t('auth.sign_in')}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Register; 