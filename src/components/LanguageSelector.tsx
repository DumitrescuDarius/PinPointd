import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        sx={{
          color: '#fff',
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#fff',
          },
          '.MuiSvgIcon-root': {
            color: '#fff',
          },
        }}
      >
        <MenuItem value="en" sx={{ color: '#000' }}>English</MenuItem>
        <MenuItem value="ro" sx={{ color: '#000' }}>Română</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector; 