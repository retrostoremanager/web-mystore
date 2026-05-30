import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  History,
  ArrowBack,
  FileDownload,
  Receipt,
  Email,
  Print,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../contexts/FormattingContext';
import { getAllSales, getSalesByDateRange, getSaleReceipt, emailSaleReceipt } from '../services/salesApi';
import ReceiptView from './ReceiptView';

function saleCustomerLabel(sale) {
  const c = sale.customer;
  if (!c) return '—';
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
  return name || c.email || '—';
}

function formatUsd(locale, amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(n);
}

export function buildCsvContent(rows, locale) {
  const headers = ['Date', 'Customer', 'Items', 'Total', 'Employee', 'Payment Method'];
  const lines = [headers.join(',')];
  for (const row of rows) {
    const cells = [
      `"${row.dateLabel ?? ''}"`,
      `"${row.customerLabel ?? ''}"`,
      row.itemCount ?? 0,
      `"${formatUsd(locale, row.total)}"`,
      `"${row.employeeLabel ?? ''}"`,
      `"${row.paymentMethod ?? ''}"`,
    ];
    lines.push(cells.join(','));
  }
  return lines.join('\n');
}

export function filterSalesByDateRange(sales, startDate, endDate) {
  if (!startDate && !endDate) return sales;
  return sales.filter((sale) => {
    if (!sale.saleDate) return false;
    const d = dayjs(sale.saleDate);
    if (startDate && d.isBefore(dayjs(startDate).startOf('day'))) return false;
    if (endDate && d.isAfter(dayjs(endDate).endOf('day'))) return false;
    return true;
  });
}

function employeeLabel(sale) {
  const u = sale.user || sale.employee;
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return name || u.email || '—';
}

function toGridRows(sales, formatDateTime, locale) {
  return sales.map((sale) => ({
    id: sale.id,
    dateLabel: sale.saleDate ? formatDateTime(sale.saleDate) : '—',
    customerLabel: saleCustomerLabel(sale),
    itemCount: sale.items?.length ?? 0,
    total: sale.total,
    totalFormatted: formatUsd(locale, sale.total),
    employeeLabel: employeeLabel(sale),
    paymentMethod: sale.paymentMethod || '—',
    _raw: sale,
  }));
}

const SalesHistoryPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { locale, formatDateTime } = useFormatting();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSnackbar, setEmailSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadSales = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await getAllSales(headers);
      if (!result.success) {
        throw new Error(result.message || 'Failed to retrieve sales');
      }
      setSales(Array.isArray(result.data) ? result.data : []);
    } catch (e) {
      setError(e.message || 'Failed to load sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const filteredSales = useMemo(
    () => filterSalesByDateRange(sales, startDate, endDate),
    [sales, startDate, endDate]
  );

  const rows = useMemo(
    () => toGridRows(filteredSales, formatDateTime, locale),
    [filteredSales, formatDateTime, locale]
  );

  const openReceiptDialog = useCallback(async (sale) => {
    setSelectedSale(sale);
    setReceiptData(null);
    setReceiptError(null);
    setReceiptLoading(true);
    const headers = getAuthHeaders();
    try {
      const result = await getSaleReceipt(sale.id, headers);
      setReceiptData(result.data ?? result ?? null);
    } catch (e) {
      setReceiptError(e.message || 'Failed to load receipt');
    } finally {
      setReceiptLoading(false);
    }
  }, [getAuthHeaders]);

  const handleEmailSubmit = async () => {
    if (!selectedSale?.id || !emailInput.trim()) return;
    setEmailSending(true);
    try {
      await emailSaleReceipt(selectedSale.id, emailInput.trim(), getAuthHeaders());
      setEmailDialogOpen(false);
      setEmailSnackbar({ open: true, message: 'Receipt sent successfully!', severity: 'success' });
    } catch (err) {
      setEmailSnackbar({ open: true, message: err.message || 'Failed to send receipt', severity: 'error' });
    } finally {
      setEmailSending(false);
    }
  };

  const columns = [
    { field: 'dateLabel', headerName: 'Date', flex: 1.5, minWidth: 160 },
    { field: 'customerLabel', headerName: 'Customer', flex: 1.5, minWidth: 140 },
    { field: 'itemCount', headerName: 'Items', flex: 0.6, minWidth: 70, type: 'number' },
    {
      field: 'totalFormatted',
      headerName: 'Total',
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
    },
    { field: 'employeeLabel', headerName: 'Employee', flex: 1.5, minWidth: 140 },
    {
      field: 'paymentMethod',
      headerName: 'Payment',
      flex: 1,
      minWidth: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<Receipt />}
          onClick={(e) => {
            e.stopPropagation();
            openReceiptDialog(params.row._raw);
          }}
        >
          View Receipt
        </Button>
      ),
    },
  ];

  const handleRowClick = (params) => {
    openReceiptDialog(params.row._raw);
  };

  const handleExportCsv = () => {
    const csv = buildCsvContent(rows, locale);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyDateFilter = async () => {
    if (startDate && endDate) {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      setError(null);
      setLoading(true);
      try {
        const result = await getSalesByDateRange(
          dayjs(startDate).format('YYYY-MM-DD'),
          dayjs(endDate).format('YYYY-MM-DD'),
          headers
        );
        if (!result.success) throw new Error(result.message || 'Failed to retrieve sales');
        setSales(Array.isArray(result.data) ? result.data : []);
      } catch (e) {
        setError(e.message || 'Failed to load sales');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    loadSales();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <History sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Sales History
            </Typography>
            <Button
              color="inherit"
              startIcon={<FileDownload />}
              onClick={handleExportCsv}
              disabled={rows.length === 0}
            >
              Export CSV
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button variant="contained" onClick={handleApplyDateFilter} disabled={!startDate || !endDate}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleClearFilter}>
              Clear
            </Button>
          </Box>

          {loading ? (
            <Box>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ height: 600, overflowX: 'auto' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                onRowClick={handleRowClick}
                sx={{ cursor: 'pointer' }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">
                        No sales match the current filter. Try adjusting the date range.
                      </Typography>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </Container>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Dialog
          open={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          maxWidth="sm"
          fullWidth
        >
          {selectedSale && (
            <>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt />
                Receipt — Sale #{selectedSale.id}
              </DialogTitle>
              <DialogContent>
                <ReceiptView
                  receipt={receiptData}
                  loading={receiptLoading}
                  error={receiptError}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  startIcon={<Print />}
                  onClick={() => window.print()}
                  disabled={receiptLoading || !receiptData}
                >
                  Print Receipt
                </Button>
                <Button
                  startIcon={<Email />}
                  onClick={() => {
                    const customerEmail = selectedSale.customer?.email || '';
                    setEmailInput(customerEmail);
                    setEmailDialogOpen(true);
                  }}
                  disabled={receiptLoading}
                >
                  Email Receipt
                </Button>
                <Button onClick={() => setSelectedSale(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog open={emailDialogOpen} onClose={() => !emailSending && setEmailDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Email Receipt</DialogTitle>
          <DialogContent>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={emailSending}
              sx={{ mt: 1 }}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailDialogOpen(false)} disabled={emailSending}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleEmailSubmit}
              disabled={emailSending || !emailInput.trim()}
              startIcon={emailSending ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {emailSending ? 'Sending...' : 'Send'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={emailSnackbar.open}
          autoHideDuration={5000}
          onClose={() => setEmailSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={emailSnackbar.severity} onClose={() => setEmailSnackbar((s) => ({ ...s, open: false }))}>
            {emailSnackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default SalesHistoryPage;
