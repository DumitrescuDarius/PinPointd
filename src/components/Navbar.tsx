import { AppBar, Toolbar, Typography, Button, Box, Switch, Tooltip } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import MapIcon from '@mui/icons-material/Map'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import LogoutIcon from '@mui/icons-material/Logout'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useAuth } from '../contexts/AuthContext'

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navbar = ({ darkMode, onToggleDarkMode }: NavbarProps) => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <MapIcon sx={{ mr: 1 }} />
          Travel Spots
        </Typography>
        {currentUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <Switch
                checked={darkMode}
                onChange={onToggleDarkMode}
                icon={<DarkModeIcon />}
                checkedIcon={<DarkModeIcon color="primary" />}
                color="default"
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />
            </Tooltip>
            <Button
              color="inherit"
              component={RouterLink}
              to="/map"
              startIcon={<MapIcon />}
            >
              Map
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/add-location"
              startIcon={<AddLocationIcon />}
            >
              Add Location
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Navbar 