import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider, createTheme, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Box, Menu, MenuItem, Typography, Tooltip, IconButton } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Map from './pages/Map'
import LocationDetails from './pages/LocationDetails'
import AddLocation from './pages/AddLocation'
import AddPinpoint from './pages/AddPinpoint'
import Login from './components/Login'
import MapIcon from '@mui/icons-material/Map'
import LanguageIcon from '@mui/icons-material/Language'
import { useTranslation } from 'react-i18next'
import AccountPage from './pages/Account'
import Social from './pages/Social'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import About from './pages/About'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Footer from './components/Footer'
import Terms from './pages/Terms'
import Register from './pages/Register'
import UsernameDialog from './components/UsernameDialog'
import PasswordPromptDialog from './components/PasswordPromptDialog'
import EmailVerificationDialog from './components/EmailVerificationDialog'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './config/firebase'
import { useAuth } from './contexts/AuthContext'
import PeopleIcon from '@mui/icons-material/People'
import ChatIcon from '@mui/icons-material/Chat'
import TokensPage from './pages/Tokens'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import InfoIcon from '@mui/icons-material/Info'
import PrivacyPolicy from './pages/PrivacyPolicy'
import SavedPinpoints from './pages/SavedPinpoints'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import './styles/globalStyles.css'
import './i18n/i18n'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

function App() {
  // Always use dark mode for the app, except for chat which manages its own theme
  const [darkMode, setDarkMode] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(true)
  const [checkingFirstLogin, setCheckingFirstLogin] = useState(true)
  const location = useLocation()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ro', name: 'Română' }
  ]

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget)
  }

  const handleLanguageSelect = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setLanguageMenuAnchor(null)
  }

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null)
  }

  const menuItems = [
    {
      text: t('navigation.map'),
      icon: <MapIcon />,
      onClick: () => {
        navigate('/map')
        setIsDrawerOpen(false)
      }
    },
    {
      text: t('navigation.chat'),
      icon: <ChatIcon />,
      onClick: () => {
        navigate('/chat')
        setIsDrawerOpen(false)
      }
    },
    {
      text: t('navigation.friends'),
      icon: <PeopleIcon />,
      onClick: () => {
        navigate('/friends')
        setIsDrawerOpen(false)
      }
    },
    {
      text: t('navigation.about'),
      icon: <InfoIcon />,
      onClick: () => {
        navigate('/about')
        setIsDrawerOpen(false)
      }
    }
  ]

  const bottomMenuItems = [
    {
      text: t('navigation.change_language'),
      icon: <LanguageIcon />,
      onClick: handleLanguageClick
    }
  ]

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
        light: darkMode ? '#b3e5fc' : '#42a5f5',
        dark: darkMode ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
        light: darkMode ? '#f8bbd0' : '#ff4081',
        dark: darkMode ? '#ec407a' : '#c51162',
      },
      background: {
        default: darkMode ? '#181a1b' : '#f5f5f5',
        paper: darkMode ? '#23272a' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f5f5f5' : '#1a1a1a',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        active: darkMode ? '#fff' : '#000',
        hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        disabled: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography: {
      fontFamily: 'Inter, Roboto Mono, system-ui, sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: -0.5,
      },
      h2: {
        fontWeight: 800,
        letterSpacing: -0.5,
      },
      h3: {
        fontWeight: 700,
        letterSpacing: 0,
      },
      h4: {
        fontWeight: 700,
        letterSpacing: 0.25,
      },
      h5: {
        fontWeight: 700,
        letterSpacing: 0.5,
      },
      h6: {
        fontWeight: 700,
        letterSpacing: 1,
      },
      subtitle1: {
        fontWeight: 600,
        letterSpacing: 0.15,
      },
      subtitle2: {
        fontWeight: 600,
        letterSpacing: 0.1,
      },
      body1: {
        fontWeight: 400,
        letterSpacing: 0.5,
        lineHeight: 1.7,
      },
      body2: {
        fontWeight: 400,
        letterSpacing: 0.25,
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? '#23272a' : '#ffffff',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
            padding: '8px 20px',
          },
          contained: {
            backgroundColor: darkMode ? '#2f3641' : '#e3e3e3',
            color: darkMode ? '#fff' : '#000',
            '&:hover': {
              backgroundColor: darkMode ? '#3a424f' : '#d5d5d5',
            },
          },
          outlined: {
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.13)' : 'rgba(0, 0, 0, 0.09)',
            },
            '&.Mui-focused': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? 'rgba(35, 39, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode ? '0 8px 30px rgba(0, 0, 0, 0.3)' : '0 8px 30px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? 'rgba(35, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
            backdropFilter: 'blur(18px)',
            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: 'rgba(18, 18, 18, 0.95)',
            color: '#f5f5f5',
            backdropFilter: 'blur(10px)',
            borderRight: 'none',
            borderLeft: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? 'rgba(35, 39, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.25)',
            borderRadius: 16,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode ? 'rgba(144, 202, 249, 0.5) rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)',
            height: '100vh',
            overflow: 'auto',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            backgroundColor: darkMode ? '#181a1b' : '#f5f5f5',
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode ? 'rgba(144, 202, 249, 0.5) rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode ? 'rgba(144, 202, 249, 0.5)' : 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              transition: 'background 0.3s ease',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: darkMode ? 'rgba(144, 202, 249, 0.8)' : 'rgba(0, 0, 0, 0.5)',
            },
          },
          'html, body, #root': {
            height: '100%',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            backgroundColor: darkMode ? '#181a1b' : '#f5f5f5',
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
          },
          '.page-container': {
            minHeight: '100vh',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease',
            backgroundColor: darkMode ? '#181a1b' : '#f5f5f5',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)',
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
            minWidth: 40,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: darkMode ? '#f5f5f5' : '#1a1a1a',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#2f3641' : '#ffffff',
            backgroundImage: 'none',
            boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)',
              },
            },
          },
        },
      },
    },
  })

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!currentUser) {
        setShowUsernameDialog(false)
        setShowPasswordPrompt(false)
        setShowEmailVerification(false)
        setCheckingUsername(false)
        setCheckingFirstLogin(false)
        return
      }

      const userRef = doc(db, 'users', currentUser.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        // User document doesn't exist yet
        setShowUsernameDialog(true)
        setShowPasswordPrompt(false)
        setShowEmailVerification(false)
      } else {
        const userData = userSnap.data()
        
        // Check if user needs to verify email
        if (userData.verificationCode && !userData.emailVerified) {
          setShowEmailVerification(true)
          setShowUsernameDialog(false)
          setShowPasswordPrompt(false)
        } 
        // Check if user needs to set up username
        else if (!userData.username) {
          setShowUsernameDialog(true)
          setShowPasswordPrompt(false)
          setShowEmailVerification(false)
        } 
        // Only show password prompt for Google-authenticated users who haven't set up a password
        else if (
          currentUser.providerData[0]?.providerId === 'google.com' && 
          !userData.hasSetupPassword
        ) {
          setShowUsernameDialog(false)
          setShowPasswordPrompt(true)
          setShowEmailVerification(false)
        } else {
          setShowUsernameDialog(false)
          setShowPasswordPrompt(false)
          setShowEmailVerification(false)
        }
      }
      
      setCheckingUsername(false)
      setCheckingFirstLogin(false)
    }
    
    checkUserStatus()
  }, [currentUser])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleUsernameSet = () => {
    setShowUsernameDialog(false)
    setCheckingUsername(false)
  }

  const handlePasswordSet = () => {
    setShowPasswordPrompt(false)
    setCheckingFirstLogin(false)
  }

  const handleVerificationComplete = () => {
    setShowEmailVerification(false)
  }

  if (checkingUsername || checkingFirstLogin) return null

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <Navbar 
          onMenuClick={() => setIsDrawerOpen((prev) => !prev)} 
          isLeftDrawerOpen={isDrawerOpen}
          onRightDrawerOpen={() => setIsDrawerOpen(false)}
        />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          mt: '44px', // Exact height of navbar
          mb: '24px', // Exact height of footer
          pt: 1, 
          pb: 1,
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <EmailVerificationDialog
            open={showEmailVerification}
            onClose={() => setShowEmailVerification(false)}
            onVerificationComplete={handleVerificationComplete}
          />
          <UsernameDialog
            open={showUsernameDialog}
            userId={currentUser?.uid || ''}
            onUsernameSet={handleUsernameSet}
          />
          <PasswordPromptDialog
            open={showPasswordPrompt}
            onPasswordSet={handlePasswordSet}
            currentUser={currentUser}
          />
          {!showUsernameDialog && (
            <Box
              sx={{
                position: 'fixed',
                top: 44, // Below navbar
                left: isDrawerOpen ? 0 : '-100%',
                bottom: 0,
                width: 280,
                bgcolor: 'rgba(18, 18, 18, 0.95)',
                borderRight: 'none',
                backdropFilter: 'blur(10px)',
                transition: 'left 0.3s ease-in-out',
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 25px rgba(0, 0, 0, 0.3)',
                overflowY: 'auto',
              }}
            >
              <List sx={{ mt: 2 }}>
                <ListItem>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('navigation.navigation')}
                  </Typography>
                </ListItem>
                {menuItems.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton 
                      onClick={item.onClick}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ flexGrow: 1 }} />
              <List>
                {bottomMenuItems.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={item.onClick}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ p: 2 }}>
                <Divider sx={{ opacity: 0.1 }} />
              </Box>
            </Box>
          )}
          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={handleLanguageMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                background: theme.palette.background.paper,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                },
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2" color="text.secondary">
                {t('navigation.language')}
              </Typography>
            </MenuItem>
            {languages.map((language) => (
              <MenuItem
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                selected={i18n.language === language.code}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(144, 202, 249, 0.08)',
                  },
                }}
              >
                {language.name}
              </MenuItem>
            ))}
          </Menu>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Map darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-pinpoint"
              element={
                <ProtectedRoute>
                  <AddPinpoint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/location/:id"
              element={
                <ProtectedRoute>
                  <LocationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-location"
              element={
                <ProtectedRoute>
                  <AddLocation
                    open={true}
                    onClose={() => {}}
                    coordinates={[0, 0]}
                    onSuccess={() => {}}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Social />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tokens"
              element={
                <ProtectedRoute>
                  <TokensPage />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/saved-pinpoints" element={<SavedPinpoints />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}

export default App 