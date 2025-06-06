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
import PeopleIcon from '@mui/icons-material/People'
import ChatIcon from '@mui/icons-material/Chat'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import BookmarkIcon from '@mui/icons-material/Bookmark'

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
        setIsAdmin(data.isAdmin === true);
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
      setCurrentlyOpenDrawer('account')
    } else if (component === 'notifications' && currentlyOpenDrawer === 'account') {
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
        background: 'rgba(18, 18, 18, 0.85)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        minHeight: 44,
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        borderBottom: 'none',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        zIndex: 1400,
        paddingTop: 'env(safe-area-inset-top)',
        margin: 0,
        display: 'flex',
      }}>
        <Toolbar sx={{ 
          minHeight: 44, 
          py: 1, 
          px: { xs: 1.5, sm: 3 }, 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ 
              color: '#fff',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
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
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            />
          </Box>
          {currentUser ? (
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 1 },
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 2,
              p: 0.5,
              backdropFilter: 'blur(8px)'
            }}>
              {(isAdmin || isBusiness) && (
                <Tooltip title={t('navigation.tokens')}>
                  <IconButton
                    color="inherit"
                    onClick={() => navigate('/tokens')}
                    sx={{ 
                      color: '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Badge 
                      badgeContent={isAdmin ? 999 : (typeof tokenCount === 'number' && tokenCount >= 0 ? tokenCount : 0)} 
                      color="warning" 
                      max={999} 
                      showZero
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                          border: '2px solid rgba(18, 18, 18, 0.9)',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }
                      }}
                    >
                      <MonetizationOnIcon sx={{ 
                        color: '#FFD700',
                        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                      }} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('navigation.map')}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/map"
                  startIcon={<MapIcon />}
                  sx={{ 
                    color: '#fff',
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {t('navigation.map')}
                </Button>
              </Tooltip>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5, 
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 2,
                p: 0.5
              }}>
                <Tooltip title={t('navigation.chat')}>
                  <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/chat"
                    sx={{ 
                      color: '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <ChatIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={t('navigation.friends')}>
                  <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/friends"
                    sx={{ 
                      color: '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <PeopleIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <IconButton 
                onClick={handleAccountClick} 
                sx={{ 
                  ml: 1, 
                  display: { xs: 'none', sm: 'flex' }, 
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }} 
                  src={currentUser?.photoURL || undefined}
                >
                  {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 2,
              p: 0.5
            }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ 
                  color: '#fff',
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {t('navigation.login')}
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  background: 'linear-gradient(135deg, #3182ce 0%, #805ad5 100%)',
                  color: '#fff',
                  px: 2,
                  borderRadius: '50px',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(49, 130, 206, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2c5282 0%, #6b46c1 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)'
                  }
                }}
              >
                {t('navigation.register')}
              </Button>
            </Box>
          )}
          
          {/* Mobile Account Button */}
          {currentUser && (
            <IconButton 
              onClick={handleAccountClick} 
              sx={{ 
                ml: 1, 
                display: { xs: 'flex', sm: 'none' }, 
                alignItems: 'center',
                color: '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }} 
                src={currentUser?.photoURL || undefined}
              >
                {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
              </Avatar>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          position: 'fixed',
          top: 44,
          right: drawerOpen ? 0 : '-100%',
          bottom: 0,
          width: { xs: '85%', sm: 280 },
          bgcolor: 'rgba(18, 18, 18, 0.95)',
          borderLeft: 'none',
          backdropFilter: 'blur(10px)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          pt: 6,
          px: 3,
          '&::after': {
            content: 'none',
          }
        }}>
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 3, 
              bgcolor: '#444', 
              color: '#fff', 
              fontSize: 48, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              border: 'none',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }} 
            src={currentUser?.photoURL || undefined}
          >
            {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 3,
            position: 'relative',
            '&::after': {
              content: 'none',
            }
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                textAlign: 'center', 
                wordBreak: 'break-word', 
                color: '#fff', 
                maxWidth: 1, 
                overflowWrap: 'break-word',
                mb: 0.5,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              {(currentUser?.displayName || t('navigation.username')).slice(0, 20)}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textAlign: 'center', 
                wordBreak: 'break-word', 
                maxWidth: 1, 
                overflowWrap: 'break-word',
                fontSize: '0.9rem',
              }}
            >
              {username ? `@${username.slice(0, 20)}` : ''}
            </Typography>
            {isBusiness && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mt: 1,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                Business Account: {businessName}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5,
          mb: 4,
          px: 2,
          position: 'relative',
        }}>
          <Button
            variant="text"
            fullWidth
            sx={{ 
              fontWeight: 500,
              fontSize: 13,
              py: 1.5,
              color: '#fff',
              justifyContent: 'flex-start',
              pl: 2,
              borderRadius: 1,
              background: 'transparent',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={() => { setDrawerOpen(false); navigate('/saved-pinpoints'); }}
            startIcon={<BookmarkIcon />}
          >
            {t('navigation.saved_pinpoints')}
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ 
              fontWeight: 500,
              fontSize: 13,
              py: 1.5,
              color: '#fff',
              justifyContent: 'flex-start',
              pl: 2,
              borderRadius: 1,
              background: 'transparent',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={() => { setDrawerOpen(false); navigate('/account'); }}
            startIcon={<AccountCircleIcon />}
          >
            {t('navigation.change_account_settings')}
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ 
              fontWeight: 500,
              fontSize: 15,
              py: 1.5,
              color: '#f44336',
              justifyContent: 'flex-start',
              pl: 2,
              borderRadius: 1,
              background: 'transparent',
              '&:hover': {
                background: 'rgba(244, 67, 54, 0.08)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={async () => { setDrawerOpen(false); await handleLogout(); }}
            startIcon={<LogoutIcon />}
          >
            {t('navigation.logout')}
          </Button>
        </Box>
      </Box>
      {(drawerOpen || isLeftDrawerOpen) && (
        <Box
          onClick={drawerOpen ? handleDrawerClose : onMenuClick}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <Box sx={{ height: 44 }} />
    </NavbarContext.Provider>
  )
}

export default Navbar 