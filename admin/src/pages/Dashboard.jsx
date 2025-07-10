import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [reportStats, setReportStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch general stats
        const statsResponse = await fetch('http://localhost:3000/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsResponse.json();
        
        // Fetch report stats
        const reportResponse = await fetch('http://localhost:3000/admin/reports/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reportData = await reportResponse.json();
        
        setStats(statsData);
        setReportStats(reportData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={3}>Admin Dashboard</Typography>
      
      {/* General Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Today</Typography>
              <Typography variant="h4" color="primary.main">{stats.activeToday || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>New Signups</Typography>
              <Typography variant="h4" color="success.main">{stats.newSignups || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Banned Users</Typography>
              <Typography variant="h4" color="error.main">{stats.flaggedUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Stats */}
      <Typography variant="h5" mb={2}>Reports & Safety</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Reports</Typography>
              <Typography variant="h4">{reportStats.totalReports || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending Reports</Typography>
              <Typography variant="h4" color="warning.main">{reportStats.pendingReports || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Resolved Reports</Typography>
              <Typography variant="h4" color="success.main">{reportStats.resolvedReports || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Reports This Week</Typography>
              <Typography variant="h4" color="info.main">{reportStats.recentReports || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" mb={2}>Recent Activity</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Activity</Typography>
              <Typography variant="body2" color="textSecondary">
                Active users this week: {stats.activeThisWeek || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                New signups this week: {stats.newSignupsThisWeek || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Report Summary</Typography>
              {reportStats.reportsByReason && reportStats.reportsByReason.length > 0 ? (
                reportStats.reportsByReason.map((item, index) => (
                  <Typography key={index} variant="body2" color="textSecondary">
                    {item._id}: {item.count} reports
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
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