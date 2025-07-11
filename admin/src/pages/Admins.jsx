import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';

const Admins = () => {
  const { token, admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'moderator' });
  const [selectedId, setSelectedId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchAdmins = () => {
    setLoading(true);
    fetch('https://lashwa.com/admin/admins', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setAdmins(data.admins || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch admins');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, [token]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({ email: '', password: '', role: 'moderator' });
    setDialogOpen(true);
    setSelectedId(null);
    setFormError('');
  };
  const handleOpenEdit = admin => {
    setEditMode(true);
    setForm({ email: admin.email, password: '', role: admin.role });
    setDialogOpen(true);
    setSelectedId(admin._id);
    setFormError('');
  };
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    setFormLoading(true);
    try {
      const res = await fetch(`https://lashwa.com/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFormSuccess('Admin deleted');
        fetchAdmins();
      } else {
        setFormError('Failed to delete admin');
      }
    } catch {
      setFormError('Failed to delete admin');
    }
    setFormLoading(false);
  };
  const handleSubmit = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      const url = editMode ? `https://lashwa.com/admin/admins/${selectedId}` : 'https://lashwa.com/admin/register';
      const method = editMode ? 'PATCH' : 'POST';
      const body = editMode ? { role: form.role, password: form.password } : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setFormSuccess(editMode ? 'Admin updated' : 'Admin created');
        setDialogOpen(false);
        fetchAdmins();
      } else {
        setFormError('Failed to save admin');
      }
    } catch {
      setFormError('Failed to save admin');
    }
    setFormLoading(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={2}>Admin Users</Typography>
      {admin?.role === 'superadmin' && (
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={handleOpenAdd}>
          Add Admin
        </Button>
      )}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, p: 2 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f6fa' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Role</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Created</th>
              {admin?.role === 'superadmin' && <th style={{ padding: 8 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{a.email}</td>
                <td style={{ padding: 8, textTransform: 'capitalize' }}>{a.role}</td>
                <td style={{ padding: 8 }}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
                {admin?.role === 'superadmin' && (
                  <td style={{ padding: 8 }}>
                    <IconButton onClick={() => handleOpenEdit(a)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(a._id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            fullWidth
            margin="normal"
            required
            disabled={editMode}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
            margin="normal"
            required={!editMode}
            placeholder={editMode ? 'Leave blank to keep current password' : ''}
          />
          <TextField
            select
            label="Role"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value="superadmin">Superadmin</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
          </TextField>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={formLoading}>
            {formLoading ? <CircularProgress size={22} /> : (editMode ? 'Save' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!formSuccess}
        autoHideDuration={3000}
        onClose={() => setFormSuccess('')}
        message={formSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Admins; 