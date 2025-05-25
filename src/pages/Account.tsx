import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Account.module.css';
import { FiUser, FiMail, FiLock, FiLogOut, FiSave, FiTrash2, FiX, FiCamera } from 'react-icons/fi';
import UsernameField from '../components/UsernameField';
import { uploadImage } from '../config/cloudinary';
import { collection, getDocs, query, where } from 'firebase/firestore';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const AccountPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');
  const [name, setName] = useState(currentUser?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [profileImage, setProfileImage] = useState<{ file?: File; preview: string }>({
    preview: currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'User')}&background=random`
  });
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || '');
          setCurrentUsername(userData.username || '');
          setIsBusiness(!!userData.isBusiness);
          setBusinessName(userData.businessName || '');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const validatePasswords = () => {
    if (newPassword && !currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    if (newPassword && newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage({
          file,
          preview: reader.result as string
        });
        setMessage({ type: '', text: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords() || !isUsernameValid) return;
    if (isBusiness && !businessName.trim()) {
      setMessage({ type: 'error', text: 'Business name is required for business accounts.' });
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      if (!currentUser) throw new Error('No user logged in');

      // Upload new profile picture if changed
      let photoURL = currentUser.photoURL;
      if (profileImage?.file) {
        try {
          photoURL = await uploadImage(profileImage.file);
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          setMessage({ type: 'error', text: 'Failed to upload profile picture' });
          setIsLoading(false);
          return;
        }
      }

      // Update user profile - keep display name unchanged
      await updateProfile(currentUser, {
        displayName: name,
        photoURL
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        username: username.trim(),
        displayName: name,
        photoURL,
        isBusiness,
        businessName: isBusiness ? businessName.trim() : ''
      });

      // Handle password change if provided
      if (currentPassword && newPassword && newPassword === confirmPassword) {
        const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentUsername(username);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.code === 'auth/wrong-password' 
          ? 'Current password is incorrect' 
          : 'Failed to update profile. Please try again.'
      });
      console.error('Error updating profile:', error);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      setMessage({ type: 'error', text: 'Failed to log out. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !deletePassword) return;

    try {
      setIsLoading(true);
      setDeleteError('');

      // Verify password before deletion
      const credential = EmailAuthProvider.credential(currentUser.email!, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete all user's pinpoints
      const locationsRef = collection(db, 'locations');
      const q = query(locationsRef, where('createdBy.uid', '==', currentUser.uid));
      const userPinpointsQuery = await getDocs(q);
      
      console.log(`Found ${userPinpointsQuery.size} pinpoints to delete`);
      
      // Delete each pinpoint one by one to ensure they're all deleted
      for (const doc of userPinpointsQuery.docs) {
        console.log(`Deleting pinpoint ${doc.id}`);
        await deleteDoc(doc.ref);
      }

      console.log('All pinpoints deleted');

      // Delete account
      await updateDoc(doc(db, 'users', currentUser.uid), { deleted: true });
      await deleteUser(currentUser);
      await logout();
      navigate('/');
    } catch (error: any) {
      console.error('Full error details:', error);
      setDeleteError(
        error.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : 'Failed to delete account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      overflowY: 'auto',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingBottom: '2rem'
    }}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={styles.content}
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.header 
            className={styles.header}
            variants={fadeIn}
          >
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Account Settings
            </motion.h1>
            <motion.button 
              className={styles.logoutButton} 
              onClick={handleLogout}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiLogOut /> {isLoading ? 'Logging out...' : 'Logout'}
            </motion.button>
          </motion.header>

          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div 
                className={message.type === 'success' ? styles.success : styles.error}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            onSubmit={handleSave}
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className={styles.profileSection}
              variants={staggerChildren}
            >
              <motion.div 
                className={styles.profileImageContainer}
                variants={staggerChildren}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.img
                  src={profileImage.preview}
                  alt="Profile"
                  className={styles.profileImage}
                />
                <motion.label 
                  className={styles.imageUploadLabel}
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                >
                  <FiCamera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.imageInput}
                    disabled={isLoading}
                  />
                </motion.label>
              </motion.div>
            </motion.div>

            <motion.div 
              className={styles.infoSection}
              variants={staggerChildren}
            >
              <motion.div 
                className={styles.inputGroup}
                variants={fadeIn}
              >
                <label className={styles.label}>
                  <FiUser /> Username
                </label>
                <UsernameField
                  value={username}
                  onChange={(value, valid) => {
                    setUsername(value);
                    setIsUsernameValid(valid);
                  }}
                  disabled={isLoading}
                  currentUsername={currentUsername}
                />
              </motion.div>

              <motion.div 
                className={styles.inputGroup}
                variants={fadeIn}
              >
                <label className={styles.label}>
                  <FiUser /> Display Name
                </label>
                <motion.input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="Display name"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <motion.div 
                className={styles.inputGroup}
                variants={fadeIn}
              >
                <label className={styles.label}>
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  className={styles.input}
                  disabled
                />
              </motion.div>

              <motion.div className={styles.inputGroup} variants={fadeIn}>
                <label className={styles.label}>
                  <FiUser /> Business Account
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={isBusiness}
                    onChange={e => setIsBusiness(e.target.checked)}
                    disabled={isLoading}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14 }}>Enable business account</span>
                </div>
              </motion.div>

              {isBusiness && (
                <motion.div className={styles.inputGroup} variants={fadeIn}>
                  <label className={styles.label}>
                    <FiUser /> Business Name
                  </label>
                  <motion.input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className={styles.input}
                    placeholder="Business name"
                    required={isBusiness}
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              className={styles.section}
              variants={fadeIn}
            >
              <motion.h2 
                className={styles.sectionTitle}
                variants={fadeIn}
              >
                Change Password
              </motion.h2>
              <AnimatePresence>
                {passwordError && (
                  <motion.div 
                    className={styles.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {passwordError}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div 
                className={styles.passwordGrid}
                variants={staggerChildren}
              >
                <motion.div 
                  className={styles.inputGroup}
                  variants={fadeIn}
                >
                  <label className={styles.label}>
                    <FiLock /> Current Password
                  </label>
                  <motion.input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className={styles.input}
                    placeholder="Current password"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                <motion.div 
                  className={styles.inputGroup}
                  variants={fadeIn}
                >
                  <label className={styles.label}>
                    <FiLock /> New Password
                  </label>
                  <motion.input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className={styles.input}
                    placeholder="New password"
                    minLength={6}
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                <motion.div 
                  className={styles.inputGroup}
                  variants={fadeIn}
                >
                  <label className={styles.label}>
                    <FiLock /> Confirm Password
                  </label>
                  <motion.input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className={styles.input}
                    placeholder="Confirm new password"
                    minLength={6}
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.button 
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSave /> {isLoading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </motion.form>

          <motion.div 
            className={styles.section}
            variants={fadeIn}
          >
            <motion.h2 
              className={styles.sectionTitle}
              variants={fadeIn}
            >
              Danger Zone
            </motion.h2>
            <motion.p 
              className={styles.dangerText}
              variants={fadeIn}
            >
              Once you delete your account, there is no going back. Please be certain.
            </motion.p>
            <motion.button 
              className={styles.deleteButton} 
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiTrash2 /> Delete Account
            </motion.button>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div 
              className={styles.modal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={styles.modalContent}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <motion.button 
                  className={styles.modalClose}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>

                <motion.h2 
                  className={styles.modalTitle}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  Delete Account
                </motion.h2>
                <motion.p 
                  className={styles.modalText}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Are you sure you want to delete your account? This action
                  cannot be undone. All your data will be permanently deleted.
                </motion.p>

                <motion.form 
                  onSubmit={handleDeleteAccount}
                  variants={staggerChildren}
                >
                  <AnimatePresence>
                    {deleteError && (
                      <motion.div 
                        className={styles.error}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {deleteError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div 
                    className={styles.inputGroup}
                    variants={fadeIn}
                  >
                    <label className={styles.label}>
                      <FiLock /> Confirm your password
                    </label>
                    <motion.input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError('');
                      }}
                      className={styles.input}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      whileFocus={{ scale: 1.01 }}
                    />
                  </motion.div>

                  <motion.div 
                    className={styles.modalActions}
                    variants={staggerChildren}
                  >
                    <motion.button
                      type="button"
                      className={styles.modalCancel}
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                        setDeleteError('');
                      }}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className={styles.modalDelete}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? 'Deleting...' : 'Delete Account'}
                    </motion.button>
                  </motion.div>
                </motion.form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AccountPage; 