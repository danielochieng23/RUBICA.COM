import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import digitalIdService from '../services/digitalIdService';

const steps = ['Connect Wallet', 'Enter Details', 'Create Identity', 'Complete'];

function CreateIdentity() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { account, connected, connectWallet } = useWeb3();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [identityData, setIdentityData] = useState(null);
  const [generatedKeys, setGeneratedKeys] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Generate new wallet for identity if not using connected wallet
      let privateKey;
      if (data.useConnectedWallet && account) {
        // In production, this would use the connected wallet's signer
        // For demo, we generate a new key
        const wallet = digitalIdService.generateWallet();
        privateKey = wallet.privateKey;
      } else {
        const wallet = digitalIdService.generateWallet();
        privateKey = wallet.privateKey;
        setGeneratedKeys(wallet);
      }

      // Create identity data
      const identityInfo = {
        givenName: data.givenName,
        familyName: data.familyName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality
      };

      // Create identity on blockchain
      const result = await digitalIdService.createIdentity(
        identityInfo,
        data.password,
        privateKey
      );

      setIdentityData(result);

      // Save to auth context
      login(
        { name: `${data.givenName} ${data.familyName}`, email: data.email },
        result
      );

      handleNext();
      toast.success('Identity created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create identity');
      console.error('Create identity error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <WalletIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Connect Your Wallet
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Connect your Ethereum wallet to create your decentralized identity
                </Typography>
                {connected ? (
                  <Box>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Connected: ${digitalIdService.formatAddress(account)}`}
                      color="success"
                      sx={{ mb: 2 }}
                    />
                    <Box>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleNext}
                        sx={{ mt: 2 }}
                      >
                        Continue
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<WalletIcon />}
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  This information will be encrypted and stored on the blockchain
                </Typography>
                
                <Box display="grid" gap={2}>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <TextField
                      label="Given Name"
                      {...register('givenName', { required: 'Given name is required' })}
                      error={!!errors.givenName}
                      helperText={errors.givenName?.message}
                      fullWidth
                    />
                    <TextField
                      label="Family Name"
                      {...register('familyName', { required: 'Family name is required' })}
                      error={!!errors.familyName}
                      helperText={errors.familyName?.message}
                      fullWidth
                    />
                  </Box>
                  
                  <TextField
                    label="Email"
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                  />
                  
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <TextField
                      label="Date of Birth"
                      type="date"
                      {...register('dateOfBirth', { required: 'Date of birth is required' })}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth?.message}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Nationality"
                      {...register('nationality', { required: 'Nationality is required' })}
                      error={!!errors.nationality}
                      helperText={errors.nationality?.message}
                      fullWidth
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  
                  <TextField
                    label="Password"
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                  />
                  
                  <TextField
                    label="Confirm Password"
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    fullWidth
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                  >
                    Create Identity
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <CircularProgress size={64} />
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Creating Your Digital Identity...
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  This may take a few moments
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={2}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Identity Created Successfully!
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Your decentralized identity has been created and stored on the blockchain
                </Typography>
                
                {identityData && (
                  <Box sx={{ mt: 3, textAlign: 'left' }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <strong>Important:</strong> Save your identity information securely. You will need it to access your identity.
                    </Alert>
                    
                    <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Your DID
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
                          {identityData.did}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(identityData.did, 'DID')}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                    
                    {generatedKeys && (
                      <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Private Key
                        </Typography>
                        <Alert severity="error" sx={{ mb: 1 }}>
                          Never share your private key with anyone!
                        </Alert>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                            {generatedKeys.privateKey}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(generatedKeys.privateKey, 'Private Key')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    )}
                    
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        IPFS Hash
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {identityData.ipfsHash}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <Box mt={4}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" className="fade-in">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Create Your Digital Identity
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Create a secure, decentralized identity on the blockchain
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}
    </Container>
  );
}

export default CreateIdentity;