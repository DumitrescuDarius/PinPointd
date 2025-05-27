import React, { useState, useEffect, useRef } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  useTheme,
  Chip,
  Avatar,
  IconButton,
  useMediaQuery,
  Fade,
  Slide,
  Paper,
  Divider
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ExploreIcon from '@mui/icons-material/Explore'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ChatIcon from '@mui/icons-material/Chat'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import logo from '../assets/NewLogo.png'
import { useAuth } from '../contexts/AuthContext'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Create proper types for our map data
interface Pin {
  position: [number, number];
  label: string;
  color: string;
  description: string;
  emoji: string;
}

interface MapLocation {
  id: number;
  name: string;
  center: [number, number];
  zoom: number;
  pins: Pin[];
}

interface FeaturedLocation {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  user: {
    name: string;
    avatar: string;
  };
  tags: string[];
}

interface Testimonial {
  id: number;
  text: string;
  author: string;
  location: string;
  avatar: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Create a custom pin icon - all pins are red now
const createPinIcon = (): L.DivIcon => {
  return new L.DivIcon({
    className: 'custom-pin-icon',
    html: `
      <svg viewBox="0 0 24 24" width="32" height="32">
        <path 
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="#f44336"
          stroke="#ffffff"
          stroke-width="1.5"
        />
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

// Updated with more engaging imagery and data
const featuredLocations: FeaturedLocation[] = [
  {
    id: '1',
    name: 'eiffel_tower',
    description: 'eiffel_tower_desc',
    image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&q=80',
    rating: 4.8,
    user: {
      name: 'Sophie Dubois',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+D&background=random'
    },
    tags: ['Landmark', 'Europe', 'Paris']
  },
  {
    id: '2',
    name: 'taj_mahal',
    description: 'taj_mahal_desc',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80',
    rating: 4.9,
    user: {
      name: 'Raj Patel',
      avatar: 'https://ui-avatars.com/api/?name=Raj+P&background=random'
    },
    tags: ['Wonder', 'Asia', 'India']
  },
  {
    id: '3',
    name: 'great_wall',
    description: 'great_wall_desc',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80',
    rating: 4.7,
    user: {
      name: 'Lin Wei',
      avatar: 'https://ui-avatars.com/api/?name=Lin+W&background=random'
    },
    tags: ['Historic', 'Asia', 'China']
  },
]

// New testimonials section
const testimonials: Testimonial[] = [
  {
    id: 1,
    text: 'testimonial_1',
    author: 'Emily Chen',
    location: 'New York, USA',
    avatar: 'https://ui-avatars.com/api/?name=Emily+C&background=random'
  },
  {
    id: 2,
    text: 'testimonial_2',
    author: 'Marco Rossi',
    location: 'Rome, Italy',
    avatar: 'https://ui-avatars.com/api/?name=Marco+R&background=random'
  },
  {
    id: 3,
    text: 'testimonial_3',
    author: 'Aisha Khan',
    location: 'Dubai, UAE',
    avatar: 'https://ui-avatars.com/api/?name=Aisha+K&background=random'
  }
]

// App features
const features: Feature[] = [
  {
    icon: <LocationOnIcon fontSize="large" />,
    title: 'feature_pin_locations',
    description: 'feature_pin_desc'
  },
  {
    icon: <PeopleAltIcon fontSize="large" />,
    title: 'feature_connect',
    description: 'feature_connect_desc'
  },
  {
    icon: <ChatIcon fontSize="large" />,
    title: 'feature_chat',
    description: 'feature_chat_desc'
  }
]

// Replace with random worldwide locations
const mapLocations: MapLocation[] = [
  {
    id: 1,
    name: 'Rio de Janeiro, Brazil',
    center: [-22.9068, -43.1729] as [number, number],
    zoom: 12,
    pins: [
      { position: [-22.9519, -43.2106] as [number, number], label: 'Christ the Redeemer', color: '#f44336', description: 'Famous statue of Jesus Christ', emoji: '🗿' },
      { position: [-22.9639, -43.1822] as [number, number], label: 'Sugarloaf Mountain', color: '#f44336', description: 'Granite peak with cable cars', emoji: '🏔️' }
    ]
  },
  {
    id: 2,
    name: 'Sydney, Australia',
    center: [-33.8688, 151.2093] as [number, number],
    zoom: 13,
    pins: [
      { position: [-33.8568, 151.2153] as [number, number], label: 'Sydney Opera House', color: '#f44336', description: 'Famous performing arts center', emoji: '🏛️' },
      { position: [-33.8523, 151.2108] as [number, number], label: 'Sydney Harbour Bridge', color: '#f44336', description: 'Steel arch bridge across the harbor', emoji: '🌉' }
    ]
  },
  {
    id: 3,
    name: 'Cape Town, South Africa',
    center: [-33.9249, 18.4241] as [number, number],
    zoom: 12,
    pins: [
      { position: [-33.9575, 18.4099] as [number, number], label: 'Table Mountain', color: '#f44336', description: 'Flat-topped mountain overlooking the city', emoji: '⛰️' },
      { position: [-33.9081, 18.4188] as [number, number], label: 'Victoria & Alfred Waterfront', color: '#f44336', description: 'Historic harbor with shopping and dining', emoji: '🛍️' }
    ]
  },
  {
    id: 4,
    name: 'Kyoto, Japan',
    center: [35.0116, 135.7681] as [number, number],
    zoom: 13,
    pins: [
      { position: [35.0394, 135.7292] as [number, number], label: 'Arashiyama Bamboo Grove', color: '#f44336', description: 'Famous bamboo forest pathway', emoji: '🎋' },
      { position: [34.9949, 135.7850] as [number, number], label: 'Kiyomizu-dera Temple', color: '#f44336', description: 'Buddhist temple founded in 778', emoji: '🏮' }
    ]
  },
  {
    id: 5,
    name: 'Cairo, Egypt',
    center: [29.9773, 31.1325] as [number, number],
    zoom: 12,
    pins: [
      { position: [29.9792, 31.1342] as [number, number], label: 'Great Pyramids of Giza', color: '#f44336', description: 'Ancient Egyptian pyramids', emoji: '🔺' },
      { position: [30.0479, 31.2336] as [number, number], label: 'Egyptian Museum', color: '#f44336', description: 'Museum of ancient Egyptian antiquities', emoji: '🏺' }
    ]
  },
  {
    id: 6,
    name: 'Santorini, Greece',
    center: [36.3932, 25.4615] as [number, number],
    zoom: 12,
    pins: [
      { position: [36.4618, 25.3755] as [number, number], label: 'Oia Village', color: '#f44336', description: 'Famous for its stunning sunsets', emoji: '🌅' },
      { position: [36.3931, 25.4615] as [number, number], label: 'Fira', color: '#f44336', description: 'Main town of Santorini', emoji: '🏙️' }
    ]
  }
]

// Add this before the Home component
const testimonialKeys = [
  'home.testimonials.testimonial_1',
  'home.testimonials.testimonial_2',
  'home.testimonials.testimonial_3',
];

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme()
  const { currentUser } = useAuth()
  const [visibleSection, setVisibleSection] = useState<number>(0)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [activeMapIndex, setActiveMapIndex] = useState<number>(0)
  const mapRef = useRef<L.Map | null>(null)
  const [showingEmojiBubble, setShowingEmojiBubble] = useState<{ pinIndex: number; show: boolean }>({ pinIndex: 0, show: false })
  const emojiTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getStaticMapUrl = (location: MapLocation): string => {
    const { center, zoom } = location
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${center[1]},${center[0]},${zoom},0/600x400?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  }

  const calculatePinPosition = (pinPosition: [number, number], mapCenter: [number, number], zoom: number): { x: number; y: number } => {
    const latDiff = pinPosition[0] - mapCenter[0]
    const lngDiff = pinPosition[1] - mapCenter[1]
    const scale = Math.pow(2, zoom)
    return {
      x: (lngDiff * scale * 600) / 360,
      y: (latDiff * scale * 400) / 180
    }
  }

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const sectionHeight = windowHeight * 0.8

      const newSection = Math.floor(scrollPosition / sectionHeight)
      if (newSection !== visibleSection) {
        setVisibleSection(newSection)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visibleSection])

  const showEmojiBubble = (pinIndex: number): void => {
    if (emojiTimeoutRef.current) {
      clearTimeout(emojiTimeoutRef.current)
    }
    setShowingEmojiBubble({ pinIndex, show: true })
    emojiTimeoutRef.current = setTimeout(() => {
      setShowingEmojiBubble({ pinIndex: 0, show: false })
    }, 3500)
  }

  const handlePrevMap = (): void => {
    setActiveMapIndex((prev) => (prev === 0 ? mapLocations.length - 1 : prev - 1))
  }

  const handleNextMap = (): void => {
    setActiveMapIndex((prev) => (prev === mapLocations.length - 1 ? 0 : prev + 1))
  }

  // Automatically change map location every 6 seconds
  useEffect(() => {
    if (mapLocations.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMapIndex(prev => {
        let nextIdx = prev;
        while (nextIdx === prev && mapLocations.length > 1) {
          nextIdx = Math.floor(Math.random() * mapLocations.length);
        }
        // Show emoji bubble for a random pin in the new location
        const pins = mapLocations[nextIdx].pins;
        if (pins && pins.length > 0) {
          const randomPinIdx = Math.floor(Math.random() * pins.length);
          showEmojiBubble(randomPinIdx);
        }
        return nextIdx;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Show emoji bubbles more often (every 2 seconds)
  useEffect(() => {
    if (mapLocations.length === 0) return;
    const bubbleInterval = setInterval(() => {
      const pins = mapLocations[activeMapIndex].pins;
      if (pins && pins.length > 0) {
        const randomPinIdx = Math.floor(Math.random() * pins.length);
        showEmojiBubble(randomPinIdx);
      }
    }, 2000);
    return () => clearInterval(bubbleInterval);
  }, [activeMapIndex]);

  return (
    <Box
      sx={{
        minHeight: '80vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        pt: '32px',
        overflow: 'hidden',
      }}
    >
      {/* Hero Section */}
      <Box
        id="hero-section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: {
            xs: '80vh',
            sm: '60vh'
          },
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, sm: 3 },
        }}
      >
        {/* Abstract Background with 3D layers */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          {/* Main gradient sphere */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '60%',
              width: '60vw',
              height: '60vw',
              borderRadius: '50%',
              background: `radial-gradient(circle at center, ${theme.palette.primary.main}33, transparent 70%)`,
              filter: 'blur(80px)',
              animation: 'float 15s infinite ease-in-out',
              '@keyframes float': {
                '0%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(-5%, 5%) scale(1.1)' },
                '100%': { transform: 'translate(0, 0) scale(1)' },
              },
            }}
          />
          
          {/* Secondary gradient sphere */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '40vw',
              height: '40vw',
              borderRadius: '50%',
              background: `radial-gradient(circle at center, ${theme.palette.secondary.main}33, transparent 70%)`,
              filter: 'blur(60px)',
              animation: 'float2 12s infinite ease-in-out',
              '@keyframes float2': {
                '0%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(5%, -5%) scale(1.1)' },
                '100%': { transform: 'translate(0, 0) scale(1)' },
              },
            }}
          />
          
          {/* Accent gradient sphere */}
          <Box
            sx={{
              position: 'absolute',
              top: '60%',
              left: '20%',
              width: '30vw',
              height: '30vw',
              borderRadius: '50%',
              background: `radial-gradient(circle at center, ${theme.palette.info.main}33, transparent 70%)`,
              filter: 'blur(50px)',
              animation: 'float3 18s infinite ease-in-out',
              '@keyframes float3': {
                '0%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(-3%, -7%) scale(1.05)' },
                '100%': { transform: 'translate(0, 0) scale(1)' },
              },
            }}
          />
          
          {/* Grid overlay pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.2,
              background: `linear-gradient(${theme.palette.background.default} 1px, transparent 1px),
                           linear-gradient(90deg, ${theme.palette.background.default} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="PinPointd"
                  sx={{
                    width: { xs: '90%', sm: '80%', md: '90%' },
                    maxWidth: '420px',
                    height: 'auto',
                    mb: 4,
                    filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.3))',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                    mb: { xs: 2, sm: 3 },
                    lineHeight: 1.2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {t('home.hero.title')}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 3, sm: 5 },
                    maxWidth: { xs: '100%', md: '95%' },
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    fontSize: { xs: '1.1rem', sm: '1.5rem', md: '1.7rem' },
                  }}
                >
                  {t('home.hero.subtitle')}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 2 },
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  ml: { xs: 0, sm: 0 } 
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ExploreIcon />}
                    onClick={() => navigate('/map')}
                    sx={{
                      py: 1.5,
                      px: { xs: 3, sm: 4 },
                      borderRadius: '50px',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {currentUser ? t('home.hero.explore_world' as any) : t('home.hero.get_started' as any)}
                  </Button>
                  {!currentUser && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        py: 1,
                        px: { xs: 2, sm: 3 },
                        borderRadius: '50px',
                        fontSize: { xs: '1.3rem', sm: '1rem' },
                        fontWeight: 600,
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main,
                        color: 'text.primary',
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {t('navigation.register')}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/about')}
                    sx={{
                      borderRadius: '50px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        backgroundColor: `${theme.palette.primary.main}22`
                      }
                    }}
                  >
                    {t('about.title')}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6} sx={{ 
              display: { xs: 'block', md: 'block' },
              height: { xs: '300px', sm: '400px' },
              mt: { xs: 4, sm: 0 }
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { md: '400px', lg: '450px' },
                    width: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Static map display */}
                  <Box sx={{ position: 'relative', height: '100%', width: '100%', backgroundColor: '#f0f0f0' }}>
                    {mapLocations.map((location, idx) => (
                      <Box
                        key={location.id}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: idx === activeMapIndex ? 5 : 0,
                          opacity: idx === activeMapIndex ? 1 : 0,
                          transition: 'opacity 1s ease-in-out',
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Use direct OpenStreetMap in an iframe for proper display */}
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: '#f0f0f0',
                          }}
                        >
                          {/* Directly embed OpenStreetMap with no controls */}
                          <iframe 
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.center[1] - 0.05},${location.center[0] - 0.05},${location.center[1] + 0.05},${location.center[0] + 0.05}&layer=mapnik&marker=`}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: '12px',
                              pointerEvents: 'none', // Make the entire iframe non-interactive
                            }}
                            title={`OpenStreetMap view of ${location.name}`}
                            frameBorder="0"
                            scrolling="no"
                            loading="lazy"
                          />
                          
                          {/* CSS to hide zoom controls - apply styles directly to document */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: 0,
                              height: 0,
                              overflow: 'hidden',
                            }}
                          >
                            <style>
                              {`
                                .leaflet-control-container,
                                .leaflet-control,
                                .leaflet-control-zoom,
                                .leaflet-top,
                                .leaflet-bar,
                                .leaflet-right {
                                  display: none !important;
                                  visibility: hidden !important;
                                  opacity: 0 !important;
                                  pointer-events: none !important;
                                }
                              `}
                            </style>
                          </Box>
                          
                          {/* Remove the black overlay box - it's no longer needed */}
                          
                          {/* Pins overlay layer - positioned above iframe */}
                          <Box 
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              pointerEvents: 'none', // Allow clicks to pass through to iframe
                              zIndex: 10
                            }}
                          >
                            {/* Pin overlays - more centered around the map's center */}
                            {location.pins.map((pin, pinIdx) => {
                              // Calculate relative position for pins, but constrain closer to center
                              const totalLongSpan = 0.1; // bbox width
                              const totalLatSpan = 0.1; // bbox height
                              
                              // Reduce the offset from center by 40% to cluster pins more centrally
                              const offsetFromCenterLng = (pin.position[1] - location.center[1]) * 0.6;
                              const offsetFromCenterLat = (pin.position[0] - location.center[0]) * 0.6;
                              
                              // Position pins more centrally around the map center
                              const leftPercent = 50 + (offsetFromCenterLng / totalLongSpan) * 100;
                              const topPercent = 50 - (offsetFromCenterLat / totalLatSpan) * 100;
                              
                              return (
                                <Box
                                  key={pinIdx}
                                  sx={{
                                    position: 'absolute',
                                    top: `${topPercent}%`,
                                    left: `${leftPercent}%`,
                                    transform: 'translate(-50%, -100%)',
                                    zIndex: 15,
                                    filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.7))'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 24,
                                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 36'%3E%3Cpath d='M12 0C5.383 0 0 5.383 0 12c0 9 12 24 12 24s12-15 12-24c0-6.617-5.383-12-12-12z' fill='%23f44336'/%3E%3Ccircle cx='12' cy='12' r='6' fill='white'/%3E%3C/svg%3E")`,
                                      backgroundSize: 'contain',
                                      backgroundRepeat: 'no-repeat'
                                    }}
                                  />
                                </Box>
                              );
                            })}
                            
                            {/* Text bubble overlay - positioned closer to the pins */}
                            {idx === activeMapIndex && showingEmojiBubble.show && showingEmojiBubble.pinIndex < location.pins.length && (() => {
                              const pin = location.pins[showingEmojiBubble.pinIndex];
                              const totalLongSpan = 0.1; // bbox width
                              const totalLatSpan = 0.1; // bbox height
                              
                              // Apply the same central clustering as the pins
                              const offsetFromCenterLng = (pin.position[1] - location.center[1]) * 0.6;
                              const offsetFromCenterLat = (pin.position[0] - location.center[0]) * 0.6;
                              
                              // Position bubbles using the same calculation as the pins
                              const leftPercent = 50 + (offsetFromCenterLng / totalLongSpan) * 100;
                              const topPercent = 50 - (offsetFromCenterLat / totalLatSpan) * 100;
                              
                              return (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: `${topPercent}%`,
                                    left: `${leftPercent}%`,
                                    transform: 'translate(-50%, -130%)', // Lower position to point to the top of the pin
                                    zIndex: 20,
                                    animation: 'float-up-smooth 3.5s ease-in-out',
                                    '@keyframes float-up-smooth': {
                                      '0%': { transform: 'translate(-50%, -125%)', opacity: 0 },
                                      '15%': { transform: 'translate(-50%, -130%)', opacity: 1 },
                                      '75%': { transform: 'translate(-50%, -130%)', opacity: 1 },
                                      '85%': { transform: 'translate(-50%, -132%)', opacity: 0.8 },
                                      '90%': { transform: 'translate(-50%, -134%)', opacity: 0.6 },
                                      '95%': { transform: 'translate(-50%, -136%)', opacity: 0.3 },
                                      '100%': { transform: 'translate(-50%, -140%)', opacity: 0 },
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      bgcolor: theme.palette.background.paper,
                                      color: theme.palette.text.primary,
                                      borderRadius: '12px',
                                      padding: '8px 12px',
                                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                      position: 'relative',
                                      maxWidth: '150px',
                                      '&:after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: '-8px',
                                        left: 'calc(50% - 8px)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderTop: `8px solid ${theme.palette.background.paper}`,
                                      },
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ fontSize: '1.2rem' }}>
                                        {pin.emoji || '🌍'}
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {pin.label || 'Amazing place!'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            })()}
                          </Box>
                        </Box>
                      </Box>
                    ))}

                    {/* Location name overlay with dark theme - moved to bottom left */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        backgroundColor: 'rgba(40, 44, 52, 0.9)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: 500,
                        zIndex: 20,
                        maxWidth: '60%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: '#f44336' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                          {mapLocations[activeMapIndex].name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255, 255, 255, 0.7)' }}>
                        {`${mapLocations[activeMapIndex].pins.length} landmarks marked`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features-section"
        sx={{
          py: { xs: 6, md: 12 },
          background: `linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSection >= 1} timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                align="center"
                sx={{
                  fontWeight: 800,
                  mb: { xs: 3, md: 6 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                {t('about.key_features')}
              </Typography>
              
              <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center">
                {features.map((feature, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Slide direction="up" in={visibleSection >= 1} timeout={300 + idx * 200}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 3, md: 4 },
                          height: '100%',
                          borderRadius: '24px',
                          background: 'rgba(40, 44, 52, 0.5)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: { xs: 'none', md: 'translateY(-10px)' },
                            boxShadow: { xs: 'none', md: '0 20px 40px rgba(0, 0, 0, 0.2)' },
                          },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            mb: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{ fontWeight: 700, mb: 2 }}
                        >
                          {t(feature.title as any)}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ lineHeight: 1.7, flexGrow: 1 }}
                        >
                          {t(feature.description as any)}
                        </Typography>
                      </Paper>
                    </Slide>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Featured Locations */}
      <Box
        id="locations-section"
        sx={{
          py: { xs: 6, md: 12 },
          background: theme.palette.background.paper,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSection >= 2} timeout={1000}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                mb: { xs: 3, md: 6 },
                gap: { xs: 2, sm: 0 }
              }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  {t('home.featured_locations.title')}
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/map')}
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      background: 'rgba(244, 143, 177, 0.08)'
                    }
                  }}
                >
                  {t('home.featured_locations.view_all')}
                </Button>
              </Box>
              <Grid container spacing={3}>
                {featuredLocations.map((location, idx) => (
                  <Grid item key={location.id} xs={12} md={4}>
                    <Slide direction="up" in={visibleSection >= 2} timeout={300 + idx * 200}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          background: 'rgba(35, 39, 42, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'transform 0.4s ease-out, box-shadow 0.4s ease',
                          '&:hover': {
                            transform: { xs: 'none', md: 'translateY(-12px) scale(1.02)' },
                            boxShadow: { xs: 'none', md: '0 30px 60px rgba(0, 0, 0, 0.3)' },
                            '& .location-image': {
                              transform: { xs: 'none', md: 'scale(1.1)' },
                            }
                          },
                        }}
                      >
                        <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '60%' }}>
                          <CardMedia
                            component="img"
                            image={location.image}
                            alt={t((`home.featured_locations.${location.name}`) as any)}
                            className="location-image"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.8s ease',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 16,
                              left: 16,
                              right: 16,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                color: '#fff',
                                fontWeight: 700,
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                              }}
                            >
                              {t((`home.featured_locations.${location.name}`) as any)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FavoriteIcon sx={{ color: theme.palette.error.main, fontSize: '1.2rem' }} />
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: '#fff',
                                  fontWeight: 600,
                                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                }}
                              >
                                {location.rating}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {location.tags.map((tag, tagIdx) => (
                              <Chip
                                key={tagIdx}
                                label={tag}
                                size="small"
                                sx={{
                                  background: `${theme.palette.primary.main}22`,
                                  color: theme.palette.primary.light,
                                  borderRadius: '16px',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  height: '24px',
                                }}
                              />
                            ))}
                          </Box>
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {t((`home.featured_locations.${location.description}`) as any)}
                          </Typography>
                          <Divider sx={{ my: 2, opacity: 0.1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                src={location.user.avatar} 
                                alt={location.user.name}
                                sx={{ width: 32, height: 32 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {location.user.name}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate('/map')}
                              sx={{
                                backgroundColor: `${theme.palette.primary.main}22`,
                                '&:hover': {
                                  backgroundColor: `${theme.palette.primary.main}33`,
                                }
                              }}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Slide>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/map')}
                  sx={{
                    color: theme.palette.secondary.main,
                    borderColor: theme.palette.secondary.main,
                    borderRadius: '30px',
                    '&:hover': {
                      borderColor: theme.palette.secondary.light,
                    }
                  }}
                >
                  {t('home.featured_locations.view_all')}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box
        id="testimonials-section"
        sx={{
          py: { xs: 6, md: 12 },
          background: `linear-gradient(to top, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSection >= 3} timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                align="center"
                sx={{
                  fontWeight: 800,
                  mb: { xs: 3, md: 6 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                {t('home.testimonials.title')}
              </Typography>
              
              <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
                {testimonials.map((testimonial, idx) => (
                  <Grid item xs={12} md={4} key={testimonial.id}>
                    <Slide direction="up" in={visibleSection >= 3} timeout={300 + idx * 200}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 3, md: 4 },
                          borderRadius: '24px',
                          background: 'rgba(40, 44, 52, 0.5)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 3, 
                            fontStyle: 'italic',
                            lineHeight: 1.8,
                            flexGrow: 1,
                            position: 'relative',
                            pl: 2,
                            '&::before': {
                              content: '"""',
                              fontFamily: 'Georgia, serif',
                              fontSize: '3rem',
                              color: theme.palette.primary.main,
                              opacity: 0.3,
                              position: 'absolute',
                              top: '-20px',
                              left: '-10px',
                            }
                          }}
                        >
                          {testimonialKeys[idx] && t(testimonialKeys[idx] as any)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={testimonial.avatar}
                            alt={testimonial.author}
                            sx={{ width: 48, height: 48 }}
                          />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {testimonial.author}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {testimonial.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Slide>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => currentUser ? navigate('/map') : navigate('/register')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '50px',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t('home.hero.get_started')}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  )
}

export default Home 