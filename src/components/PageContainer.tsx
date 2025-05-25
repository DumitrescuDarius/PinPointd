import React from 'react';
import { Box, Container, Paper, useTheme, Typography } from '@mui/material';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  noPadding?: boolean;
  fullHeight?: boolean;
  pageTitle?: string;
  paperProps?: {
    elevation?: number;
    square?: boolean;
    variant?: 'elevation' | 'outlined';
  };
  className?: string;
}

/**
 * PageContainer provides consistent layout and styling for pages throughout the application.
 * It handles spacing, scrolling, and standard page structure.
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'lg',
  noPadding = false,
  fullHeight = false,
  pageTitle,
  paperProps,
  className = '',
}) => {
  const theme = useTheme();

  return (
    <Box
      className={`page-container ${className}`}
      sx={{
        minHeight: fullHeight ? '100vh' : 'auto',
        paddingTop: '44px', // Exact navbar height
        paddingBottom: '24px', // Exact footer height
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '& > *': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(144, 202, 249, 0.5) rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <Container 
        maxWidth={maxWidth}
        sx={{ 
          flex: 1,
          mt: 2,
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {(pageTitle || paperProps) ? (
          <Paper
            elevation={paperProps?.elevation ?? 0}
            square={paperProps?.square ?? false}
            variant={paperProps?.variant ?? 'elevation'}
            sx={{
              p: noPadding ? 0 : 3,
              borderRadius: 2,
              backgroundImage: 'none',
              backgroundColor: 'rgba(35, 39, 42, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(144, 202, 249, 0.5)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(144, 202, 249, 0.8)',
              },
            }}
          >
            {pageTitle && (
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  mb: 3, 
                  pt: 1,
                  fontWeight: 700 
                }}
              >
                {pageTitle}
              </Typography>
            )}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              pb: 2 // Extra padding at bottom of content
            }}>
              {children}
            </Box>
          </Paper>
        ) : (
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            pb: 2, // Extra padding at bottom of content
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(144, 202, 249, 0.5)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(144, 202, 249, 0.8)',
            },
          }}>
            {children}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PageContainer; 