import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const Dashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({});
  const [reportStats, setReportStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch enhanced analytics using the API client
        const analyticsData = await api.getAnalytics();
        
        // Fetch report stats using the API client
        const reportData = await api.getReportStats();
        
        setAnalytics(analyticsData);
        setReportStats(reportData);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={3}>Admin Dashboard</Typography>
      
      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users</Typography>
              <Typography variant="h4">{analytics.totalUsers || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.newSignups || 0} new today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Today</Typography>
              <Typography variant="h4" color="primary.main">{analytics.activeToday || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.activeThisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Engagement Rate</Typography>
              <Typography variant="h4" color="success.main">{analytics.engagementRate || 0}%</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.usersWithMatches || 0} with matches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Banned Users</Typography>
              <Typography variant="h4" color="error.main">{analytics.bannedUsers || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.banRate || 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Demographics */}
      <Typography variant="h5" mb={2}>User Demographics</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="Male" color="primary" size="small" />
                    <Typography variant="h6">{analytics.maleUsers || 0}</Typography>
                  </Box>
                </Grid>
                <Grid xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="Female" color="secondary" size="small" />
                    <Typography variant="h6">{analytics.femaleUsers || 0}</Typography>
                  </Box>
                </Grid>
                {analytics.otherUsers > 0 && (
                  <Grid xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Other" color="default" size="small" />
                      <Typography variant="h6">{analytics.otherUsers}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Types</Typography>
              {analytics.userTypes && analytics.userTypes.length > 0 ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  {analytics.userTypes.map((type, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {type._id}
                      </Typography>
                      <Chip label={type.count} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No user type data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Age Distribution */}
              {analytics.ageDistribution && analytics.ageDistribution.length > 0 && (
          <>
            <Typography variant="h5" mb={2}>Age Distribution</Typography>
            <Grid container spacing={3} mb={4}>
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      {analytics.ageDistribution.map((ageGroup, index) => (
                        <Grid xs={6} sm={4} md={2} key={index}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary">
                              {ageGroup._id}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {ageGroup.count} users
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

      {/* Top Locations */}
              {analytics.topLocations && analytics.topLocations.length > 0 && (
          <>
            <Typography variant="h5" mb={2}>Top Locations</Typography>
            <Grid container spacing={3} mb={4}>
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      {analytics.topLocations.slice(0, 10).map((location, index) => (
                        <Grid xs={12} sm={6} md={4} key={index}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {location._id}
                            </Typography>
                            <Chip label={location.count} size="small" />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

      {/* Activity Trends */}
              {analytics.activityTrend && analytics.activityTrend.length > 0 && (
          <>
            <Typography variant="h5" mb={2}>Activity Trends (Last 7 Days)</Typography>
            <Grid container spacing={3} mb={4}>
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      {analytics.activityTrend.map((day, index) => (
                        <Grid xs={12} sm={6} md={1.7} key={index}>
                          <Box textAlign="center">
                            <Typography variant="body2" color="textSecondary">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {day.activeUsers}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

      {/* Engagement Metrics */}
      <Typography variant="h5" mb={2}>Engagement Metrics</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Users with Photos</Typography>
              <Typography variant="h4" color="info.main">{analytics.usersWithPhotos || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.photoUploadRate || 0}% upload rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Users with Likes</Typography>
              <Typography variant="h4" color="secondary.main">{analytics.usersWithLikes || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Active likers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>New This Week</Typography>
              <Typography variant="h4" color="success.main">{analytics.newSignupsThisWeek || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.newSignupsThisMonth || 0} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active This Month</Typography>
              <Typography variant="h4" color="warning.main">{analytics.activeThisMonth || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Monthly active users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports & Safety */}
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

      {/* Report Summary */}
      {reportStats.reportsByReason && reportStats.reportsByReason.length > 0 && (
        <>
          <Typography variant="h5" mb={2}>Reports by Reason</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    {reportStats.reportsByReason.map((item, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item._id}
                          </Typography>
                          <Chip label={item.count} size="small" color="error" />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 