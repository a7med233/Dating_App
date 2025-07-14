import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, getAuthHeaders } from '../utils/apiConfig';


const Analytics = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl('/admin/analytics'), {
          headers: getAuthHeaders(token),
        });
        
        if (!response.ok) throw new Error('Failed to fetch analytics');
        
        const data = await response.json();
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const renderOverviewTab = () => (
    <Box>
      {/* Key Performance Indicators */}
      <Typography variant="h5" mb={3}>Key Performance Indicators</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users</Typography>
              <Typography variant="h3">{analytics.totalUsers || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.newSignups || 0} new today • {analytics.newSignupsThisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Users</Typography>
              <Typography variant="h3" color="primary.main">{analytics.activeToday || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.activeThisWeek || 0} this week • {analytics.activeThisMonth || 0} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Engagement Rate</Typography>
              <Typography variant="h3" color="success.main">{analytics.engagementRate || 0}%</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.usersWithMatches || 0} users with matches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Photo Upload Rate</Typography>
              <Typography variant="h3" color="info.main">{analytics.photoUploadRate || 0}%</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.usersWithPhotos || 0} users with photos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Trends */}
      {analytics.activityTrend && analytics.activityTrend.length > 0 && (
        <>
          <Typography variant="h5" mb={3}>Activity Trends (Last 7 Days)</Typography>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2}>
                {analytics.activityTrend.map((day, index) => (
                  <Grid item xs={12} sm={6} md={1.7} key={index}>
                    <Box textAlign="center" p={2} sx={{ 
                      bgcolor: 'grey.50', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {day.activeUsers}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        active users
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* User Demographics Summary */}
      <Typography variant="h5" mb={3}>User Demographics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Chip label="Male" color="primary" size="large" />
                    <Typography variant="h4" mt={1}>{analytics.maleUsers || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {analytics.totalUsers ? Math.round((analytics.maleUsers / analytics.totalUsers) * 100) : 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Chip label="Female" color="secondary" size="large" />
                    <Typography variant="h4" mt={1}>{analytics.femaleUsers || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {analytics.totalUsers ? Math.round((analytics.femaleUsers / analytics.totalUsers) * 100) : 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Chip label="Other" color="default" size="large" />
                    <Typography variant="h4" mt={1}>{analytics.otherUsers || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {analytics.totalUsers ? Math.round((analytics.otherUsers / analytics.totalUsers) * 100) : 0}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Types</Typography>
              {analytics.userTypes && analytics.userTypes.length > 0 ? (
                <Box>
                  {analytics.userTypes.map((type, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={type._id} 
                          size="small" 
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {analytics.totalUsers ? Math.round((type.count / analytics.totalUsers) * 100) : 0}%
                        </Typography>
                      </Box>
                      <Typography variant="h6">{type.count}</Typography>
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
    </Box>
  );

  const renderDemographicsTab = () => (
    <Box>
      {/* Age Distribution */}
      {analytics.ageDistribution && analytics.ageDistribution.length > 0 && (
        <>
          <Typography variant="h5" mb={3}>Age Distribution</Typography>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2}>
                {analytics.ageDistribution.map((ageGroup, index) => (
                  <Grid item xs={6} sm={4} md={2} key={index}>
                    <Box textAlign="center" p={2} sx={{ 
                      bgcolor: 'grey.50', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {ageGroup._id}
                      </Typography>
                      <Typography variant="h4">{ageGroup.count}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {analytics.totalUsers ? Math.round((ageGroup.count / analytics.totalUsers) * 100) : 0}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Top Locations */}
      {analytics.topLocations && analytics.topLocations.length > 0 && (
        <>
          <Typography variant="h5" mb={3}>Top Locations</Typography>
          <Card>
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell align="right">Users</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topLocations.slice(0, 20).map((location, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{location._id}</TableCell>
                        <TableCell align="right">{location.count}</TableCell>
                        <TableCell align="right">
                          {analytics.totalUsers ? Math.round((location.count / analytics.totalUsers) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );

  const renderEngagementTab = () => (
    <Box>
      {/* Engagement Metrics */}
      <Typography variant="h5" mb={3}>Engagement Metrics</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Users with Photos</Typography>
              <Typography variant="h3" color="info.main">{analytics.usersWithPhotos || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.photoUploadRate || 0}% of total users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Users with Likes</Typography>
              <Typography variant="h3" color="secondary.main">{analytics.usersWithLikes || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.totalUsers ? Math.round((analytics.usersWithLikes / analytics.totalUsers) * 100) : 0}% of total users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Users with Matches</Typography>
              <Typography variant="h3" color="success.main">{analytics.usersWithMatches || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.engagementRate || 0}% engagement rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Banned Users</Typography>
              <Typography variant="h3" color="error.main">{analytics.bannedUsers || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {analytics.banRate || 0}% of total users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Growth Metrics */}
      <Typography variant="h5" mb={3}>Growth Metrics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>New Signups</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">{analytics.newSignups || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">Today</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">{analytics.newSignupsThisWeek || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">This Week</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary.main">{analytics.newSignupsThisMonth || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">This Month</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">{analytics.totalUsers || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">Total</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Users</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">{analytics.activeToday || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">Today</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">{analytics.activeThisWeek || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">This Week</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary.main">{analytics.activeThisMonth || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">This Month</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">{analytics.activeUsers || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">Active Total</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>Analytics Dashboard</Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Demographics" />
        <Tab label="Engagement" />
      </Tabs>

      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderDemographicsTab()}
      {activeTab === 2 && renderEngagementTab()}
    </Box>
  );
};

export default Analytics; 