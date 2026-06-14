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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Add, SwapHoriz, Delete, QrCodeScanner, SmartToy, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomers } from '../services/customersApi';
import { getTradeIns, createTradeIn, completeTradeIn, rejectTradeIn } from '../services/tradeInApi';
import { getLoyaltySettings } from '../services/loyaltyApi';
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
  const [paymentType, setPaymentType] = useState('cash');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [activeDraftId, setActiveDraftId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState(null);

  const [loyaltySettings, setLoyaltySettings] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);

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

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    let cancelled = false;
    getLoyaltySettings(headers)
      .then((res) => {
        if (!cancelled) setLoyaltySettings(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoyaltySettings(null);
      });
    return () => {
      cancelled = true;
    };
  }, [getAuthHeaders]);

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
      const completed = await completeTradeIn(draftId, paymentType, headers);

      const totalAcceptedValue =
        completed.data?.totalAcceptedValue ??
        completed.data?.totalAccepted ??
        totalOffered;
      const pointsRate = Number(loyaltySettings?.tradeInPointsPerDollar) || 0;
      const pointsEarned =
        selectedCustomer && pointsRate > 0
          ? Math.floor(Number(totalAcceptedValue) * pointsRate)
          : 0;

      setCompletionResult({
        tradeInId: draftId,
        paymentType,
        totalAcceptedValue: Number(totalAcceptedValue) || 0,
        customer: selectedCustomer,
        pointsEarned,
      });

      setTradeIns((prev) => {
        const exists = prev.some((r) => r.id === draftId);
        if (exists) {
          return prev.map((r) =>
            r.id === draftId
              ? {
                  ...r,
                  status: 'completed',
                  paymentType,
                  totalAcceptedValue,
                }
              : r
          );
        }
        const newRow = {
          id: draftId,
          createdAt: new Date().toISOString(),
          customer: selectedCustomer || null,
          customerId: selectedCustomer?.id ?? null,
          items: body.items,
          totalAcceptedValue,
          paymentType,
          status: 'completed',
        };
        return [newRow, ...prev];
      });

      showSnackbar('Trade-in completed successfully');
      setItems([]);
      setPaymentType('cash');
      setActiveDraftId(null);
      setActiveStatus('completed');
    } catch (err) {
      showSnackbar(err.message || 'Failed to complete trade-in', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartNewTradeIn = () => {
    setCompletionResult(null);
    setSelectedCustomer(null);
    setActiveStatus(null);
  };

  const handleViewCustomer = () => {
    const customerId = completionResult?.customer?.id;
    if (!customerId) return;
    navigate('/dashboard/customers', { state: { openCustomerId: customerId } });
  };

  const handleRejectConfirm = async () => {
    if (!activeDraftId) return;
    const headers = getAuthHeaders();
    setSubmitting(true);
    try {
      await rejectTradeIn(activeDraftId, headers);
      showSnackbar('Trade-in rejected');
      setActiveDraftId(null);
      setActiveStatus(null);
      setRejectDialogOpen(false);
      await loadTradeIns(activeTab);
    } catch (err) {
      showSnackbar(err.message || 'Failed to reject trade-in', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTradeIn = useCallback((row) => {
    setCompletionResult(null);
    const rowItems = Array.isArray(row.items) ? row.items : [];
    setItems(
      rowItems.map((it) => ({
        id: it.id ?? `view-${nextRowId++}`,
        gameTitle: it.gameTitle || it.title || '',
        platform: it.platform || '',
        condition: CONDITIONS.includes(it.condition) ? it.condition : 'good',
        offeredValue: it.offeredValue ?? '',
        aiGenerated: !!it.aiGenerated,
      }))
    );
    setActiveDraftId(row.id ?? null);
    setActiveStatus((row.status || '').toLowerCase() || null);
    if (row.customer) {
      setSelectedCustomer(row.customer);
    } else {
      setSelectedCustomer(null);
    }
    if (row.paymentType) setPaymentType(row.paymentType);
  }, []);

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
      field: 'totalAccepted',
      headerName: 'Total Accepted Value',
      width: 170,
      valueGetter: (params) => {
        const row = params.row;
        const v = row.totalAccepted ?? row.totalAcceptedValue ?? row.totalOffered;
        return v != null ? fmt(v) : '—';
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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => handleViewTradeIn(params.row)}
        >
          View
        </Button>
      ),
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
            icon={<SmartToy sx={{ fontSize: '0.875rem !important' }} />}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Summary
              </Typography>
              {activeStatus && (
                <Chip
                  size="small"
                  label={(statusChipProps[activeStatus] || { label: activeStatus }).label}
                  color={(statusChipProps[activeStatus] || { color: 'default' }).color}
                />
              )}
            </Box>

            {completionResult ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Trade-in completed
                  </Typography>
                  {completionResult.paymentType === 'store_credit' ? (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Store credit awarded:{' '}
                        <strong>{fmt(completionResult.totalAcceptedValue)}</strong>
                      </Typography>
                      {completionResult.customer ? (
                        <Typography variant="body2">
                          Loyalty points earned:{' '}
                          <strong>{completionResult.pointsEarned}</strong>
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No customer linked — points not awarded.
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2">
                      Cash to hand to customer:{' '}
                      <strong>{fmt(completionResult.totalAcceptedValue)}</strong>
                    </Typography>
                  )}
                </Alert>

                <Stack spacing={1.5}>
                  {completionResult.customer && (
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handleViewCustomer}
                    >
                      View Customer
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleStartNewTradeIn}
                  >
                    Start New Trade-in
                  </Button>
                </Stack>
              </>
            ) : (
              <>
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
                    <ToggleButton value="cash">Cash</ToggleButton>
                    <ToggleButton value="store_credit">Store Credit</ToggleButton>
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
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {submitting ? 'Processing…' : 'Complete Trade-in'}
                  </Button>

                  {activeDraftId && (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      disabled={submitting}
                      onClick={() => setRejectDialogOpen(true)}
                    >
                      Reject
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </Paper>
        </Box>
      </Container>

      <AiScanDialog
        open={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onItemsParsed={handleItemsParsed}
        onError={(msg) => showSnackbar(msg, 'error')}
      />

      <Dialog
        open={rejectDialogOpen}
        onClose={() => (!submitting ? setRejectDialogOpen(false) : null)}
      >
        <DialogTitle>Reject Trade-in?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this trade-in? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRejectConfirm}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? null : 4000}
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
