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
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
import { ArrowBack, Add, Handshake } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConsignmentItems, createConsignmentItem } from '../services/consignmentApi';
import { getCustomers } from '../services/customersApi';

const STATUS_TABS = ['all', 'active', 'sold', 'returned'];

const statusChipProps = {
  active: { label: 'Active', color: 'primary' },
  sold: { label: 'Sold', color: 'success' },
  returned: { label: 'Returned', color: 'default' },
};

const emptyForm = {
  customer: null,
  description: '',
  askingPrice: '',
  splitPercent: '50',
};

const customerDisplayName = (c) =>
  [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email || `Customer #${c.id}`;

const ConsignmentPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadItems = useCallback(
    async (status) => {
      try {
        setLoading(true);
        const res = await getConsignmentItems(getAuthHeaders(), status);
        setItems(res.data || []);
      } catch (err) {
        showSnackbar(err.message || 'Failed to load consignment items', 'error');
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    if (!getAuthHeaders().Authorization) return;
    loadItems(activeTab);
  }, [getAuthHeaders, loadItems, activeTab]);

  const loadCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      const res = await getCustomers(getAuthHeaders());
      setCustomers(res.data || []);
    } catch {
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, [getAuthHeaders]);

  const openAdd = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setAddOpen(true);
    loadCustomers();
  };

  const validateForm = () => {
    const next = {};
    if (!form.customer) next.customer = 'Customer is required';
    if (!form.description?.trim()) next.description = 'Description is required';
    const price = parseFloat(form.askingPrice);
    if (!form.askingPrice || isNaN(price) || price <= 0)
      next.askingPrice = 'Enter a valid asking price';
    const split = parseFloat(form.splitPercent);
    if (form.splitPercent === '' || isNaN(split) || split < 0 || split > 100)
      next.splitPercent = 'Enter a split % between 0 and 100';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      await createConsignmentItem(
        {
          customerId: form.customer.id,
          description: form.description.trim(),
          askingPrice: parseFloat(form.askingPrice),
          splitPercent: parseFloat(form.splitPercent),
        },
        getAuthHeaders()
      );
      showSnackbar('Consignment item added');
      setAddOpen(false);
      await loadItems(activeTab);
    } catch (err) {
      showSnackbar(err.message || 'Failed to create consignment item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => {
        if (row.customer) return customerDisplayName(row.customer);
        if (row.customerName) return row.customerName;
        return row.customerId ? `Customer #${row.customerId}` : '—';
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      valueGetter: (_, row) => row.description || '—',
    },
    {
      field: 'askingPrice',
      headerName: 'Asking Price',
      width: 140,
      valueGetter: (_, row) =>
        row.askingPrice != null
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              Number(row.askingPrice)
            )
          : '—',
    },
    {
      field: 'splitPercent',
      headerName: 'Split %',
      width: 100,
      valueGetter: (_, row) =>
        row.splitPercent != null ? `${row.splitPercent}%` : '—',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const s = params.value?.toLowerCase();
        const props = statusChipProps[s] || { label: params.value || '—', color: 'default' };
        return <Chip label={props.label} color={props.color} size="small" />;
      },
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Consignment
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
                mb: 2,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Handshake sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Consignment Items
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
                Add Consignment
              </Button>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              {STATUS_TABS.map((tab) => (
                <Tab
                  key={tab}
                  value={tab}
                  label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                />
              ))}
            </Tabs>

            {loading ? (
              <Box>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={52}
                    sx={{ mb: 1, borderRadius: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <DataGrid
                  rows={items}
                  columns={columns}
                  autoHeight
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  disableRowSelectionOnClick
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
                          No consignment items found
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

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Consignment Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Autocomplete
              options={customers}
              loading={customersLoading}
              getOptionLabel={(c) => customerDisplayName(c)}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={form.customer}
              onChange={(_, value) => setForm((f) => ({ ...f, customer: value }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  required
                  error={Boolean(fieldErrors.customer)}
                  helperText={fieldErrors.customer}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {customersLoading ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              fullWidth
              multiline
              minRows={2}
              error={Boolean(fieldErrors.description)}
              helperText={fieldErrors.description}
            />
            <TextField
              label="Asking Price"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.askingPrice}
              onChange={(e) => setForm((f) => ({ ...f, askingPrice: e.target.value }))}
              required
              fullWidth
              error={Boolean(fieldErrors.askingPrice)}
              helperText={fieldErrors.askingPrice}
            />
            <TextField
              label="Split %"
              type="number"
              inputProps={{ min: 0, max: 100, step: '1' }}
              value={form.splitPercent}
              onChange={(e) => setForm((f) => ({ ...f, splitPercent: e.target.value }))}
              required
              fullWidth
              error={Boolean(fieldErrors.splitPercent)}
              helperText={fieldErrors.splitPercent || 'Percentage the consignor receives on sale'}
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

export default ConsignmentPage;
