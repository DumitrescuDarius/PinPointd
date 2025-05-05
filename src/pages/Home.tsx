import React from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

const featuredLocations = [
  {
    id: '1',
    name: 'Eiffel Tower',
    description: 'Iconic iron lattice tower in Paris',
    image: 'https://source.unsplash.com/800x600/?eiffel-tower',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Taj Mahal',
    description: 'White marble mausoleum in Agra',
    image: 'https://source.unsplash.com/800x600/?taj-mahal',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Great Wall of China',
    description: 'Ancient series of walls and fortifications',
    image: 'https://source.unsplash.com/800x600/?great-wall-of-china',
    rating: 4.7,
  },
]

const Home = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Discover Amazing Places
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Explore and share your favorite locations around the world
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/map')}
          sx={{ mt: 2 }}
        >
          Explore Map
        </Button>
      </Box>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6 }}>
        Featured Locations
      </Typography>
      <Grid container spacing={4}>
        {featuredLocations.map(location => (
          <Grid item key={location.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
              onClick={() => navigate(`/location/${location.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={location.image}
                alt={location.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {location.name}
                </Typography>
                <Typography color="text.secondary">
                  {location.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Rating: {location.rating}/5
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Home 