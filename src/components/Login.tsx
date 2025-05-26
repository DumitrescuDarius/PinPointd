import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from './Login.module.css';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import ForgotPasswordDialog from './ForgotPasswordDialog';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      // Attempt to sign in
      await login(email, password);
      
      // Check if user needs to verify their email
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // If user has verification code but hasn't verified email, they'll be shown the verification dialog
          // No need to block navigation here as App.tsx will show the verification dialog
        }
      }
      
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else {
        setError('Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to sign in with Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = loading || googleLoading;

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
            Welcome Back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.subtitle}
          >
            Sign in to your account
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

        {googleLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.googleLoading}
          >
            <FiLoader className={styles.spinner} />
            Waiting for Google connection...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <FiMail className={styles.icon} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Email address"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            type="submit"
            className={styles.button}
          >
            <FiLogIn />
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className={styles.forgotPassword}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowForgotPassword(true)}
            className={styles.link}
            disabled={isLoading}
          >
            Forgot Password?
          </motion.button>
        </div>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={styles.googleButton}
        >
          {googleLoading ? (
            <>
              <FiLoader className={styles.spinner} />
              Connecting...
            </>
          ) : (
            <>
              <FcGoogle />
              Sign in with Google
            </>
          )}
        </motion.button>

        <div className={styles.footer}>
          Don't have an account?
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/register')}
            className={styles.link}
            disabled={isLoading}
          >
            Create Account
          </motion.button>
        </div>
      </div>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login; 