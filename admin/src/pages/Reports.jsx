import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';


const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const reasonLabels = {
  inappropriate_content: 'Inappropriate Content',
  harassment: 'Harassment',
  fake_profile: 'Fake Profile',
  spam: 'Spam',
  underage: 'Underage',
  violence: 'Violence',
  other: 'Other',
};

const statusColors = {
  pending: 'warning',
  reviewed: 'info',
  resolved: 'success',
  dismissed: 'error',
};

const Reports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({ status: '', reason: '' });
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.reason) params.reason = filters.reason;

      const data = await api.getReports(params);
      setReports(data.reports || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await api.getReportStats();
      setStats(data);
      setStatsLoading(false);
    } catch (err) {
      console.error('Error fetching report stats:', err);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStats();
    // eslint-disable-next-line
  }, [token, filters]);

  const handleView = report => {
    console.log('Selected report:', report); // Debug log
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (reportId, newStatus, adminNotes) => {
    try {
      await api.updateReport(reportId, { status: newStatus, adminNotes });
      setSnackbar({ open: true, message: 'Report status updated', severity: 'success' });
      setDialogOpen(false);
      fetchReports();
      fetchStats();
    } catch (err) {
      console.error('Error updating report:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to update report', severity: 'error' });
    }
  };

  const columns = [
    {
      field: 'reporter',
      headerName: 'Reporter',
      flex: 1.2,
      valueGetter: params => {
        if (!params || !params.row) return 'Unknown';
        const reporter = params.row.reporterId;
        if (!reporter) return 'Unknown';
        
        // Handle both populated and unpopulated reporter data
        if (typeof reporter === 'object') {
          return `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim() || reporter.email || 'Unknown';
        }
        return 'Unknown';
      },
      renderCell: params => {
        const reporter = params.row.reporterId;
        if (!reporter) return 'Unknown';
        
        if (typeof reporter === 'object') {
          const displayName = `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim() || 
                             reporter.email?.split('@')[0] || 'Unknown Name';
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {displayName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {reporter.email || 'No email'}
              </Typography>
            </Box>
          );
        }
        return 'Unknown';
      },
    },
    {
      field: 'reportedUser',
      headerName: 'Reported User',
      flex: 1.2,
      valueGetter: params => {
        if (!params || !params.row) return 'Unknown';
        const reportedUser = params.row.reportedUserId;
        if (!reportedUser) return 'Unknown';
        
        // Handle both populated and unpopulated reported user data
        if (typeof reportedUser === 'object') {
          return `${reportedUser.firstName || ''} ${reportedUser.lastName || ''}`.trim() || reportedUser.email || 'Unknown';
        }
        return 'Unknown';
      },
      renderCell: params => {
        const reportedUser = params.row.reportedUserId;
        if (!reportedUser) return 'Unknown';
        
        if (typeof reportedUser === 'object') {
          const displayName = `${reportedUser.firstName || ''} ${reportedUser.lastName || ''}`.trim() || 
                             reportedUser.email?.split('@')[0] || 'Unknown Name';
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {displayName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {reportedUser.email || 'No email'}
              </Typography>
            </Box>
          );
        }
        return 'Unknown';
      },
    },
    {
      field: 'reason',
      headerName: 'Reason',
      flex: 1,
      renderCell: params => (
        <Chip 
          label={reasonLabels[params?.value] || params?.value || ''} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: params => (
        <Chip 
          label={params?.value || ''} 
          size="small" 
          color={statusColors[params?.value] || 'default'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Reported On',
      flex: 1,
      valueGetter: params => {
        if (!params || !params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      renderCell: params => (
        <IconButton onClick={() => params?.row && handleView(params.row)} title="View Details">
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const renderReportDialog = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Report Details</DialogTitle>
      <DialogContent>
        {selectedReport && (
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Reporter</Typography>
                    <Typography variant="h6" gutterBottom>
                      {selectedReport.reporterId?.firstName || selectedReport.reporterId?.lastName
                        ? `${selectedReport.reporterId.firstName || ''} ${selectedReport.reporterId.lastName || ''}`.trim()
                        : selectedReport.reporterId?.email?.split('@')[0] || 'Unknown Name'
                      }
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Email: {selectedReport.reporterId?.email || 'No email'}
                    </Typography>
                    {selectedReport.reporterId?.age && (
                      <Typography variant="body2" color="textSecondary">
                        Age: {selectedReport.reporterId.age}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Reported User</Typography>
                    <Typography variant="h6" gutterBottom>
                      {selectedReport.reportedUserId?.firstName || selectedReport.reportedUserId?.lastName
                        ? `${selectedReport.reportedUserId.firstName || ''} ${selectedReport.reportedUserId.lastName || ''}`.trim()
                        : selectedReport.reportedUserId?.email?.split('@')[0] || 'Unknown Name'
                      }
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Email: {selectedReport.reportedUserId?.email || 'No email'}
                    </Typography>
                    {selectedReport.reportedUserId?.age && (
                      <Typography variant="body2" color="textSecondary">
                        Age: {selectedReport.reportedUserId.age}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
              <Chip 
                label={reasonLabels[selectedReport.reason] || selectedReport.reason} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            {selectedReport.description && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography variant="body1">{selectedReport.description}</Typography>
              </Box>
            )}
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Chip 
                label={selectedReport.status} 
                color={statusColors[selectedReport.status] || 'default'}
              />
            </Box>
            
            {selectedReport.adminNotes && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Admin Notes</Typography>
                <Typography variant="body1">{selectedReport.adminNotes}</Typography>
              </Box>
            )}
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Reported On</Typography>
              <Typography variant="body1">
                {new Date(selectedReport.createdAt).toLocaleString()}
              </Typography>
            </Box>
            
            {selectedReport.reviewedBy && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Reviewed By</Typography>
                <Typography variant="body1">{selectedReport.reviewedBy?.email}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(selectedReport.reviewedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Close</Button>
        {selectedReport?.status === 'pending' && (
          <>
            <Button 
              onClick={() => handleStatusUpdate(selectedReport._id, 'reviewed')}
              color="info"
            >
              Mark Reviewed
            </Button>
            <Button 
              onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
              color="success"
            >
              Resolve
            </Button>
            <Button 
              onClick={() => handleStatusUpdate(selectedReport._id, 'dismissed')}
              color="error"
            >
              Dismiss
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={2}>User Reports</Typography>
      
      {/* Statistics Cards */}
      {!statsLoading && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Reports</Typography>
                <Typography variant="h4">{stats.totalReports || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Pending</Typography>
                <Typography variant="h4" color="warning.main">{stats.pendingReports || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Resolved</Typography>
                <Typography variant="h4" color="success.main">{stats.resolvedReports || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>This Week</Typography>
                <Typography variant="h4" color="info.main">{stats.recentReports || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          select
          label="Status"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {statusOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Reason"
          value={filters.reason}
          onChange={e => setFilters(f => ({ ...f, reason: e.target.value }))}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Reasons</MenuItem>
          {Object.entries(reasonLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Reports Table */}
      <Box sx={{ height: 500, width: '100%', bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <DataGrid
          rows={reports}
          columns={columns}
          getRowId={row => row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>

      {renderReportDialog()}
      
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

export default Reports; 