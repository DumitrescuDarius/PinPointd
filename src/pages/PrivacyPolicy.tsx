import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: '64px', pb: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: { xs: 2, md: 5 }, borderRadius: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {t('privacy_policy.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Introduction */}
          <Typography variant="body1" paragraph>
            {t('privacy_policy.intro')}
          </Typography>

          {/* Information We Collect */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.information_collection.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.information_collection.content')}
          </Typography>

          {/* How We Use Your Information */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.usage.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.usage.content')}
          </Typography>

          {/* How We Share Your Information */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.sharing.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.sharing.content')}
          </Typography>

          {/* Cookies and Tracking Technologies */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.cookies.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.cookies.content')}
          </Typography>

          {/* Data Security */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.security.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.security.content')}
          </Typography>

          {/* Data Retention */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.retention.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.retention.content')}
          </Typography>

          {/* Children's Privacy */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.children.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.children.content')}
          </Typography>

          {/* Your Rights and Choices */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.rights.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.rights.content')}
          </Typography>

          {/* Changes to This Policy */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.changes.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.changes.content')}
          </Typography>

          {/* Contact Us */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {t('privacy_policy.contact.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.contact.content')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy; 