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
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
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
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching reports with filters:', filters);
      const data = await api.getReports(filters);
      console.log('Reports API response:', data);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching report stats...');
      const data = await api.getReportStats();
      console.log('Report stats response:', data);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch report stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [token, filters]);

  const handleView = (report) => {
    console.log('Opening report details for:', report);
    setSelectedReport(report);
    setDialogOpen(true);
    setAdminNotes(report.adminNotes || '');
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      console.log('Updating report status:', reportId, newStatus);
      await api.updateReport(reportId, { status: newStatus, adminNotes });
      setSnackbar({ open: true, message: 'Report status updated successfully', severity: 'success' });
      setDialogOpen(false);
      fetchReports();
      fetchStats();
    } catch (err) {
      console.error('Error updating report:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to update report', severity: 'error' });
    }
  };

  const handleRefresh = () => {
    fetchReports();
    fetchStats();
  };

  const columns = [
    {
      field: 'reporter',
      headerName: 'Reporter',
      flex: 1,
      renderCell: (params) => {
        const reporter = params.row.reporterId;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={reporter?.photos?.[0]} sx={{ width: 32, height: 32 }}>
              {reporter?.firstName?.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              {reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Unknown'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'reportedUser',
      headerName: 'Reported User',
      flex: 1,
      renderCell: (params) => {
        const reportedUser = params.row.reportedUserId;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={reportedUser?.photos?.[0]} sx={{ width: 32, height: 32 }}>
              {reportedUser?.firstName?.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              {reportedUser ? `${reportedUser.firstName} ${reportedUser.lastName}` : 'Unknown'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'reason',
      headerName: 'Reason',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={reasonLabels[params.value] || params.value} 
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
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={statusColors[params.value] || 'default'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Reported On',
      flex: 1,
      valueGetter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton onClick={() => handleView(params.row)} color="primary" size="small">
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
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
          Reports Management
        </Typography>
        <Tooltip title="Refresh Reports">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Report Statistics */}
      {!statsLoading && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Total Reports
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {stats.totalReports || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Pending Reports
                </Typography>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {stats.pendingReports || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Resolved Reports
                </Typography>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.resolvedReports || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Reports This Week
                </Typography>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {stats.recentReports || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" mb={2} color="primary">
          Filters
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Reason"
            value={filters.reason}
            onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Reasons</MenuItem>
            {Object.entries(reasonLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Reports DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        {reports.length === 0 && !loading ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="100%" 
            gap={2}
            sx={{ 
              backgroundColor: 'background.paper', 
              borderRadius: 2, 
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" color="textSecondary">
              {error ? 'Error Loading Reports' : 'No Reports Found'}
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center" maxWidth={400}>
              {error 
                ? 'There was an error loading the reports. Please try refreshing the page.'
                : 'There are currently no reports to display. Reports will appear here when users report other users.'
              }
            </Typography>
            <Button 
              onClick={handleRefresh} 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              sx={{ mt: 1 }}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <DataGrid
            rows={reports}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            loading={loading}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer',
              },
            }}
            onRowClick={(params) => {
              console.log('Row clicked:', params.row);
              handleView(params.row);
            }}
          />
        )}
      </Box>

      {/* Report Details Dialog */}
      {renderReportDialog()}

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

  function renderReportDialog() {
    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box display="flex" flexDirection="column" gap={3} mt={1}>
              {/* Report Information */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Report Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                    <Chip 
                      label={selectedReport.status} 
                      color={statusColors[selectedReport.status] || 'default'}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                    <Typography variant="body1">
                      {reasonLabels[selectedReport.reason] || selectedReport.reason}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedReport.description || 'No description provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Reported On</Typography>
                    <Typography variant="body1">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Reporter Information */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Reporter Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selectedReport.reporterId?.photos?.[0]} sx={{ width: 48, height: 48 }}>
                    {selectedReport.reporterId?.firstName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedReport.reporterId?.firstName} {selectedReport.reporterId?.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedReport.reporterId?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Reported User Information */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Reported User Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selectedReport.reportedUserId?.photos?.[0]} sx={{ width: 48, height: 48 }}>
                    {selectedReport.reportedUserId?.firstName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedReport.reportedUserId?.firstName} {selectedReport.reportedUserId?.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedReport.reportedUserId?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Admin Actions */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Admin Actions
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Admin Notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  sx={{ mb: 2 }}
                />
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
                    disabled={selectedReport.status === 'resolved'}
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleStatusUpdate(selectedReport._id, 'reviewed')}
                    disabled={selectedReport.status === 'reviewed'}
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleStatusUpdate(selectedReport._id, 'dismissed')}
                    disabled={selectedReport.status === 'dismissed'}
                  >
                    Dismiss Report
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
};

export default Reports; 