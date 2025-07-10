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
import { useAuth } from '../context/AuthContext';

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
  const [messages, setMessages] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMatches, setErrorMatches] = useState('');
  const [errorMessages, setErrorMessages] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', role: 'moderator' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('http://localhost:3000/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch users');
        setLoading(false);
      });
  };

  const fetchMatches = userId => {
    setLoadingMatches(true);
    setErrorMatches('');
    fetch(`http://localhost:3000/admin/users/${userId}/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMatches(data.matches || []);
        setLoadingMatches(false);
      })
      .catch(() => {
        setErrorMatches('Failed to fetch matches');
        setLoadingMatches(false);
      });
  };

  const fetchMessages = userId => {
    setLoadingMessages(true);
    setErrorMessages('');
    fetch(`http://localhost:3000/admin/users/${userId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
        setLoadingMessages(false);
      })
      .catch(() => {
        setErrorMessages('Failed to fetch messages');
        setLoadingMessages(false);
      });
  };

  const fetchUserReports = userId => {
    setLoadingReports(true);
    fetch(`http://localhost:3000/admin/users/${userId}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUserReports(data.reports || []);
        setLoadingReports(false);
      })
      .catch(() => {
        setLoadingReports(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const handleView = user => {
    setSelectedUser(user);
    setDialogOpen(true);
    setTab(0);
    fetchMatches(user._id);
    fetchMessages(user._id);
    fetchUserReports(user._id);
  };

  const handleDelete = async userId => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`http://localhost:3000/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
      fetchUsers();
    } else {
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  const handleBanToggle = async (userId, ban) => {
    const res = await fetch(`http://localhost:3000/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ban }),
    });
    if (res.ok) {
      setSnackbar({ open: true, message: ban ? 'User banned' : 'User unbanned', severity: 'success' });
      fetchUsers();
    } else {
      setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
    }
  };

  const handleAddAdmin = async () => {
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      const res = await fetch('http://localhost:3000/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAddSuccess('Admin user created successfully');
        setAddDialogOpen(false);
        setAddForm({ email: '', password: '', role: 'moderator' });
        fetchUsers();
      } else {
        setAddError(data.message || 'Failed to create admin');
      }
    } catch (e) {
      setAddError('Failed to create admin');
    }
    setAddLoading(false);
  };

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const searchMatch =
      !search ||
      (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    if (!searchMatch) return false;
    if (filters.name && !(`${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(filters.name.toLowerCase()))) return false;
    if (filters.gender && u.gender !== filters.gender) return false;
    if (filters.ban && u.visibility !== filters.ban) return false;
    if (filters.location && !u.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.age && u.age !== Number(filters.age)) return false;
    if (filters.joinDate && u.createdAt && !u.createdAt.startsWith(filters.joinDate)) return false;
    return true;
  });

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      valueGetter: params =>
        params && params.row
          ? `${params.row.firstName || ''} ${params.row.lastName || ''}`
          : '',
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'gender', headerName: 'Gender', flex: 0.7 },
    { field: 'type', headerName: 'Type', flex: 0.7 },
    { field: 'location', headerName: 'Location', flex: 1 },
    {
      field: 'visibility',
      headerName: 'Status',
      flex: 0.7,
      valueGetter: params =>
        params && params.row
          ? params.row.visibility === 'hidden' ? 'Banned' : 'Active'
          : '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: params => (
        <Box>
          <IconButton onClick={() => handleView(params.row)} title="View"><VisibilityIcon /></IconButton>
          {admin?.role === 'superadmin' && (
            <>
              <IconButton onClick={() => handleDelete(params.row._id)} title="Delete"><DeleteIcon /></IconButton>
              {params.row.visibility === 'hidden' ? (
                <IconButton onClick={() => handleBanToggle(params.row._id, false)} title="Unban"><UndoIcon /></IconButton>
              ) : (
                <IconButton onClick={() => handleBanToggle(params.row._id, true)} title="Ban"><BlockIcon /></IconButton>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  // Edit modal tabs: Profile, Matches, Messages
  const renderUserDialog = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Profile" />
          <Tab label="Matches" />
          <Tab label="Messages" />
          <Tab label="Reports" />
        </Tabs>
        {tab === 0 && selectedUser && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="First Name" value={selectedUser.firstName || ''} fullWidth margin="dense" />
            <TextField label="Last Name" value={selectedUser.lastName || ''} fullWidth margin="dense" />
            <TextField label="Email" value={selectedUser.email || ''} fullWidth margin="dense" />
            <TextField label="Gender" value={selectedUser.gender || ''} fullWidth margin="dense" />
            <TextField label="Location" value={selectedUser.location || ''} fullWidth margin="dense" />
            <TextField label="Bio" value={selectedUser.bio || ''} fullWidth margin="dense" multiline rows={2} />
            {/* TODO: Add photo and preferences editing */}
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography variant="subtitle1" mb={1}>Match History</Typography>
            {loadingMatches ? (
              <CircularProgress size={24} />
            ) : errorMatches ? (
              <Alert severity="error">{errorMatches}</Alert>
            ) : matches.length === 0 ? (
              <Typography>No matches found.</Typography>
            ) : (
              <ul>
                {matches.map((m, i) => (
                  <li key={i}>{m.name} ({m.date})</li>
                ))}
              </ul>
            )}
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Typography variant="subtitle1" mb={1}>Messages</Typography>
            {loadingMessages ? (
              <CircularProgress size={24} />
            ) : errorMessages ? (
              <Alert severity="error">{errorMessages}</Alert>
            ) : messages.length === 0 ? (
              <Typography>No messages found.</Typography>
            ) : (
              <ul>
                {messages.map((msg, i) => (
                  <li key={i}>
                    {msg.to ? `To ${msg.to}: ` : ''}
                    {msg.from ? `From ${msg.from}: ` : ''}
                    "{msg.text}" ({msg.date})
                  </li>
                ))}
              </ul>
            )}
          </Box>
        )}
        {tab === 3 && (
          <Box>
            <Typography variant="subtitle1" mb={1}>Reports</Typography>
            {loadingReports ? (
              <CircularProgress size={24} />
            ) : userReports.length === 0 ? (
              <Typography>No reports found.</Typography>
            ) : (
              <Box>
                <Typography variant="subtitle2" mb={1}>Reports Filed Against This User:</Typography>
                {userReports.filter(r => r.reportedUserId?._id === selectedUser._id).map((report, i) => (
                  <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Reported by: {report.reporterId?.firstName} {report.reporterId?.lastName}
                    </Typography>
                    <Typography variant="body2">Reason: {report.reason}</Typography>
                    <Typography variant="body2">Status: {report.status}</Typography>
                    {report.description && (
                      <Typography variant="body2">Description: {report.description}</Typography>
                    )}
                    <Typography variant="caption" color="textSecondary">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
                
                <Typography variant="subtitle2" mb={1} mt={3}>Reports Filed By This User:</Typography>
                {userReports.filter(r => r.reporterId?._id === selectedUser._id).map((report, i) => (
                  <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Reported: {report.reportedUserId?.firstName} {report.reportedUserId?.lastName}
                    </Typography>
                    <Typography variant="body2">Reason: {report.reason}</Typography>
                    <Typography variant="body2">Status: {report.status}</Typography>
                    {report.description && (
                      <Typography variant="body2">Description: {report.description}</Typography>
                    )}
                    <Typography variant="caption" color="textSecondary">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Close</Button>
        {/* TODO: Add Save/Edit actions */}
      </DialogActions>
    </Dialog>
  );

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={2}>User Management</Typography>
      {admin?.role === 'superadmin' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Admin User
        </Button>
      )}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <SearchIcon sx={{ color: '#888' }} />
        <TextField
          label="Search users"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        />
        <TextField
          label="Name"
          value={filters.name}
          onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          size="small"
          sx={{ minWidth: 140 }}
        />
        <TextField
          select
          label="Status"
          value={filters.ban}
          onChange={e => setFilters(f => ({ ...f, ban: e.target.value }))}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {banOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>
      </Box>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          select
          label="Gender"
          value={filters.gender}
          onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {genderOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>
        <TextField
          label="Location"
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          size="small"
        />
        <TextField
          label="Age"
          value={filters.age}
          onChange={e => setFilters(f => ({ ...f, age: e.target.value }))}
          size="small"
          type="number"
        />
        <TextField
          label="Join Date"
          value={filters.joinDate}
          onChange={e => setFilters(f => ({ ...f, joinDate: e.target.value }))}
          size="small"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <Box sx={{ height: 500, width: '100%', bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={row => row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>
      {renderUserDialog()}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Admin User</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            value={addForm.email}
            onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={addForm.password}
            onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            value={addForm.role}
            onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value="superadmin">Superadmin</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
          </TextField>
          {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAdmin} variant="contained" color="primary" disabled={addLoading}>
            {addLoading ? <CircularProgress size={22} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!addSuccess}
        autoHideDuration={3000}
        onClose={() => setAddSuccess('')}
        message={addSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
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