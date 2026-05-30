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
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  People,
  Close,
  Delete,
  Edit,
  CardGiftcard,
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
import {
  getCustomerLoyalty,
  redeemLoyaltyPoints,
  getLoyaltySettings,
} from '../services/loyaltyApi';

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

const TRANSACTION_TYPE_LABELS = {
  earn_sale: 'Purchase',
  earn_tradein: 'Trade-In',
  redeem: 'Redemption',
};

const RedeemPointsDialog = ({
  open,
  onClose,
  customer,
  loyaltyBalance,
  redemptionRate,
  onRedeem,
  redeeming,
}) => {
  const [points, setPoints] = useState('');
  const pointsNum = parseInt(points, 10);
  const validPoints = !isNaN(pointsNum) && pointsNum > 0 && pointsNum <= loyaltyBalance;
  const creditPreview =
    validPoints && redemptionRate > 0
      ? (pointsNum / redemptionRate).toFixed(2)
      : null;

  const handleClose = () => {
    setPoints('');
    onClose();
  };

  const handleSubmit = () => {
    if (!validPoints) return;
    onRedeem(pointsNum, handleClose);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Redeem Points</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Current Balance
            </Typography>
            <Chip label={`${loyaltyBalance} pts`} color="primary" size="small" />
          </Box>
          <TextField
            label="Points to Redeem"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            fullWidth
            inputProps={{ min: 1, max: loyaltyBalance }}
            error={points !== '' && !validPoints}
            helperText={
              points !== '' && !validPoints
                ? `Enter a value between 1 and ${loyaltyBalance}`
                : ' '
            }
          />
          {creditPreview !== null && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Store Credit
              </Typography>
              <Typography variant="body1" fontWeight={600} color="success.main">
                ${creditPreview}
              </Typography>
            </Box>
          )}
          {redemptionRate > 0 && (
            <Typography variant="caption" color="text.secondary">
              Rate: {redemptionRate} points = $1.00 store credit
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!validPoints || redeeming}
        >
          {redeeming ? <CircularProgress size={20} /> : 'Redeem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const LoyaltyTab = ({ customer, loyaltyData, loyaltyLoading, loyaltySettings, onRedeem, redeeming, showSnackbar, getAuthHeaders }) => {
  const balance = loyaltyData?.balance ?? customer.pointsBalance ?? 0;
  const transactions = loyaltyData?.transactions ?? [];
  const loyaltyEnabled = loyaltySettings?.enabled !== false;
  const redemptionRate = loyaltySettings?.redemptionRate ?? 0;

  const [redeemOpen, setRedeemOpen] = useState(false);

  const handleRedeem = (points, onSuccess) => {
    onRedeem(points, onSuccess);
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Points Balance
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={loyaltyLoading ? '…' : `${balance} pts`}
              color="primary"
              icon={<CardGiftcard />}
              sx={{ fontWeight: 700, fontSize: '1rem', height: 36, px: 1 }}
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CardGiftcard />}
          disabled={balance === 0 || !loyaltyEnabled || loyaltyLoading}
          onClick={() => setRedeemOpen(true)}
        >
          Redeem Points
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        TRANSACTION HISTORY
      </Typography>

      {loyaltyLoading ? (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ) : transactions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No loyalty transactions yet.
        </Typography>
      ) : (
        <List disablePadding>
          {transactions.map((tx, idx) => (
            <ListItem
              key={tx.id ?? idx}
              disablePadding
              sx={{
                py: 1,
                borderBottom: idx < transactions.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={500}>
                      {TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type}
                    </Typography>
                    <Chip
                      label={`${tx.type === 'redeem' ? '-' : '+'}${tx.points} pts`}
                      size="small"
                      color={tx.type === 'redeem' ? 'default' : 'success'}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString()
                        : '—'}
                    </Typography>
                    {tx.reference && (
                      <Typography variant="caption" color="text.secondary">
                        Ref: {tx.reference}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <RedeemPointsDialog
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        customer={customer}
        loyaltyBalance={balance}
        redemptionRate={redemptionRate}
        onRedeem={handleRedeem}
        redeeming={redeeming}
      />
    </Box>
  );
};

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
  const [drawerTab, setDrawerTab] = useState(0);

  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

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

  const loadLoyaltyData = useCallback(async (customerId) => {
    setLoyaltyLoading(true);
    setLoyaltyData(null);
    try {
      const [loyaltyRes, settingsRes] = await Promise.all([
        getCustomerLoyalty(customerId, getAuthHeaders()),
        getLoyaltySettings(getAuthHeaders()),
      ]);
      setLoyaltyData(loyaltyRes.data ?? null);
      setLoyaltySettings(settingsRes.data ?? null);
    } catch (err) {
      showSnackbar(err.message || 'Failed to load loyalty data', 'error');
    } finally {
      setLoyaltyLoading(false);
    }
  }, [getAuthHeaders]);

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
    setDrawerTab(0);
    setDrawerOpen(true);
    loadLoyaltyData(params.row.id);
  };

  const handleRedeem = async (points, onSuccess) => {
    if (!selectedCustomer) return;
    try {
      setRedeeming(true);
      await redeemLoyaltyPoints(selectedCustomer.id, points, getAuthHeaders());
      showSnackbar('Points redeemed successfully');
      onSuccess?.();
      await loadLoyaltyData(selectedCustomer.id);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, pointsBalance: Math.max(0, (c.pointsBalance ?? 0) - points) }
            : c
        )
      );
      setSelectedCustomer((prev) =>
        prev ? { ...prev, pointsBalance: Math.max(0, (prev.pointsBalance ?? 0) - points) } : prev
      );
    } catch (err) {
      showSnackbar(err.message || 'Failed to redeem points', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => params.row ? customerDisplayName(params.row) : '—',
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => params.row?.email || '—',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 140,
      valueGetter: (params) => params.row?.phone || '—',
    },
    {
      field: 'pointsBalance',
      headerName: 'Points Balance',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.row.pointsBalance ?? 0}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
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
                  rows={customers.filter(Boolean)}
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
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
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

            <Divider sx={{ mb: 2 }} />

            <Tabs
              value={drawerTab}
              onChange={(_, v) => setDrawerTab(v)}
              sx={{ mb: 2 }}
              variant="fullWidth"
            >
              <Tab label="Details" />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Loyalty
                    <Chip
                      label={loyaltyData?.balance ?? selectedCustomer.pointsBalance ?? 0}
                      size="small"
                      color="primary"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Box>
                }
              />
            </Tabs>

            {drawerTab === 0 && (
              <>
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
              </>
            )}

            {drawerTab === 1 && (
              <LoyaltyTab
                customer={selectedCustomer}
                loyaltyData={loyaltyData}
                loyaltyLoading={loyaltyLoading}
                loyaltySettings={loyaltySettings}
                onRedeem={handleRedeem}
                redeeming={redeeming}
                showSnackbar={showSnackbar}
                getAuthHeaders={getAuthHeaders}
              />
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
