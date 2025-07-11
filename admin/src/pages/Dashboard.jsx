import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [reportStats, setReportStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch data in parallel
      const [statsData, reportData] = await Promise.all([
        api.getStats(),
        api.getReportStats()
      ]);
      
      setStats(statsData);
      setReportStats(reportData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleRefresh = () => {
    fetchDashboardData();
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
          Admin Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* General Stats */}
      <Typography variant="h5" mb={2} color="primary">
        User Statistics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Users
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {stats.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Active Today
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {stats.activeToday || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                New Signups
              </Typography>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {stats.newSignups || 0}
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
                {stats.flaggedUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Stats */}
      <Typography variant="h5" mb={2} color="primary">
        Reports & Safety
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Reports
              </Typography>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {reportStats.totalReports || 0}
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
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {reportStats.pendingReports || 0}
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
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {reportStats.resolvedReports || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Reports This Week
              </Typography>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {reportStats.recentReports || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" mb={2} color="primary">
        Recent Activity
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                User Activity
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Active users this week: <strong>{stats.activeThisWeek || 0}</strong>
              </Typography>
              <Typography variant="body1" color="textSecondary">
                New signups this week: <strong>{stats.newSignupsThisWeek || 0}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Report Summary
              </Typography>
              {reportStats.reportsByReason && reportStats.reportsByReason.length > 0 ? (
                reportStats.reportsByReason.map((item, index) => (
                  <Typography key={index} variant="body1" color="textSecondary" paragraph>
                    {item._id}: <strong>{item.count}</strong> reports
                  </Typography>
                ))
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No reports by reason data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 