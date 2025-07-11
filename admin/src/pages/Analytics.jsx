import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const Analytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const [analyticsData, statsData] = await Promise.all([
        api.getAnalytics(),
        api.getStats()
      ]);
      setData({ ...analyticsData, ...statsData });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert 
          severity="error" 
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRefresh}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Tooltip title="Refresh Analytics">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Key Metrics */}
      <Typography variant="h5" mb={2} color="primary">
        Key Metrics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Users
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {data?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.newSignupsThisWeek || 0} new this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Active Users
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {data?.activeToday || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.activeThisWeek || 0} active this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Matches
              </Typography>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {data?.totalMatches || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.matchesThisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Banned Users
              </Typography>
              <Typography variant="h3" color="error.main" fontWeight="bold">
                {data?.bannedUsers || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.bannedThisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Demographics */}
      <Typography variant="h5" mb={2} color="primary">
        User Demographics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Gender Distribution
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip 
                  label={`Male: ${data?.genderStats?.male || 0}`} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={`Female: ${data?.genderStats?.female || 0}`} 
                  color="secondary" 
                  variant="outlined"
                />
                <Chip 
                  label={`Other: ${data?.genderStats?.other || 0}`} 
                  color="default" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Age Distribution
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label={`18-25: ${data?.ageStats?.['18-25'] || 0}`} size="small" />
                <Chip label={`26-35: ${data?.ageStats?.['26-35'] || 0}`} size="small" />
                <Chip label={`36-45: ${data?.ageStats?.['36-45'] || 0}`} size="small" />
                <Chip label={`46+: ${data?.ageStats?.['46+'] || 0}`} size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Metrics */}
      <Typography variant="h5" mb={2} color="primary">
        Activity Metrics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Messages
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {data?.totalMessages || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.messagesToday || 0} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Likes
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {data?.totalLikes || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.likesToday || 0} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Match Rate
              </Typography>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {data?.matchRate ? `${(data.matchRate * 100).toFixed(1)}%` : '0%'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.totalLikes ? `${data.totalLikes} likes → ${data.totalMatches} matches` : 'No data'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Avg. Response Time
              </Typography>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {data?.avgResponseTime ? `${data.avgResponseTime}h` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Average time to respond
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Safety & Reports */}
      <Typography variant="h5" mb={2} color="primary">
        Safety & Reports
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Reports
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {data?.totalReports || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.reportsThisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Pending Reports
              </Typography>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {data?.pendingReports || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Need review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Resolved Reports
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {data?.resolvedReports || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {data?.resolutionRate ? `${(data.resolutionRate * 100).toFixed(1)}%` : '0%'} resolution rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Blocked Users
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {data?.blockedUsers || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Users blocked by others
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Report Reasons */}
      {data?.reportsByReason && data.reportsByReason.length > 0 && (
        <Box>
          <Typography variant="h5" mb={2} color="primary">
            Top Report Reasons
          </Typography>
          <Grid container spacing={2}>
            {data.reportsByReason.slice(0, 6).map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {item._id}
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {item.count}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {data.totalReports ? `${((item.count / data.totalReports) * 100).toFixed(1)}%` : '0%'} of total reports
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* System Health */}
      <Typography variant="h5" mb={2} mt={4} color="primary">
        System Health
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Server Status
              </Typography>
              <Chip 
                label="Online" 
                color="success" 
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                All systems operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Database Status
              </Typography>
              <Chip 
                label="Connected" 
                color="success" 
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                MongoDB Atlas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Storage Usage
              </Typography>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {data?.storageUsage ? `${data.storageUsage}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Cloudinary storage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Last Updated
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Real-time data
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 