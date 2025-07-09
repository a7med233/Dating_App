import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';

const Subscriptions = () => {
  const { token, admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({ subscriptionType: '', subscriptionStart: '', subscriptionEnd: '', isSubscribed: false });
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const handleEdit = user => {
    setEditUser(user);
    setForm({
      subscriptionType: user.subscriptionType || 'free',
      subscriptionStart: user.subscriptionStart ? user.subscriptionStart.slice(0, 10) : '',
      subscriptionEnd: user.subscriptionEnd ? user.subscriptionEnd.slice(0, 10) : '',
      isSubscribed: !!user.isSubscribed,
    });
    setDialogOpen(true);
  };

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    const res = await fetch(`http://localhost:3000/admin/users/${editUser._id}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        subscriptionType: form.subscriptionType,
        subscriptionStart: form.subscriptionStart,
        subscriptionEnd: form.subscriptionEnd,
        isSubscribed: form.isSubscribed,
      }),
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Subscription updated', severity: 'success' });
      setDialogOpen(false);
      fetchUsers();
    } else {
      setSnackbar({ open: true, message: 'Failed to update subscription', severity: 'error' });
    }
  };

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const searchMatch =
      !search ||
      (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    return searchMatch;
  });

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={2}>Subscription Management</Typography>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <SearchIcon sx={{ color: '#888' }} />
        <TextField
          label="Search users"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        />
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Name</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Email</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Type</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Start</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>End</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Active?</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{user.firstName} {user.lastName}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{user.email}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{user.subscriptionType || 'free'}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{user.subscriptionStart ? user.subscriptionStart.slice(0, 10) : ''}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{user.subscriptionEnd ? user.subscriptionEnd.slice(0, 10) : ''}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{user.isSubscribed ? 'Yes' : 'No'}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  {admin?.role === 'superadmin' && (
                    <Button size="small" variant="outlined" onClick={() => handleEdit(user)}>Edit</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Subscription</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Subscription Type"
              name="subscriptionType"
              value={form.subscriptionType}
              onChange={handleFormChange}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="gold">Gold</option>
            </TextField>
            <TextField
              label="Start Date"
              name="subscriptionStart"
              type="date"
              value={form.subscriptionStart}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              name="subscriptionEnd"
              type="date"
              value={form.subscriptionEnd}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Box display="flex" alignItems="center">
              <input
                type="checkbox"
                id="isSubscribed"
                name="isSubscribed"
                checked={form.isSubscribed}
                onChange={handleFormChange}
                style={{ marginRight: 8 }}
              />
              <label htmlFor="isSubscribed">Active Subscription</label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
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

export default Subscriptions; 