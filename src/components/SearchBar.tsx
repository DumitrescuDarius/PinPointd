import React from 'react';
import { 
  TextField, 
  InputAdornment, 
  Paper, 
  CircularProgress,
  Autocomplete,
  Box,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (searchTerm: string) => void;
  onSelectResult?: (result: SearchResult) => void;
  loading?: boolean;
  results?: SearchResult[];
  fullWidth?: boolean;
  variant?: 'standard' | 'search-only' | 'autocomplete';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  size?: 'small' | 'medium';
  className?: string;
}

/**
 * Standardized search bar component that can be used across all pages
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  onSelectResult,
  loading = false,
  results = [],
  fullWidth = false,
  variant = 'standard',
  startAdornment,
  endAdornment,
  size = 'medium',
  className = '',
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const renderStandardSearch = () => (
    <Paper 
      className={`search-container ${className}`}
      sx={{ 
        width: fullWidth ? '100%' : '500px',
      }}
    >
      <TextField
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyPress={handleKeyPress}
        fullWidth
        size={size}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {startAdornment || <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.6)' }} /> : endAdornment}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-input': {
            py: size === 'small' ? 1 : 1.5,
          }
        }}
      />
    </Paper>
  );

  const renderAutocomplete = () => (
    <Paper 
      className={`search-container ${className}`}
      sx={{ 
        width: fullWidth ? '100%' : '500px',
      }}
    >
      <Autocomplete
        freeSolo
        options={results}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.title;
        }}
        loading={loading}
        value={value}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            onChange?.(newValue);
          } else if (newValue) {
            onSelectResult?.(newValue);
          }
        }}
        onInputChange={(_, newInputValue) => {
          onChange?.(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            className="search-input"
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            size={size}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {startAdornment || <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)', mr: 1 }} />}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading && <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.6)', mr: 1 }} />}
                  {endAdornment}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                py: size === 'small' ? 1 : 1.5,
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            padding: '10px 16px',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}>
            {option.icon}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1" sx={{ color: '#fff' }}>{option.title}</Typography>
              {option.subtitle && (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                  {option.subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        PaperComponent={({ children, ...props }) => (
          <Paper
            {...props}
            sx={{
              mt: 1,
              backgroundColor: 'rgba(30, 32, 38, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            {children}
          </Paper>
        )}
      />
    </Paper>
  );

  const renderSearchOnly = () => (
    <TextField
      className={`search-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyPress={handleKeyPress}
      fullWidth={fullWidth}
      size={size}
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {startAdornment || <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {loading ? <CircularProgress size={20} /> : endAdornment}
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: 'rgba(30, 32, 38, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        width: fullWidth ? '100%' : '500px',
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'transparent',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        '& .MuiInputBase-input': {
          color: '#fff',
          py: size === 'small' ? 1 : 1.5,
        },
      }}
    />
  );

  if (variant === 'autocomplete') return renderAutocomplete();
  if (variant === 'search-only') return renderSearchOnly();
  return renderStandardSearch();
};

export default SearchBar; 