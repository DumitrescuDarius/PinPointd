import { AppBar, Toolbar, Typography, Button, Box, Tooltip, IconButton, Drawer, Avatar, Divider, Badge } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import MapIcon from '@mui/icons-material/Map'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/NewLogo.png'
import { useTranslation } from 'react-i18next'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MenuIcon from '@mui/icons-material/Menu'
import { useState, createContext, useContext, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import Notifications from './Notifications'
import PeopleIcon from '@mui/icons-material/People'
import ChatIcon from '@mui/icons-material/Chat'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

// Create a context for drawer state
export const NavbarContext = createContext<{
  closeAllDrawers: () => void;
  notifyDrawerOpened: (component: string) => void;
  currentlyOpenDrawer: string | null;
}>({
  closeAllDrawers: () => {},
  notifyDrawerOpened: () => {},
  currentlyOpenDrawer: null,
});

interface NavbarProps {
  onMenuClick?: () => void;
  isLeftDrawerOpen?: boolean;
  onRightDrawerOpen?: () => void;
}

const Navbar = ({ onMenuClick, isLeftDrawerOpen, onRightDrawerOpen }: NavbarProps) => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentlyOpenDrawer, setCurrentlyOpenDrawer] = useState<string | null>(null)
  const theme = useTheme()
  const [isBusiness, setIsBusiness] = useState(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsBusiness(!!data.isBusiness);
        setTokenCount(typeof data.tokenCount === 'number' ? data.tokenCount : 0);
        setUsername(data.username || '');
        setBusinessName(data.businessName || '');
        // Check if user is admin
        const adminUids = ['IzankXNslASrGJpxYZ6xRxBL9p62']; // Add your admin UIDs here
        setIsAdmin(adminUids.includes(currentUser.uid));
      }
    });
    return () => unsub();
  }, [currentUser])

  // Close the right drawer when the left drawer opens
  useEffect(() => {
    if (isLeftDrawerOpen && drawerOpen) {
      setDrawerOpen(false);
      setCurrentlyOpenDrawer(null);
    }
  }, [isLeftDrawerOpen]);

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const closeAllDrawers = () => {
    setDrawerOpen(false)
    setCurrentlyOpenDrawer(null)
  }

  const notifyDrawerOpened = (component: string) => {
    if (component === 'account' && currentlyOpenDrawer === 'notifications') {
      // If opening account drawer while notifications is open, close notifications first
      setCurrentlyOpenDrawer('account')
    } else if (component === 'notifications' && currentlyOpenDrawer === 'account') {
      // If opening notifications while account drawer is open, close account drawer first
      setDrawerOpen(false)
      setCurrentlyOpenDrawer('notifications')
    } else {
      setCurrentlyOpenDrawer(component)
    }
  }

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (drawerOpen) {
      setDrawerOpen(false)
      setCurrentlyOpenDrawer(null)
    } else {
      // If opening right drawer, notify parent to close left drawer
      if (onRightDrawerOpen) {
        onRightDrawerOpen();
      }
      setDrawerOpen(true)
      notifyDrawerOpened('account')
    }
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setCurrentlyOpenDrawer(null)
  }

  return (
    <NavbarContext.Provider value={{ closeAllDrawers, notifyDrawerOpened, currentlyOpenDrawer }}>
      <AppBar position="fixed" elevation={0} sx={{
        background: 'rgba(0,0,0,0.85)',
        boxShadow: 'none',
        transition: 'background 0.8s',
        minHeight: 44,
        justifyContent: 'center',
        backdropFilter: 'blur(18px)',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        zIndex: 1300,
        paddingTop: 'env(safe-area-inset-top)',
        margin: 0,
        display: { xs: 'none', sm: 'flex' },
      }}>
        <Toolbar sx={{ minHeight: 44, py: 1, px: { xs: 1, sm: 3 }, display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2, color: '#fff' }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="PinPointd Logo"
              sx={{
                height: '28px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                p: 0,
                m: 0,
                background: 'none',
                alignSelf: 'center',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
              }}
            />
          </Box>
          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(isAdmin || isBusiness) && (
                <Tooltip title={t('navigation.tokens')}>
                  <Button
                    color="inherit"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      mr: 1,
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: 3,
                      boxShadow: 1,
                      color: '#fff',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.15)'
                      }
                    }}
                    onClick={() => navigate('/tokens')}
                  >
                    <Badge badgeContent={isAdmin ? 999 : (typeof tokenCount === 'number' && tokenCount >= 0 ? tokenCount : 0)} color="warning" max={999} showZero>
                      <MonetizationOnIcon sx={{ color: '#FFD600' }} />
                    </Badge>
                  </Button>
                </Tooltip>
              )}
              <Tooltip title={t('navigation.map')}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/map"
                  startIcon={<MapIcon sx={{ color: '#fff' }} />}
                  sx={{ color: '#fff' }}
                >
                  {t('navigation.map')}
                </Button>
              </Tooltip>
              
              <Tooltip title={t('navigation.chat')}>
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/chat"
                  sx={{ color: '#fff' }}
                >
                  <ChatIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('navigation.friends')}>
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/friends"
                  sx={{ color: '#fff' }}
                >
                  <PeopleIcon />
                </IconButton>
              </Tooltip>
              
              <Notifications />
              
              <IconButton onClick={handleAccountClick} sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ width: 32, height: 32 }} 
                  src={currentUser?.photoURL || undefined}
                >
                  {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
                sx={{ color: '#fff' }}
            >
                {t('navigation.login')}
              </Button>
              <Button
                color="primary"
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                  },
                }}
              >
                {t('navigation.register')}
            </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: 220, sm: 320 },
            boxSizing: 'border-box',
            background: '#1a1a1a',
            color: '#fff',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: { xs: '56px', sm: '72px' },
            boxShadow: 6,
            borderRadius: '0 16px 16px 0',
            fontSize: { xs: '0.95rem', sm: '1rem' },
            px: { xs: 1, sm: 3 },
          },
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#444', color: '#fff', fontSize: 40, boxShadow: 2 }} src={currentUser?.photoURL || undefined}>
            {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', color: '#fff', maxWidth: 1, overflowWrap: 'break-word' }}>
              {(currentUser?.displayName || t('navigation.username')).slice(0, 20)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', wordBreak: 'break-word', maxWidth: 1, overflowWrap: 'break-word' }}>
              {username ? `@${username.slice(0, 20)}` : ''}
            </Typography>
            {isBusiness && (
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
                Business Account: {businessName}
              </Typography>
            )}
          </Box>
          <Divider sx={{ width: '100%', my: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
        </Box>
        
        {/* Spacer to push buttons to bottom */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Bottom buttons */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 4, px: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ 
              fontWeight: 600, 
              borderRadius: 3, 
              fontSize: 16, 
              py: 1.5, 
              boxShadow: 2,
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#1976d2'
              }
            }}
            onClick={() => { setDrawerOpen(false); navigate('/account'); }}
          >
            {t('navigation.change_account_settings')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ 
              fontWeight: 600, 
              borderRadius: 3, 
              fontSize: 16, 
              py: 1.5,
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(244, 67, 54, 0.08)'
              }
            }}
            onClick={async () => { setDrawerOpen(false); await handleLogout(); }}
          >
            {t('navigation.logout')}
          </Button>
        </Box>
      </Drawer>
      <Box sx={{ height: 44 }} />
    </NavbarContext.Provider>
  )
}

export default Navbar 