import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { 
  Send as SendIcon, 
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const Notifications = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [notificationForm, setNotificationForm] = useState({
    targetUsers: [],
    type: 'system',
    title: '',
    message: '',
    data: {}
  });

  // Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const notificationTypes = [
    { value: 'system', label: 'System', color: '#96CEB4' },
    { value: 'match', label: 'Match', color: '#FF6B6B' },
    { value: 'like', label: 'Like', color: '#4ECDC4' },
    { value: 'message', label: 'Message', color: '#45B7D1' },
    { value: 'promotion', label: 'Promotion', color: '#FFEAA7' }
  ];

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      console.log('Notification stats:', data); // Debug log
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Failed to load notification statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message || notificationForm.targetUsers.length === 0) {
      setError('Please fill in all required fields and select at least one user');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      const result = await api.sendNotification(notificationForm);
      setSuccess(`Successfully sent ${result.notifications.length} notifications`);
      setSendDialogOpen(false);
      
      // Reset form
      setNotificationForm({
        targetUsers: [],
        type: 'system',
        title: '',
        message: '',
        data: {}
      });
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error sending notifications:', error);
      setError(error.message || 'Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const handleUserSelection = (event) => {
    const value = event.target.value;
    setNotificationForm(prev => ({
      ...prev,
      targetUsers: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const getTypeColor = (type) => {
    const typeInfo = notificationTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.color : '#95A5A6';
  };

  const getTypeLabel = (type) => {
    const typeInfo = notificationTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.label : type;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notifications Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setSendDialogOpen(true)}
        >
          Send Notification
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users with Notifications
              </Typography>
              <Typography variant="h4" component="div">
                {stats?.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Notifications
              </Typography>
              <Typography variant="h4" component="div">
                {stats?.totalNotifications || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unread Notifications
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {stats?.unreadNotifications || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchStats}
                variant="outlined"
                fullWidth
              >
                Refresh Stats
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Types Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Types Breakdown
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {stats?.notificationTypes && Object.entries(stats.notificationTypes).map(([type, count]) => (
              <Chip
                key={type}
                label={`${getTypeLabel(type)}: ${count}`}
                sx={{
                  backgroundColor: getTypeColor(type),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog 
        open={sendDialogOpen} 
        onClose={() => setSendDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Users</InputLabel>
                  <Select
                    multiple
                    value={notificationForm.targetUsers}
                    onChange={handleUserSelection}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((userId) => {
                          const user = users.find(u => u._id === userId);
                          return (
                            <Chip 
                              key={userId} 
                              label={user ? user.firstName || user.email : userId} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.firstName || user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Notification Type</InputLabel>
                  <Select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {notificationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title..."
                />
              </Grid>
              
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message..."
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendNotification} 
            variant="contained" 
            disabled={sending}
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Notifications; 