import { useState, useEffect, useCallback } from 'react'
import Map, { Marker, NavigationControl, Popup, ViewStateChangeInfo, GeolocateControl } from 'react-map-gl'
import { 
  Box, 
  Paper, 
  Typography, 
  Rating, 
  Alert, 
  ToggleButton, 
  ToggleButtonGroup,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Drawer,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SatelliteIcon from '@mui/icons-material/Satellite'
import TerrainIcon from '@mui/icons-material/Terrain'
import MapIcon from '@mui/icons-material/Map'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import type { MapMouseEvent } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapStyles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
  navigation: 'mapbox://styles/mapbox/navigation-day-v1',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const

interface Location {
  id: string
  name: string
  description: string
  coordinates: [number, number]
  rating?: number
  category?: string
  tags?: string[]
}

interface MapPageProps {
  darkMode: boolean;
}

const MapPage = ({ darkMode }: MapPageProps) => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5
  })

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<string>(darkMode ? mapStyles.dark : mapStyles.streets)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Enhanced locations with categories and tags
  const locations: Location[] = [
    {
      id: '1',
      name: 'Eiffel Tower',
      description: 'Iconic iron lattice tower in Paris',
      coordinates: [2.2945, 48.8584],
      rating: 4.8,
      category: 'Landmark',
      tags: ['Architecture', 'Tourist Spot', 'Historical']
    },
    {
      id: '2',
      name: 'Taj Mahal',
      description: 'White marble mausoleum in Agra',
      coordinates: [78.0422, 27.1751],
      rating: 4.9,
      category: 'Landmark',
      tags: ['Architecture', 'Historical', 'UNESCO']
    },
    {
      id: '3',
      name: 'Central Park',
      description: 'Urban park in New York City',
      coordinates: [-73.9654, 40.7829],
      rating: 4.7,
      category: 'Park',
      tags: ['Nature', 'Recreation', 'Urban']
    }
  ]

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (typeof token === 'string') {
      setMapboxToken(token)
    } else {
      console.error('Mapbox token is missing. Please add VITE_MAPBOX_TOKEN to your .env file')
    }
  }, [])

  useEffect(() => {
    setMapStyle(darkMode ? mapStyles.dark : mapStyles.streets)
  }, [darkMode])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxToken}&types=place,locality,neighborhood,address&limit=5`
      )
      const data = await response.json()
      setSearchResults(data.features || [])
    } catch (error) {
      console.error('Error searching locations:', error)
    } finally {
      setIsSearching(false)
    }
  }, [mapboxToken])

  const handleLocationSelect = (feature: any) => {
    const [longitude, latitude] = feature.center
    setViewState({
      longitude,
      latitude,
      zoom: 12
    })
    setSearchQuery(feature.place_name)
    setSearchResults([])
  }

  const filteredLocations = selectedCategory
    ? locations.filter(loc => loc.category === selectedCategory)
    : locations

  if (!mapboxToken) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Mapbox token is missing. Please add VITE_MAPBOX_TOKEN to your .env file.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      {/* Search Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          width: '90%',
          maxWidth: 600,
        }}
      >
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.place_name
            }
            inputValue={searchQuery}
            onInputChange={(_, newValue) => {
              setSearchQuery(newValue)
              handleSearch(newValue)
            }}
            onChange={(_, value) => {
              if (value && typeof value !== 'string') {
                handleLocationSelect(value)
              }
            }}
            loading={isSearching}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Search locations..."
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearching ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Paper>
      </Box>

      {/* Map Style Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          p: 1
        }}
      >
        <ToggleButtonGroup
          value={mapStyle}
          exclusive
          onChange={(_, newStyle) => newStyle && setMapStyle(newStyle)}
          aria-label="map style"
          size="small"
        >
          <ToggleButton value={mapStyles.streets} aria-label="streets">
            <MapIcon />
          </ToggleButton>
          <ToggleButton value={mapStyles.satellite} aria-label="satellite">
            <SatelliteIcon />
          </ToggleButton>
          <ToggleButton value={mapStyles.satelliteStreets} aria-label="satellite streets">
            <TerrainIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Location List Toggle */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' }
        }}
        onClick={() => setIsDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Map
        {...viewState}
        onViewStateChange={(evt: ViewStateChangeInfo) => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxApiAccessToken={mapboxToken || ''}
        width="100%"
        height="100%"
        style={{ width: '100%', height: '100%' }}
        minZoom={1}
        maxZoom={20}
      >
        <NavigationControl />
        <GeolocateControl
          trackUserLocation
        />
        
        {filteredLocations.map(location => (
          <Marker
            key={location.id}
            longitude={location.coordinates[0]}
            latitude={location.coordinates[1]}
          >
            <Box
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                setSelectedLocation(location)
              }}
            >
              <LocationOnIcon
                sx={{
                  color: 'primary.main',
                  fontSize: 40,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'secondary.main'
                  }
                }}
              />
            </Box>
          </Marker>
        ))}

        {selectedLocation && (
          <Popup
            longitude={selectedLocation.coordinates[0]}
            latitude={selectedLocation.coordinates[1]}
            onClose={() => setSelectedLocation(null)}
            closeButton
            closeOnClick={false}
            anchor="bottom"
          >
            <Paper sx={{ p: 2, maxWidth: 200 }}>
              <Typography variant="h6" gutterBottom>
                {selectedLocation.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedLocation.description}
              </Typography>
              {selectedLocation.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={selectedLocation.rating} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({selectedLocation.rating})
                  </Typography>
                </Box>
              )}
              {selectedLocation.tags && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedLocation.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Popup>
        )}
      </Map>

      {/* Location List Drawer */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Locations
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Array.from(new Set(locations.map(loc => loc.category))).map(category => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : (category ?? null))}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <List>
            {filteredLocations.map(location => (
              <ListItem
                key={location.id}
                button
                onClick={() => {
                  setSelectedLocation(location)
                  setViewState({
                    longitude: location.coordinates[0],
                    latitude: location.coordinates[1],
                    zoom: 12
                  })
                }}
              >
                <ListItemIcon>
                  <LocationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={location.name}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {location.description}
                      </Typography>
                      {location.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Rating value={location.rating} size="small" readOnly />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({location.rating})
                          </Typography>
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}

export default MapPage 