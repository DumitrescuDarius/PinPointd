import React from 'react'
import { Box, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '24px', // Original height
        bgcolor: 'black',
        display: { xs: 'none', sm: 'flex' }, // Hide on mobile, show on tablet and up
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
        zIndex: 1000, // Adjusted z-index to be above content but below modals
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.7rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {t('footer.copyright')}
        <span style={{ margin: '0 4px' }}>{t('footer.separator')}</span>
        <Link
          component={RouterLink}
          to="/privacy-policy"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { color: 'white' },
          }}
        >
          {t('footer.privacy_policy', 'Privacy Policy')}
        </Link>
        <span style={{ margin: '0 4px' }}>{t('footer.separator', '•')}</span>
        <Link
          component={RouterLink}
          to="/terms"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { color: 'white' },
          }}
        >
          {t('footer.terms_of_service', 'Terms of Service')}
        </Link>
      </Typography>
    </Box>
  )
} 