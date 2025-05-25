import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  getAuth,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, googleProvider, app } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  checkEmailVerification: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      setLoading(false);
    });

    // Check for redirect result
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('Redirect sign-in successful:', result.user);
      }
    }).catch((error) => {
      console.error('Redirect sign-in error:', error);
    });

    return unsubscribe;
  }, [auth]);

  const signupWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      
      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      // Try popup first
      try {
        console.log('Attempting popup sign-in...');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup sign-in successful:', result.user);
        return;
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect:', popupError);
        
        // If popup fails, try redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Please allow popups for this website or try using a different browser');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
      } else {
        throw new Error(`Failed to sign in with Google: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const sendPasswordReset = async (email: string) => {
    await firebaseSendPasswordResetEmail(auth, email);
  };

  // New function to check if a user's email is verified in Firestore
  const checkEmailVerification = async (userId: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.emailVerified === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    signupWithEmail,
    login,
    loginWithGoogle,
    logout,
    registerWithEmail: signupWithEmail,
    sendPasswordReset,
    checkEmailVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 