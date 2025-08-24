import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, identity } = useAuth();
  const { account, balance, connected } = useWeb3();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCredentials: 0,
    verifiedCredentials: 0,
    pendingVerifications: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, [identity]);

  const loadDashboardData = async () => {
    // In a real app, this would fetch from the API
    setStats({
      totalCredentials: 5,
      verifiedCredentials: 3,
      pendingVerifications: 2,
      recentActivity: [
        { id: 1, type: 'credential_issued', title: 'Educational Credential Issued', date: new Date().toISOString(), status: 'completed' },
        { id: 2, type: 'verification', title: 'Age Verification Completed', date: new Date().toISOString(), status: 'completed' },
        { id: 3, type: 'credential_request', title: 'Employment Verification Requested', date: new Date().toISOString(), status: 'pending' }
      ]
    });
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      className="fade-in" 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick ? { transform: 'translateY(-4px)' } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'credential_issued':
        return <AssignmentIcon />;
      case 'verification':
        return <VerifiedUserIcon />;
      case 'credential_request':
        return <PersonIcon />;
      default:
        return <SecurityIcon />;
    }
  };

  const getActivityColor = (status) => {
    return status === 'completed' ? 'success' : 'warning';
  };

  return (
    <Container maxWidth="lg" className="fade-in">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome{identity?.name ? `, ${identity.name}` : ' to Digital ID Framework'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your decentralized identity and credentials securely
        </Typography>
      </Box>

      {/* Wallet Status */}
      {connected ? (
        <Paper sx={{ p: 2, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <WalletIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6">Wallet Connected</Typography>
                <Typography variant="body2">{account}</Typography>
                <Typography variant="body2">Balance: {balance} ETH</Typography>
              </Box>
            </Box>
            {identity && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Identity Active"
                color="success"
                variant="filled"
              />
            )}
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.dark' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <WarningIcon sx={{ fontSize: 40 }} />
            <Box flex={1}>
              <Typography variant="h6">Wallet Not Connected</Typography>
              <Typography variant="body2">
                Connect your wallet to access all features
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<WalletIcon />}
              onClick={() => {}}
            >
              Connect Wallet
            </Button>
          </Box>
        </Paper>
      )}

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Credentials"
            value={stats.totalCredentials}
            icon={<AssignmentIcon />}
            color="primary.main"
            onClick={() => navigate('/credentials')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified"
            value={stats.verifiedCredentials}
            icon={<VerifiedUserIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pendingVerifications}
            icon={<SecurityIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Trust Score"
            value="85%"
            icon={<PersonIcon />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/create-identity')}
              sx={{ py: 2 }}
            >
              Create Identity
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/issue')}
              sx={{ py: 2 }}
            >
              Issue Credential
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VerifiedUserIcon />}
              onClick={() => navigate('/verify')}
              sx={{ py: 2 }}
            >
              Verify Credential
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={() => navigate('/credentials')}
              sx={{ py: 2 }}
            >
              View QR Code
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {stats.recentActivity.map((activity) => (
            <ListItem
              key={activity.id}
              secondaryAction={
                <Tooltip title="View Details">
                  <IconButton edge="end">
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getActivityColor(activity.status)}.main` }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.title}
                secondary={new Date(activity.date).toLocaleString()}
              />
              <Chip
                label={activity.status}
                color={getActivityColor(activity.status)}
                size="small"
                sx={{ mr: 2 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default Dashboard;