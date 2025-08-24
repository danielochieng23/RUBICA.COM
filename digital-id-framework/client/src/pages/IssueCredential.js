import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function IssueCredential() {
  return (
    <Container maxWidth="lg" className="fade-in">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Issue Credential
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Issue verifiable credentials to identity holders
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography>Credential issuance interface coming soon...</Typography>
      </Paper>
    </Container>
  );
}

export default IssueCredential;