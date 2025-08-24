import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function Settings() {
  return (
    <Container maxWidth="lg" className="fade-in">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account and preferences
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography>Settings interface coming soon...</Typography>
      </Paper>
    </Container>
  );
}

export default Settings;