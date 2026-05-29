import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Paper,
  Snackbar,
  Alert,
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Stack,
} from '@mui/material';
import { ArrowBack, Add, SwapHoriz, Delete, QrCodeScanner, SmartToy } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomers } from '../services/customersApi';
import { getTradeIns, createTradeIn, completeTradeIn, rejectTradeIn } from '../services/tradeInApi';
import AiScanDialog from './trade-ins/AiScanDialog';

const STATUS_TABS = ['all', 'draft', 'completed', 'rejected'];

const statusChipProps = {
  draft: { label: 'Draft', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
};

const CONDITIONS = ['poor', 'fair', 'good', 'excellent'];

let nextRowId = 1;

function makeBlankRow() {
  return {
    id: `new-${nextRowId++}`,
    gameTitle: '',
    platform: '',
    condition: 'good',
    offeredValue: '',
  };
}

const customerDisplayName = (c) =>
  [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email || `Customer #${c.id}`;

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

const TradeInPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [tradeIns, setTradeIns] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [paymentType, setPaymentType] = useState('Cash');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [activeDraftId, setActiveDraftId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadTradeIns = useCallback(
    async (status) => {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      try {
        setListLoading(true);
        const res = await getTradeIns(headers, status);
        setTradeIns(res.data || []);
      } catch (err) {
        showSnackbar(err.message || 'Failed to load trade-ins', 'error');
        setTradeIns([]);
      } finally {
        setListLoading(false);
      }
    },
    [getAuthHeaders, showSnackbar]
  );

  useEffect(() => {
    loadTradeIns(activeTab);
  }, [loadTradeIns, activeTab]);

  const loadCustomers = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    try {
      setCustomersLoading(true);
      const res = await getCustomers(headers);
      setCustomers(res.data || []);
    } catch {
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const totalOffered = items.reduce((sum, row) => {
    const v = parseFloat(row.offeredValue);
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  const handleAddItem = () => {
    setItems((prev) => [...prev, makeBlankRow()]);
  };

  const handleRemoveItem = useCallback((id) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const processRowUpdate = useCallback((newRow) => {
    setItems((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
    return newRow;
  }, []);

  const handleCompleteTrade = async () => {
    if (items.length === 0) return;
    const headers = getAuthHeaders();
    setSubmitting(true);
    try {
      const body = {
        customerId: selectedCustomer?.id ?? null,
        paymentType,
        items: items.map((row) => ({
          gameTitle: row.gameTitle,
          platform: row.platform,
          condition: row.condition,
          offeredValue: parseFloat(row.offeredValue) || 0,
        })),
      };
      const created = await createTradeIn(body, headers);
      const draftId = created.data?.id;
      if (!draftId) throw new Error('No trade-in ID returned from server');
      await completeTradeIn(draftId, paymentType, headers);
      showSnackbar('Trade-in completed successfully');
      setItems([]);
      setSelectedCustomer(null);
      setPaymentType('Cash');
      setActiveDraftId(null);
      await loadTradeIns(activeTab);
    } catch (err) {
      showSnackbar(err.message || 'Failed to complete trade-in', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!activeDraftId) return;
    const headers = getAuthHeaders();
    setSubmitting(true);
    try {
      await rejectTradeIn(activeDraftId, headers);
      showSnackbar('Trade-in rejected');
      setActiveDraftId(null);
      await loadTradeIns(activeTab);
    } catch (err) {
      showSnackbar(err.message || 'Failed to reject trade-in', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const listColumns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 160,
      valueGetter: (params) => {
        const row = params.row;
        const d = row.createdAt || row.createdDate || null;
        return d ? new Date(d).toLocaleDateString() : '—';
      },
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 140,
      valueGetter: (params) => {
        const row = params.row;
        if (row.customer) return customerDisplayName(row.customer);
        if (row.customerName) return row.customerName;
        return row.customerId ? `Customer #${row.customerId}` : '—';
      },
    },
    {
      field: 'itemsCount',
      headerName: 'Items #',
      width: 90,
      valueGetter: (params) => {
        const row = params.row;
        return Array.isArray(row.items) ? row.items.length : (row.itemsCount ?? '—');
      },
    },
    {
      field: 'totalOffered',
      headerName: 'Total Offered',
      width: 140,
      valueGetter: (params) => {
        const row = params.row;
        return row.totalOffered != null ? fmt(row.totalOffered) : '—';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const s = (params.value || '').toLowerCase();
        const props = statusChipProps[s] || { label: params.value || '—', color: 'default' };
        return <Chip label={props.label} color={props.color} size="small" />;
      },
    },
  ];

  const handleItemsParsed = useCallback((parsedItems) => {
    const newRows = parsedItems.map((item) => ({
      id: `new-${nextRowId++}`,
      gameTitle: item.gameTitle || item.title || '',
      platform: item.platform || '',
      condition: CONDITIONS.includes(item.condition) ? item.condition : 'good',
      offeredValue: item.offeredValue ?? '',
      aiGenerated: true,
    }));
    setItems((prev) => [...prev, ...newRows]);
  }, []);

  const itemColumns = [
    {
      field: 'aiGenerated',
      headerName: 'AI',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label="AI"
            size="small"
            color="info"
            icon={<SmartToy sx={{ fontSize: '14px !important' }} />}
            sx={{ fontSize: 11 }}
          />
        ) : null,
    },
    {
      field: 'gameTitle',
      headerName: 'Game Title',
      flex: 2,
      minWidth: 160,
      editable: true,
    },
    {
      field: 'platform',
      headerName: 'Platform',
      flex: 1,
      minWidth: 100,
      editable: true,
    },
    {
      field: 'condition',
      headerName: 'Condition',
      width: 130,
      editable: true,
      type: 'singleSelect',
      valueOptions: CONDITIONS,
    },
    {
      field: 'offeredValue',
      headerName: 'Offered Value',
      width: 140,
      editable: true,
      type: 'number',
      valueFormatter: (value) =>
        value !== '' && value != null ? `$${Number(value).toFixed(2)}` : '',
    },
    {
      field: 'actions',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleRemoveItem(params.row.id)}
          aria-label="Remove item"
        >
          <Delete fontSize="small" />
        </IconButton>
      ),
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
          <SwapHoriz sx={{ mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Trade-ins
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
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
              <SwapHoriz sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Trade-in History
              </Typography>
            </Box>
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

          {listLoading ? (
            <Box>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <DataGrid
                rows={tradeIns}
                columns={listColumns}
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
                      <Typography color="text.secondary">No trade-ins found</Typography>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </Paper>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
          }}
        >
          <Paper elevation={2} sx={{ flex: 2, p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Items to Trade In
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  onClick={() => setScanDialogOpen(true)}
                  size="small"
                >
                  Scan Games
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  size="small"
                >
                  Add Item Manually
                </Button>
              </Stack>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <DataGrid
                rows={items}
                columns={itemColumns}
                autoHeight
                editMode="row"
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={() => {}}
                hideFooter={items.length <= 10}
                pageSizeOptions={[10, 25]}
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
                        No items added — use "Scan Games" or "Add Item Manually" to start
                      </Typography>
                    </Box>
                  ),
                }}
                sx={{ minHeight: 200 }}
              />
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ flex: 1, p: { xs: 2, sm: 3 }, minWidth: 280 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Summary
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Total Offered Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {fmt(totalOffered)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Payment Type
              </Typography>
              <ToggleButtonGroup
                value={paymentType}
                exclusive
                onChange={(_, val) => { if (val) setPaymentType(val); }}
                fullWidth
                size="small"
              >
                <ToggleButton value="Cash">Cash</ToggleButton>
                <ToggleButton value="Store Credit">Store Credit</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Customer (optional)
              </Typography>
              <Autocomplete
                options={customers}
                loading={customersLoading}
                getOptionLabel={(c) => customerDisplayName(c)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selectedCustomer}
                onChange={(_, val) => setSelectedCustomer(val)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search customer..." size="small" />
                )}
              />
            </Box>

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                disabled={items.length === 0 || submitting}
                onClick={handleCompleteTrade}
              >
                {submitting ? 'Processing…' : 'Complete Trade-in'}
              </Button>

              {activeDraftId && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={submitting}
                  onClick={handleReject}
                >
                  Reject
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>
      </Container>

      <AiScanDialog
        open={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onItemsParsed={handleItemsParsed}
        onError={(msg) => showSnackbar(msg, 'error')}
      />

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

export default TradeInPage;
