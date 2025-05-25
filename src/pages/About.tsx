import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  Avatar,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ChatIcon from '@mui/icons-material/Chat';
import MapIcon from '@mui/icons-material/Map';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

const About = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  // App features
  const features: Feature[] = [
    {
      icon: <ChatIcon fontSize="large" />,
      title: t('about.features.chat.title') as string,
      description: t('about.features.chat.desc') as string
    },
    {
      icon: <PeopleAltIcon fontSize="large" />,
      title: t('about.features.friends.title') as string,
      description: t('about.features.friends.desc') as string
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: t('about.features.security.title') as string,
      description: t('about.features.security.desc') as string
    },
    {
      icon: <DevicesIcon fontSize="large" />,
      title: t('about.features.easy_use.title') as string,
      description: t('about.features.easy_use.desc') as string
    },
    {
      icon: <LocationOnIcon fontSize="large" />,
      title: t('about.features.geolocation.title') as string,
      description: t('about.features.geolocation.desc') as string
    },
    {
      icon: <MapIcon fontSize="large" />,
      title: t('about.features.map.title') as string,
      description: t('about.features.map.desc') as string
    }
  ];

  // Team members (fictional)
  const team: TeamMember[] = [
    {
      name: t('about.team.member1.name') as string,
      role: t('about.team.member1.role') as string,
      avatar: '/images/avatar.jpg',
      bio: t('about.team.member1.bio') as string
    }
  ];

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: '64px', // Height of navbar
        pb: '24px', // Height of footer
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          py: 4
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ width: '100%' }}
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 6 },
                mt: 2,
                mb: 6,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)}, ${alpha(theme.palette.secondary.dark, 0.1)})`,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.2)}, transparent 70%)`,
                  filter: 'blur(40px)',
                  zIndex: 0
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at center, ${alpha(theme.palette.secondary.main, 0.2)}, transparent 70%)`,
                  filter: 'blur(30px)',
                  zIndex: 0
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h2"
                  component="h1"
                  align="center"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  {t('about.title')}
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  color="textSecondary"
                  paragraph
                  sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
                >
                  {t('about.subtitle')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                    flexWrap: 'wrap'
                  }}
                >
                  <Chip 
                    label={t('about.founded')}
                    color="primary" 
                    sx={{ fontWeight: 500 }} 
                  />
                  <Chip 
                    label={t('about.global_community')}
                    color="secondary" 
                    sx={{ fontWeight: 500 }} 
                  />
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Basic Information Section */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                mb: 6,
                borderRadius: '16px',
                background: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ fontWeight: 700, mb: 4 }}
              >
                {t('about.what_is_pinpointd')}
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {t('about.how_it_works')}
                    </Typography>
                    <Typography paragraph>
                      {t('about.how_it_works_desc')}
                    </Typography>
                    <Typography paragraph>
                      {t('about.how_it_works_desc2')}
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {t('about.technology')}
                      </Typography>
                      <Typography paragraph>
                        {t('about.technology_desc')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                      {t('about.key_benefits')}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      <Typography component="li" sx={{ mb: 1 }}>
                        {t('about.benefit1')}
                      </Typography>
                      <Typography component="li" sx={{ mb: 1 }}>
                        {t('about.benefit2')}
                      </Typography>
                      <Typography component="li" sx={{ mb: 1 }}>
                        {t('about.benefit3')}
                      </Typography>
                      <Typography component="li" sx={{ mb: 1 }}>
                        {t('about.benefit4')}
                      </Typography>
                      <Typography component="li" sx={{ mb: 1 }}>
                        {t('about.benefit5')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                        {t('about.getting_started')}
                      </Typography>
                      <Typography paragraph>
                        {t('about.getting_started_desc')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 4 }}
            >
              {t('about.key_features')}
            </Typography>
            <Grid container spacing={3} sx={{ mb: 8 }} justifyContent="center">
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '12px',
                        background: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 60,
                              height: 60
                            }}
                          >
                            {feature.icon}
                          </Avatar>
                        </Box>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h3"
                          align="center"
                          sx={{ fontWeight: 600 }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography align="center" color="textSecondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Our Story Section */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                mb: 6,
                borderRadius: '16px',
                background: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}
              >
                {t('about.our_story.title')}
              </Typography>
              <Typography paragraph>
                {t('about.our_story.paragraph1')}
              </Typography>
              <Typography paragraph>
                {t('about.our_story.paragraph2')}
              </Typography>
              <Typography>
                {t('about.our_story.paragraph3')}
              </Typography>
            </Paper>
          </motion.div>

          {/* Team Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 4 }}
            >
              {t('about.team.title')}
            </Typography>
            <Grid container spacing={4} sx={{ mb: 6 }} justifyContent="center">
              {team.map((member, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                        borderRadius: '12px',
                        background: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      <Avatar
                        src={member.avatar}
                        alt={member.name}
                        sx={{ width: 100, height: 100, mb: 2 }}
                      />
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h3"
                        align="center"
                        sx={{ fontWeight: 600 }}
                      >
                        {member.name}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        align="center"
                        gutterBottom
                      >
                        {member.role}
                      </Typography>
                      <Typography align="center" color="textSecondary">
                        {member.bio}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default About; 