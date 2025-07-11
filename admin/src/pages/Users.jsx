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
import ReportIcon from '@mui/icons-material/Report';
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
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const genderOptions = [
  { value: '', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const banOptions = [
  { value: '', label: 'All' },
  { value: 'public', label: 'Active' },
  { value: 'hidden', label: 'Banned' },
];

const Users = () => {
  const { token, admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({ name: '', gender: '', ban: '', location: '', age: '', joinDate: '' });
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', role: 'moderator' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [errorMatches, setErrorMatches] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUsers();
      console.log('Users data received:', data);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (userId) => {
    try {
      setLoadingMatches(true);
      setErrorMatches('');
      const data = await api.getUserMatches(userId);
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setErrorMatches(err.message || 'Failed to fetch matches');
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      setErrorMessages('');
      const data = await api.getUserMessages(userId);
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setErrorMessages(err.message || 'Failed to fetch messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchUserReports = async (userId) => {
    try {
      setLoadingReports(true);
      const data = await api.getUserReports(userId);
      setUserReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch user reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleView = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setTab(0);
    fetchMatches(user._id);
    fetchMessages(user._id);
    fetchUserReports(user._id);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.deleteUser(userId);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      fetchUsers();
    } catch (err) {
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
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to update user', severity: 'error' });
    }
  };

  const handleAddAdmin = async () => {
    try {
      setAddLoading(true);
      setAddError('');
      setAddSuccess('');

      await api.registerAdmin(addForm);
      setAddSuccess('Admin user created successfully');
      setAddDialogOpen(false);
      setAddForm({ email: '', password: '', role: 'moderator' });
      fetchUsers();
    } catch (err) {
      setAddError(err.message || 'Failed to create admin');
    } finally {
      setAddLoading(false);
    }
  };

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const searchMatch =
      !search ||
      (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    const genderMatch = !filters.gender || u.gender === filters.gender;
    const banMatch = !filters.ban || u.visibility === filters.ban;
    const locationMatch = !filters.location ||
      (u.location && u.location.toLowerCase().includes(filters.location.toLowerCase()));

    return searchMatch && genderMatch && banMatch && locationMatch;
  });

  // Debug logging
  console.log('Users state:', users);
  console.log('Filtered users:', filteredUsers);

  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Avatar src={params.row.photos?.[0] || params.row.imageUrls?.[0] || ''} alt={params.row.firstName || ''}>
            {params.row.firstName?.charAt(0) || ''}
          </Avatar>
        );
      },
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
    },

    {
      field: 'visibility',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Chip
            label={params.value === 'hidden' ? 'Banned' : 'Active'}
            size="small"
            color={params.value === 'hidden' ? 'error' : 'success'}
          />
        );
      },
    },

    {
      field: 'matchesCount',
      headerName: 'Matches',
      width: 100,
      valueGetter: (params) => {
        if (!params || !params.row) return 0;
        return params.row.matchesCount || params.row.matches?.length || 0;
      },
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: 'likesCount',
      headerName: 'Likes Given',
      width: 120,
      valueGetter: (params) => {
        if (!params || !params.row) return 0;
        return params.row.likesCount || params.row.likedProfiles?.length || 0;
      },
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="success"
          variant="outlined"
        />
      ),
    },
    {
      field: 'receivedLikesCount',
      headerName: 'Likes Received',
      width: 130,
      valueGetter: (params) => {
        if (!params || !params.row) return 0;
        return params.row.receivedLikesCount || params.row.receivedLikes?.length || 0;
      },
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="warning"
          variant="outlined"
        />
      ),
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
              <IconButton onClick={() => handleView(params.row)} color="primary" size="small">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={params.row.visibility === 'hidden' ? 'Unban User' : 'Ban User'}>
              <IconButton
                onClick={() => handleBanToggle(params.row._id, params.row.visibility === 'hidden' ? false : true)}
                color={params.row.visibility === 'hidden' ? 'success' : 'warning'}
                size="small"
              >
                {params.row.visibility === 'hidden' ? <UndoIcon /> : <BlockIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
              <IconButton onClick={() => handleDelete(params.row._id)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box>
          <Tooltip title="Refresh Users">
            <IconButton onClick={fetchUsers} color="primary" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {admin?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Admin
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />

        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            select
            label="Gender"
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            sx={{ minWidth: 120 }}
          >
            {genderOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={filters.ban}
            onChange={(e) => setFilters({ ...filters, ban: e.target.value })}
            sx={{ minWidth: 120 }}
          >
            {banOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Box>

      {/* Users DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        {filteredUsers.length === 0 && !loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="textSecondary">No users found</Typography>
          </Box>
        ) : (
                  <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row._id}
          pagination
          paginationModel={{ page: 0, pageSize: 10 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={loading}
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
        )}
      </Box>

      {/* User Details Dialog */}
      {renderUserDialog()}

      {/* Add Admin Dialog */}
      {renderAddAdminDialog()}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  function renderUserDialog() {
    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          User Details: {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Profile" />
                <Tab label="Matches" />
                <Tab label="Messages" />
                <Tab label="Reports" />
              </Tabs>

              {tab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Profile Information</Typography>
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{selectedUser.email}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                      <Typography variant="body1">{selectedUser.gender}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Age</Typography>
                      <Typography variant="body1">
                        {selectedUser.dateOfBirth
                          ? (() => {
                            const [day, month, year] = selectedUser.dateOfBirth.split('/');
                            const birthYear = parseInt(year, 10);
                            const nowYear = new Date().getFullYear();
                            return isNaN(birthYear) ? 'N/A' : nowYear - birthYear;
                          })()
                          : 'N/A'
                        }
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                      <Typography variant="body1">{selectedUser.location || 'N/A'}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Hometown</Typography>
                      <Typography variant="body1">{selectedUser.hometown || 'N/A'}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Looking For</Typography>
                      <Typography variant="body1">{selectedUser.lookingFor || 'N/A'}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                      <Chip
                        label={selectedUser.visibility === 'hidden' ? 'Banned' : 'Active'}
                        color={selectedUser.visibility === 'hidden' ? 'error' : 'success'}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Joined</Typography>
                      <Typography variant="body1">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Last Active</Typography>
                      <Typography variant="body1">
                        {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Bio</Typography>
                      <Typography variant="body1">{selectedUser.bio || 'No bio provided'}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Matches Count</Typography>
                      <Chip
                        label={selectedUser.matchesCount || selectedUser.matches?.length || 0}
                        color="info"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Likes Given</Typography>
                      <Chip
                        label={selectedUser.likesCount || selectedUser.likedProfiles?.length || 0}
                        color="success"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Likes Received</Typography>
                      <Chip
                        label={selectedUser.receivedLikesCount || selectedUser.receivedLikes?.length || 0}
                        color="warning"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Photos</Typography>
                      <Chip
                        label={selectedUser.photos?.length || selectedUser.imageUrls?.length || 0}
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>User Matches</Typography>
                  {loadingMatches ? (
                    <CircularProgress />
                  ) : errorMatches ? (
                    <Alert severity="error">{errorMatches}</Alert>
                  ) : matches.length > 0 ? (
                    <Box>
                      {matches.map((match, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar src={match.photo} alt={match.name}>
                              {match.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {match.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {match.email}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Matched on: {match.date}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No matches found</Typography>
                  )}
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>User Messages</Typography>
                  {loadingMessages ? (
                    <CircularProgress />
                  ) : errorMessages ? (
                    <Alert severity="error">{errorMessages}</Alert>
                  ) : conversations.length > 0 ? (
                    <Box>
                      {conversations.map((conv, idx) => (
                        <Accordion key={conv.userId || idx}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box>
                              <Typography variant="subtitle1" color="primary">
                                Conversation with: {conv.userName} ({conv.userEmail})
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Total messages: {conv.messageCount}
                              </Typography>
                              {conv.lastMessage && (
                                <Typography variant="body2" color="textSecondary">
                                  Last: {conv.lastMessage.text} ({conv.lastMessage.date} {conv.lastMessage.time})
                                </Typography>
                              )}
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {conv.messages.map((msg, mIdx) => (
                              <Box key={msg.id || mIdx} sx={{ mb: 1, pl: 2 }}>
                                <Typography variant="body2">
                                  <b>{msg.isFromUser ? 'User' : conv.userName}:</b> {msg.text}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {msg.date} {msg.time}
                                </Typography>
                              </Box>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No messages found</Typography>
                  )}
                </Box>
              )}

              {tab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Reports Against User</Typography>
                  {loadingReports ? (
                    <CircularProgress />
                  ) : userReports.length > 0 ? (
                    <Box>
                      {userReports.map((report, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Reported by: {report.reporterId?.firstName} {report.reporterId?.lastName}
                          </Typography>
                          <Typography variant="body1">Reason: {report.reason}</Typography>
                          <Typography variant="body2">{report.description}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No reports found</Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  function renderAddAdminDialog() {
    return (
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          {addSuccess && <Alert severity="success" sx={{ mb: 2 }}>{addSuccess}</Alert>}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            select
            label="Role"
            value={addForm.role}
            onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
            margin="normal"
            required
          >
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddAdmin}
            variant="contained"
            disabled={addLoading}
          >
            {addLoading ? <CircularProgress size={24} /> : 'Add Admin'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

export default Users; 