import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import UndoIcon from '@mui/icons-material/Undo';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const genderOptions = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'straight', label: 'Straight' },
  { value: 'gay', label: 'Gay' },
  { value: 'lesbian', label: 'Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'public', label: 'Active' },
  { value: 'hidden', label: 'Banned' },
];

const Users = () => {
  const { token, admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({ 
    search: '', 
    gender: '', 
    type: '', 
    visibility: '', 
    location: '', 
    age: '', 
    joinDate: '' 
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page: page.toString(),
        limit: '25',
        ...(filters.search && { search: filters.search }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.type && { type: filters.type }),
        ...(filters.visibility && { visibility: filters.visibility }),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const data = await api.getUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const data = await api.getUserDetails(userId);
      setUserDetails(data.user);
      setUserStats(data.stats);
      
      // Also fetch user messages
      try {
        const messagesData = await api.getUserMessages(userId);
        setUserMessages(messagesData.messages || []);
      } catch (messagesErr) {
        console.error('Error fetching user messages:', messagesErr);
        setUserMessages([]);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, filters]);

  const handleView = async (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setTab(0);
    setEditMode(false);
    await fetchUserDetails(user._id);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await api.deleteUser(userId);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      fetchUsers(pagination.currentPage);
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to delete user', severity: 'error' });
    }
  };

  const handleBanToggle = async (userId, ban) => {
    try {
      await api.banUser(userId, { ban });
      setSnackbar({ 
        open: true, 
        message: ban ? 'User banned successfully' : 'User unbanned successfully', 
        severity: 'success' 
      });
      fetchUsers(pagination.currentPage);
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, visibility: ban ? 'hidden' : 'public' }));
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to update user status', severity: 'error' });
    }
  };

  const handleEdit = () => {
    setEditForm({
      firstName: userDetails?.firstName || '',
      lastName: userDetails?.lastName || '',
      bio: userDetails?.bio || '',
      location: userDetails?.location || '',
      hometown: userDetails?.hometown || '',
      height: userDetails?.height || '',
      languages: userDetails?.languages || [],
      children: userDetails?.children || '',
      smoking: userDetails?.smoking || '',
      drinking: userDetails?.drinking || '',
      religion: userDetails?.religion || '',
      occupation: userDetails?.occupation || '',
      lookingFor: userDetails?.lookingFor || '',
      genderVisible: userDetails?.genderVisible || true,
      typeVisible: userDetails?.typeVisible || true,
      lookingForVisible: userDetails?.lookingForVisible || true,
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await api.updateUser(selectedUser._id, editForm);
      setUserDetails(updatedUser.user);
      setEditMode(false);
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      fetchUsers(pagination.currentPage);
    } catch (err) {
      console.error('Error updating user:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to update user', severity: 'error' });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditForm({});
  };

  const handlePageChange = (event, page) => {
    fetchUsers(page);
  };

  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      sortable: false,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Avatar 
            src={params.row.imageUrls?.[0]} 
            sx={{ width: 40, height: 40 }}
          >
            {params.row.firstName?.[0]}{params.row.lastName?.[0]}
          </Avatar>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      valueGetter: (params) => {
        if (!params || !params.row) return '';
        return `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim();
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.2,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Tooltip title={params.row.email}>
            <Typography variant="body2" sx={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {params.row.email}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 80,
      valueGetter: (params) => {
        if (!params || !params.row) return 'N/A';
        return params.row.age || 'N/A';
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Chip 
            label={params.row.gender} 
            size="small" 
            color={params.row.gender === 'male' ? 'primary' : params.row.gender === 'female' ? 'secondary' : 'default'}
          />
        );
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Chip label={params.row.type} size="small" variant="outlined" />
        );
      },
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Tooltip title={params.row.location}>
            <Typography variant="body2" sx={{ 
              maxWidth: 150, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {params.row.location}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'matches',
      headerName: 'Matches',
      width: 100,
      valueGetter: (params) => {
        if (!params || !params.row) return 0;
        return params.row.matches?.length || 0;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 120,
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.createdAt) return '';
        return new Date(params.row.createdAt).toLocaleDateString();
      },
    },
    {
      field: 'lastActive',
      headerName: 'Last Active',
      width: 120,
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.lastActive) return '';
        return new Date(params.row.lastActive).toLocaleDateString();
      },
    },
    {
      field: 'visibility',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Chip 
            label={params.row.visibility === 'hidden' ? 'Banned' : 'Active'} 
            size="small" 
            color={params.row.visibility === 'hidden' ? 'error' : 'success'}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Box>
            <Tooltip title="View Details">
              <IconButton onClick={() => handleView(params.row)} size="small">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            {admin?.role === 'superadmin' && (
              <>
                <Tooltip title="Delete User">
                  <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                {params.row.visibility === 'hidden' ? (
                  <Tooltip title="Unban User">
                    <IconButton onClick={() => handleBanToggle(params.row._id, false)} size="small" color="success">
                      <UndoIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Ban User">
                    <IconButton onClick={() => handleBanToggle(params.row._id, true)} size="small" color="warning">
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        );
      },
    },
  ];

  const renderUserDialog = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            User Details: {userDetails?.firstName} {userDetails?.lastName}
          </Typography>
          {!editMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEdit}
              variant="outlined"
              size="small"
            >
              Edit
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Profile" />
          <Tab label="Activity" />
          <Tab label="Messages" />
          <Tab label="Photos" />
          <Tab label="Preferences" />
        </Tabs>
        
        {tab === 0 && userDetails && (
          <Box>
            {editMode ? (
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    fullWidth
                    margin="dense"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Location"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Hometown"
                    value={editForm.hometown}
                    onChange={(e) => setEditForm(prev => ({ ...prev, hometown: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Height"
                    value={editForm.height}
                    onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Occupation"
                    value={editForm.occupation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Children</InputLabel>
                    <Select
                      value={editForm.children}
                      onChange={(e) => setEditForm(prev => ({ ...prev, children: e.target.value }))}
                      label="Children"
                    >
                      <MenuItem value="Yes, I have children">Yes, I have children</MenuItem>
                      <MenuItem value="No, I don't have children">No, I don't have children</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Smoking</InputLabel>
                    <Select
                      value={editForm.smoking}
                      onChange={(e) => setEditForm(prev => ({ ...prev, smoking: e.target.value }))}
                      label="Smoking"
                    >
                      <MenuItem value="Yes, I smoke">Yes, I smoke</MenuItem>
                      <MenuItem value="No, I don't smoke">No, I don't smoke</MenuItem>
                      <MenuItem value="Occasionally">Occasionally</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Drinking</InputLabel>
                    <Select
                      value={editForm.drinking}
                      onChange={(e) => setEditForm(prev => ({ ...prev, drinking: e.target.value }))}
                      label="Drinking"
                    >
                      <MenuItem value="Yes, I drink">Yes, I drink</MenuItem>
                      <MenuItem value="No, I don't drink">No, I don't drink</MenuItem>
                      <MenuItem value="Occasionally">Occasionally</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Religion"
                    value={editForm.religion}
                    onChange={(e) => setEditForm(prev => ({ ...prev, religion: e.target.value }))}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                        <Avatar 
                          src={userDetails.imageUrls?.[0]} 
                          sx={{ width: 100, height: 100, mb: 2 }}
                        >
                          {userDetails.firstName?.[0]}{userDetails.lastName?.[0]}
                        </Avatar>
                        <Typography variant="h6">
                          {userDetails.firstName} {userDetails.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {userDetails.age} years old • {userDetails.gender}
                        </Typography>
                        <Chip 
                          label={userDetails.visibility === 'hidden' ? 'Banned' : 'Active'} 
                          color={userDetails.visibility === 'hidden' ? 'error' : 'success'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>Contact</Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Email: {userDetails.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Location: {userDetails.location}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Hometown: {userDetails.hometown}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>Profile Info</Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Type: {userDetails.type}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Looking for: {userDetails.lookingFor}
                      </Typography>
                      {userDetails.height && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Height: {userDetails.height}
                        </Typography>
                      )}
                      {userDetails.occupation && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Occupation: {userDetails.occupation}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>About</Typography>
                      <Typography variant="body1" paragraph>
                        {userDetails.bio || 'No bio provided'}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="h6" gutterBottom>Lifestyle</Typography>
                      <Grid container spacing={2}>
                        {userDetails.children && (
                          <Grid xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Children: {userDetails.children}
                            </Typography>
                          </Grid>
                        )}
                        {userDetails.smoking && (
                          <Grid xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Smoking: {userDetails.smoking}
                            </Typography>
                          </Grid>
                        )}
                        {userDetails.drinking && (
                          <Grid xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Drinking: {userDetails.drinking}
                            </Typography>
                          </Grid>
                        )}
                        {userDetails.religion && (
                          <Grid xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Religion: {userDetails.religion}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                      
                      {userDetails.languages && userDetails.languages.length > 0 && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="h6" gutterBottom>Languages</Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {userDetails.languages.map((lang, index) => (
                              <Chip key={index} label={lang} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </>
                      )}
                      
                      {userDetails.prompts && userDetails.prompts.length > 0 && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="h6" gutterBottom>Prompts</Typography>
                          {userDetails.prompts.map((prompt, index) => (
                            <Box key={index} mb={2}>
                              <Typography variant="subtitle2" color="primary">
                                {prompt.question}
                              </Typography>
                              <Typography variant="body2">
                                {prompt.answer}
                              </Typography>
                            </Box>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {tab === 1 && userStats && (
          <Box>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Activity Statistics</Typography>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography variant="body2" color="textSecondary">Total Matches</Typography>
                        <Typography variant="h4" color="primary">{userStats.totalMatches}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="textSecondary">Total Likes</Typography>
                        <Typography variant="h4" color="secondary">{userStats.totalLikes}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="textSecondary">Blocked Users</Typography>
                        <Typography variant="h4" color="error">{userStats.totalBlocked}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="textSecondary">Rejected Profiles</Typography>
                        <Typography variant="h4" color="warning.main">{userStats.totalRejected}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Account Information</Typography>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography variant="body2" color="textSecondary">Days Since Joined</Typography>
                        <Typography variant="h4" color="info.main">{userStats.daysSinceJoined}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="textSecondary">Days Since Last Active</Typography>
                        <Typography variant="h4" color={userStats.daysSinceLastActive > 7 ? 'error' : 'success.main'}>
                          {userStats.daysSinceLastActive}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tab === 2 && userMessages && (
          <Box>
            <Typography variant="h6" gutterBottom>User Messages</Typography>
            {userMessages.length > 0 ? (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total Messages: {userMessages.length}
                </Typography>
                <List>
                  {userMessages.map((message, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle2" color="primary">
                            {message.senderId === selectedUser?._id ? 'Sent' : 'Received'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(message.timestamp || message.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" paragraph>
                          {message.content || message.message}
                        </Typography>
                        {message.chatId && (
                          <Typography variant="caption" color="textSecondary">
                            Chat ID: {message.chatId}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No messages found for this user
              </Typography>
            )}
          </Box>
        )}
        
        {tab === 3 && userDetails && (
          <Box>
            <Typography variant="h6" gutterBottom>Profile Photos</Typography>
            {userDetails.imageUrls && userDetails.imageUrls.length > 0 ? (
              <Grid container spacing={2}>
                {userDetails.imageUrls.map((url, index) => (
                  <Grid xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <Box
                        component="img"
                        src={url}
                        alt={`Photo ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No photos uploaded
              </Typography>
            )}
          </Box>
        )}
        
        {tab === 4 && userDetails && (
          <Box>
            <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Gender Visible: {userDetails.genderVisible ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Type Visible: {userDetails.typeVisible ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Looking For Visible: {userDetails.lookingForVisible ? 'Yes' : 'No'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <>
            <Button onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={3}>User Management</Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <TextField
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                fullWidth
                size="small"
                placeholder="Name, email, location..."
              />
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  label="Gender"
                >
                  {genderOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  label="Type"
                >
                  {typeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.visibility}
                  onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
                  label="Status"
                >
                  {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <TextField
                label="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
                size="small"
                placeholder="City, state..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Stats */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip label={`Total: ${pagination.totalUsers}`} color="primary" />
        <Chip label={`Active: ${users.filter(u => u.visibility === 'public').length}`} color="success" />
        <Chip label={`Banned: ${users.filter(u => u.visibility === 'hidden').length}`} color="error" />
        <Chip label={`With Photos: ${users.filter(u => u.imageUrls?.length > 0).length}`} color="info" />
        <Chip label={`With Matches: ${users.filter(u => u.matches?.length > 0).length}`} color="secondary" />
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          disableSelectionOnClick
          loading={loading}
          components={{
            NoRowsOverlay: () => (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="textSecondary">
                  No users found
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {renderUserDialog()}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Users; 