import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Drawer,
  Divider,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  People,
  Close,
  Delete,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
} from '../services/customersApi';

const emptyCustomerForm = {
  name: '',
  email: '',
  phone: '',
};

const customerDisplayName = (c) =>
  [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || '—';

const CustomersPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { hasPermission } = usePermissions();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyCustomerForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCustomers(getAuthHeaders());
      setCustomers(res.data || []);
    } catch (err) {
      showSnackbar(err.message || 'Failed to load customers', 'error');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!getAuthHeaders().Authorization) return;
    loadCustomers();
  }, [getAuthHeaders, loadCustomers]);

  const openAdd = () => {
    setForm(emptyCustomerForm);
    setFieldErrors({});
    setAddOpen(true);
  };

  const validateForm = () => {
    const next = {};
    const name = form.name?.trim() || '';
    const email = form.email?.trim() || '';
    const phone = form.phone?.trim() || '';
    if (!name) next.name = 'Name is required';
    if (!email && !phone) {
      next.contact = 'Enter an email or a phone number (or both)';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const email = form.email?.trim() || '';
      const phone = form.phone?.trim() || '';
      await createCustomer(
        {
          firstName: form.name.trim(),
          lastName: '',
          email: email || null,
          phone: phone || null,
        },
        getAuthHeaders()
      );
      showSnackbar('Customer added successfully');
      setAddOpen(false);
      await loadCustomers();
    } catch (err) {
      showSnackbar(err.message || 'Failed to create customer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (customer) => {
    setDeleteTarget(customer);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteCustomer(deleteTarget.id, getAuthHeaders());
      showSnackbar('Customer deleted');
      setConfirmOpen(false);
      setDeleteTarget(null);
      if (selectedCustomer?.id === deleteTarget.id) {
        setDrawerOpen(false);
        setSelectedCustomer(null);
      }
      await loadCustomers();
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete customer', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRowClick = (params) => {
    setSelectedCustomer(params.row);
    setDrawerOpen(true);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => customerDisplayName(row),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => row.email || '—',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => row.phone || '—',
    },
    {
      field: 'pointsBalance',
      headerName: 'Points Balance',
      width: 140,
      renderCell: () => <Chip label="0" size="small" variant="outlined" />,
      sortable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      renderCell: (params) =>
        hasPermission('customers.edit') ? (
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirm(params.row);
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Customers
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Customer List
                </Typography>
              </Box>
              {hasPermission('customers.edit') && (
                <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
                  Add Customer
                </Button>
              )}
            </Box>

            {loading ? (
              <Box>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <DataGrid
                  rows={customers}
                  columns={columns}
                  autoHeight
                  onRowClick={handleRowClick}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  disableRowSelectionOnClick={false}
                  sx={{ cursor: 'pointer' }}
                  slots={{
                    noRowsOverlay: () => (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography color="text.secondary">No customers found</Typography>
                      </Box>
                    ),
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              fullWidth
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              fullWidth
              error={Boolean(fieldErrors.contact)}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              fullWidth
              error={Boolean(fieldErrors.contact)}
              helperText={fieldErrors.contact || 'At least one of email or phone is required'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget ? customerDisplayName(deleteTarget) : 'this customer'}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        {selectedCustomer && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Customer Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              CONTACT INFO
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{customerDisplayName(selectedCustomer)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedCustomer.email || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedCustomer.phone || '—'}</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              PURCHASE HISTORY
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Purchase history will be available in a future update.
            </Typography>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomersPage;
