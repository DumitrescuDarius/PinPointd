import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: '64px', pb: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: { xs: 2, md: 5 }, borderRadius: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {t('terms_of_service.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Introduction */}
          <Typography variant="body1" paragraph>
            {t('terms_of_service.intro')}
          </Typography>

          {/* 1. Acceptance of Terms */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('terms_of_service.acceptance.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms_of_service.acceptance.content')}
          </Typography>

          {/* 2. User Account */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('terms_of_service.account.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms_of_service.account.content')}
          </Typography>

          {/* 3. User Conduct */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('terms_of_service.conduct.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms_of_service.conduct.content')}
          </Typography>

          {/* 4. Privacy Policy */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('terms_of_service.privacy.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms_of_service.privacy.content')}
          </Typography>

          {/* 5. Modifications to Terms */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('terms_of_service.modifications.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms_of_service.modifications.content')}
          </Typography>

          {/* 6. Contact Information */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('terms_of_service.contact.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms_of_service.contact.content')}
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default Terms; 