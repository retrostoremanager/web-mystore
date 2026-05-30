import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  PointOfSale,
  ArrowBack,
  Add,
  Delete,
  CheckCircle,
  Print,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetInventoryQuery, inventoryApi } from '../store/inventoryApi';
import { useAuth } from '../contexts/AuthContext';
import { getCustomers, createCustomer } from '../services/customersApi';
import { createSale, getSaleReceipt, emailSaleReceipt } from '../services/salesApi';
import ReceiptView from './ReceiptView';

const steps = ['Select Customer', 'Add Items', 'Review & Complete'];

function customerRecordToOption(c) {
  const displayName =
    [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email || `Customer #${c.id}`;
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email || '',
    displayName,
    label: `${displayName}${c.email ? ` (${c.email})` : ''}`,
  };
}

function unitPriceFromLineItem(item) {
  const raw = item.sellPrice ?? item.price;
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(/[^0-9.-]/g, ''));
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

const PAYMENT_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit/debit card', label: 'Credit/debit card' },
  { value: 'Other', label: 'Other' },
];

function parseTaxInput(str) {
  const t = (str ?? '').trim();
  if (t === '') {
    return { ok: true, value: 0 };
  }
  const n = parseFloat(t);
  if (Number.isNaN(n) || n < 0) {
    return { ok: false, value: 0 };
  }
  return { ok: true, value: Math.round(n * 100) / 100 };
}


const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getAuthHeaders } = useAuth();
  const { data: inventory = [] } = useGetInventoryQuery(undefined, { pollingInterval: 30000 });
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customersLoadError, setCustomersLoadError] = useState(null);

  const [taxInput, setTaxInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [lastSale, setLastSale] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSnackbar, setEmailSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [checkoutData, setCheckoutData] = useState({
    customer: null,
    customerName: '',
    customerEmail: '',
    items: [],
  });

  const loadCustomers = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setCustomersLoadError(null);
    try {
      const result = await getCustomers(headers);
      const list = Array.isArray(result.data) ? result.data : [];
      setCustomerOptions(list.map(customerRecordToOption));
    } catch (e) {
      setCustomersLoadError(e.message || 'Failed to load customers');
      setCustomerOptions([]);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCustomerSelect = (event, value) => {
    if (value) {
      setCheckoutData({
        ...checkoutData,
        customer: value,
        customerName: value.displayName,
        customerEmail: value.email || '',
      });
    } else {
      setCheckoutData({
        ...checkoutData,
        customer: null,
        customerName: '',
        customerEmail: '',
      });
    }
    setError('');
  };

  const handleAddItem = (item) => {
    const existingItem = checkoutData.items.find((i) => i.id === item.id);
    if (existingItem) {
      setCheckoutData({
        ...checkoutData,
        items: checkoutData.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      setCheckoutData({
        ...checkoutData,
        items: [...checkoutData.items, { ...item, quantity: 1 }],
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    setCheckoutData({
      ...checkoutData,
      items: checkoutData.items.filter((i) => i.id !== itemId),
    });
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCheckoutData({
      ...checkoutData,
      items: checkoutData.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    });
  };

  const calculateSubtotal = () => {
    return checkoutData.items.reduce(
      (total, item) => total + unitPriceFromLineItem(item) * item.quantity,
      0
    );
  };

  const getTaxValue = () => parseTaxInput(taxInput);
  const validateStep1 = () => {
    if (!checkoutData.customerName.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!checkoutData.customerEmail.trim()) {
      setError('Customer email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.customerEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (checkoutData.items.length === 0) {
      setError('Please add at least one item to the cart');
      return false;
    }
    // Check if all items have available quantity
    for (const cartItem of checkoutData.items) {
      const inventoryItem = inventory.find((i) => i.id === cartItem.id);
      if (!inventoryItem || cartItem.quantity > (inventoryItem.quantity || 0)) {
        setError(`Insufficient quantity for ${cartItem.name}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (activeStep === 0 && !validateStep1()) {
      return;
    }
    if (activeStep === 1 && !validateStep2()) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    const taxParsed = getTaxValue();
    if (!taxParsed.ok) {
      setError('Tax must be a valid non-negative number, or leave the field blank.');
      setLoading(false);
      return;
    }

    const auth = getAuthHeaders();
    const email = checkoutData.customerEmail.trim().toLowerCase();

    try {
      let customerId = checkoutData.customer?.id ?? null;
      if (!customerId) {
        const match = customerOptions.find((c) => c.email && c.email.toLowerCase() === email);
        if (match) customerId = match.id;
      }

      if (!customerId) {
        const nameParts = checkoutData.customerName.trim().split(/\s+/);
        const firstName = nameParts[0]?.trim() || 'Customer';
        const lastName = nameParts.slice(1).join(' ').trim() || '';
        try {
          const res = await createCustomer({ firstName, lastName, email }, auth);
          customerId = res.data?.id;
        } catch (createErr) {
          const msg = createErr.message || '';
          if (msg.includes('already exists')) {
            const refreshed = await getCustomers(auth);
            const list = Array.isArray(refreshed.data) ? refreshed.data : [];
            setCustomerOptions(list.map(customerRecordToOption));
            const found = list.find((c) => c.email?.toLowerCase() === email);
            if (found) {
              customerId = found.id;
            }
          }
          if (!customerId) {
            throw createErr;
          }
        }
      }

      if (!customerId) {
        throw new Error('Could not resolve customer for checkout.');
      }

      const items = checkoutData.items.map((item) => ({
        inventoryItemId: item.id,
        quantity: item.quantity,
        unitPrice: unitPriceFromLineItem(item),
      }));

      const result = await createSale(
        {
          customerId,
          tax: taxParsed.value,
          paymentMethod,
          items,
        },
        auth
      );

      dispatch(inventoryApi.util.invalidateTags([{ type: 'Inventory', id: 'LIST' }]));
      const sale = result.data ?? null;
      setLastSale(sale);
      setActiveStep(2);
      if (sale?.id != null) {
        setReceiptLoading(true);
        setReceiptError(null);
        setReceiptData(null);
        try {
          const receiptResult = await getSaleReceipt(sale.id, auth);
          setReceiptData(receiptResult.data ?? receiptResult ?? null);
        } catch (receiptErr) {
          setReceiptError(receiptErr.message || 'Failed to load receipt');
        } finally {
          setReceiptLoading(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to process transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Select Customer
            </Typography>
            {customersLoadError && (
              <Alert severity="warning">
                {customersLoadError} You can still type a new customer below if you have access to create customers.
              </Alert>
            )}
            <Autocomplete
              options={customerOptions}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              value={checkoutData.customer}
              onChange={handleCustomerSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for existing customer"
                  placeholder="Type to search..."
                />
              )}
            />
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Box>
            <TextField
              label="Customer Name"
              fullWidth
              required
              value={checkoutData.customerName}
              onChange={(e) => {
                setCheckoutData({ ...checkoutData, customerName: e.target.value });
                setError('');
              }}
              placeholder="Enter customer name"
              autoFocus
            />
            <TextField
              label="Customer Email"
              fullWidth
              required
              type="email"
              value={checkoutData.customerEmail}
              onChange={(e) => {
                setCheckoutData({ ...checkoutData, customerEmail: e.target.value });
                setError('');
              }}
              placeholder="customer@email.com"
            />
          </Stack>
        );
      
      case 1: {
        const availableItems = inventory.filter((item) => (item.quantity || 0) > 0);
        const taxSnap = getTaxValue();
        const taxAmountDisplay = taxSnap.ok ? taxSnap.value : 0;
        const grandTotal = calculateSubtotal() + taxAmountDisplay;

        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Add Items to Cart
            </Typography>
            {availableItems.length === 0 ? (
              <Alert severity="info">No items available in inventory</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Available</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableItems.map((item) => {
                      const cartItem = checkoutData.items.find((i) => i.id === item.id);
                      const inCart = !!cartItem;
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.price || `$${item.sellPrice || '0.00'}`}</TableCell>
                          <TableCell align="right">{item.quantity || 0}</TableCell>
                          <TableCell align="right">
                            {inCart ? (
                              <Chip
                                label={`${cartItem.quantity} in cart`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              <Button
                                size="small"
                                startIcon={<Add />}
                                onClick={() => handleAddItem(item)}
                                variant="outlined"
                              >
                                Add
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {checkoutData.items.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cart Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Subtotal</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checkoutData.items.map((item) => {
                        const price = unitPriceFromLineItem(item);
                        const subtotal = price * item.quantity;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.price || `$${price.toFixed(2)}`}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.id, parseInt(e.target.value, 10) || 0)
                                }
                                inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                              />
                            </TableCell>
                            <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2 }}>
                  <Stack spacing={2} sx={{ maxWidth: 360, ml: 'auto' }}>
                    <TextField
                      label="Tax (optional)"
                      type="number"
                      size="small"
                      value={taxInput}
                      onChange={(e) => {
                        setTaxInput(e.target.value);
                        setError('');
                      }}
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Sales tax or other tax for this transaction"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel id="checkout-payment-method-label">Payment method</InputLabel>
                      <Select
                        labelId="checkout-payment-method-label"
                        label="Payment method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        {PAYMENT_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal: ${calculateSubtotal().toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tax: ${taxSnap.ok ? taxSnap.value.toFixed(2) : '—'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                        Total: ${taxSnap.ok ? grandTotal.toFixed(2) : '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            )}
          </Stack>
        );
      }

      case 2:
        return (
          <Stack spacing={3} sx={{ py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Sale Complete!
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              The sale was saved and inventory quantities were updated.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <ReceiptView
                receipt={receiptData}
                loading={receiptLoading}
                error={receiptError}
              />
            </Paper>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="no-print">
              <Button
                variant="outlined"
                startIcon={<Print />}
                disabled={receiptLoading || !receiptData}
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
              <Button
                variant="outlined"
                startIcon={<Email />}
                disabled={receiptLoading || !lastSale}
                onClick={() => {
                  setEmailInput(checkoutData.customerEmail || '');
                  setEmailDialogOpen(true);
                }}
              >
                Email Receipt
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCheckoutData({ customer: null, customerName: '', customerEmail: '', items: [] });
                  setTaxInput('');
                  setPaymentMethod('Cash');
                  setLastSale(null);
                  setReceiptData(null);
                  setReceiptError(null);
                  setActiveStep(0);
                }}
              >
                New Transaction
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  const handleEmailSubmit = async () => {
    if (!lastSale?.id || !emailInput.trim()) return;
    setEmailSending(true);
    try {
      await emailSaleReceipt(lastSale.id, emailInput.trim(), getAuthHeaders());
      setEmailDialogOpen(false);
      setEmailSnackbar({ open: true, message: 'Receipt sent successfully!', severity: 'success' });
    } catch (err) {
      setEmailSnackbar({ open: true, message: err.message || 'Failed to send receipt', severity: 'error' });
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1} className="no-print">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <PointOfSale sx={{ mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Checkout
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }} id="receipt-print-root">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400, mb: 4 }}>
            {renderStepContent()}
          </Box>

          {activeStep < 2 && (
            <Stack direction="row" spacing={2} justifyContent="space-between" className="no-print">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === 1 ? handleComplete : handleNext}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? (
                  'Processing...'
                ) : activeStep === 1 ? (
                  'Complete Transaction'
                ) : (
                  'Next'
                )}
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>

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
  );
};

export default CheckoutPage;
