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
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  People,
  Close,
  Delete,
  Edit,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customersApi';

const emptyCustomerForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
};

const customerDisplayName = (c) =>
  [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || '—';

const DetailRow = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value || '—'}</Typography>
  </Box>
);

const CustomersPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { hasPermission } = usePermissions();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogMode, setDialogMode] = useState(null);
  const [form, setForm] = useState(emptyCustomerForm);
  const [editTarget, setEditTarget] = useState(null);
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
    setEditTarget(null);
    setDialogMode('add');
  };

  const openEdit = (customer) => {
    setForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
    });
    setFieldErrors({});
    setEditTarget(customer);
    setDialogMode('edit');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditTarget(null);
  };

  const validateForm = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.email.trim() && !form.phone.trim()) {
      next.contact = 'Enter an email or a phone number (or both)';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || '',
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        zipCode: form.zipCode.trim() || null,
      };
      if (dialogMode === 'edit' && editTarget) {
        await updateCustomer(editTarget.id, payload, getAuthHeaders());
        showSnackbar('Customer updated successfully');
        if (selectedCustomer?.id === editTarget.id) {
          setSelectedCustomer((prev) => ({ ...prev, ...payload }));
        }
      } else {
        await createCustomer(payload, getAuthHeaders());
        showSnackbar('Customer added successfully');
      }
      closeDialog();
      await loadCustomers();
    } catch (err) {
      showSnackbar(
        err.message || (dialogMode === 'edit' ? 'Failed to update customer' : 'Failed to create customer'),
        'error'
      );
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
      valueGetter: (_, row) => row.pointsBalance ?? 0,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) =>
        hasPermission('customers.edit') ? (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              aria-label="edit"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(params.row);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteConfirm(params.row);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ) : null,
    },
  ];

  const dialogOpen = dialogMode === 'add' || dialogMode === 'edit';
  const dialogTitle = dialogMode === 'edit' ? 'Edit Customer' : 'Add Customer';

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
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <Typography color="text.secondary">
                          No customers yet — add your first customer above.
                        </Typography>
                      </Box>
                    ),
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                required
                fullWidth
                error={Boolean(fieldErrors.firstName)}
                helperText={fieldErrors.firstName}
              />
              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                fullWidth
              />
            </Box>
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
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                fullWidth
              />
              <TextField
                label="State"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                sx={{ width: 100 }}
              />
              <TextField
                label="ZIP"
                value={form.zipCode}
                onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
                sx={{ width: 120 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
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
              <IconButton onClick={() => setDrawerOpen(false)} aria-label="close drawer">
                <Close />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              CONTACT INFO
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <DetailRow label="Name" value={customerDisplayName(selectedCustomer)} />
              <DetailRow label="Email" value={selectedCustomer.email} />
              <DetailRow label="Phone" value={selectedCustomer.phone} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ADDRESS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <DetailRow label="Street" value={selectedCustomer.address} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DetailRow label="City" value={selectedCustomer.city} />
                <DetailRow label="State" value={selectedCustomer.state} />
                <DetailRow label="ZIP" value={selectedCustomer.zipCode} />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ACCOUNT
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <DetailRow
                label="Member Since"
                value={
                  selectedCustomer.createdAt
                    ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                    : undefined
                }
              />
              <DetailRow
                label="Points Balance"
                value={String(selectedCustomer.pointsBalance ?? 0)}
              />
            </Box>

            {hasPermission('customers.edit') && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setDrawerOpen(false);
                      openEdit(selectedCustomer);
                    }}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => {
                      setDrawerOpen(false);
                      openDeleteConfirm(selectedCustomer);
                    }}
                    fullWidth
                  >
                    Delete
                  </Button>
                </Box>
              </>
            )}
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
