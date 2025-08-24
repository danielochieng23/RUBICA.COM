import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function ManageCredentials() {
  return (
    <Container maxWidth="lg" className="fade-in">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          My Credentials
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your verifiable credentials
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography>Credential management interface coming soon...</Typography>
      </Paper>
    </Container>
  );
}

export default ManageCredentials;