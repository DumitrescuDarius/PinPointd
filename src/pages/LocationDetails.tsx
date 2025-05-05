import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Paper,
  Box,
  Rating,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonIcon from '@mui/icons-material/Person'

// This would typically come from your backend
const mockLocation = {
  id: '1',
  name: 'Eiffel Tower',
  description: 'The Eiffel Tower is a wrought-iron lattice tower located on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower.',
  image: 'https://source.unsplash.com/800x600/?eiffel-tower',
  rating: 4.8,
  coordinates: [2.2945, 48.8584],
  reviews: [
    {
      id: '1',
      user: 'John Doe',
      rating: 5,
      comment: 'Amazing experience! The view from the top is breathtaking.',
      date: '2023-08-15',
    },
    {
      id: '2',
      user: 'Jane Smith',
      rating: 4,
      comment: 'Beautiful landmark, but very crowded during peak hours.',
      date: '2023-08-10',
    },
  ],
}

const LocationDetails = () => {
  const { id } = useParams()
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
  })

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the review to your backend
    console.log('New review:', newReview)
    setNewReview({ rating: 0, comment: '' })
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {mockLocation.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={mockLocation.rating} precision={0.1} readOnly />
          <Typography variant="body1" sx={{ ml: 1 }}>
            ({mockLocation.rating})
          </Typography>
        </Box>
        <Box
          component="img"
          src={mockLocation.image}
          alt={mockLocation.name}
          sx={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
            borderRadius: 1,
            mb: 3,
          }}
        />
        <Typography variant="body1" paragraph>
          {mockLocation.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationOnIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            Coordinates: {mockLocation.coordinates[0]}, {mockLocation.coordinates[1]}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <List>
          {mockLocation.reviews.map(review => (
            <ListItem key={review.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="span" variant="subtitle1">
                      {review.user}
                    </Typography>
                    <Rating value={review.rating} size="small" readOnly sx={{ ml: 1 }} />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {review.date}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Write a Review
        </Typography>
        <Box component="form" onSubmit={handleSubmitReview}>
          <Rating
            value={newReview.rating}
            onChange={(_, value) => setNewReview(prev => ({ ...prev, rating: value || 0 }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            value={newReview.comment}
            onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Submit Review
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default LocationDetails 