import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Stack,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  CreditCard,
  Add,
  ArrowBack,
  Delete,
  Star,
  StarBorder,
  Receipt,
  OpenInNew,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrialStatus } from '../contexts/TrialStatusContext';
import {
  getPaymentMethods,
  storePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getSubscription,
  getInvoices,
} from '../services/billingApi';
import { getBillingErrorMessage } from '../utils/billingErrorUtils';
import PaymentMethodForm from './PaymentMethodForm';

export function getSubscriptionChipProps(status) {
  if (!status) return { label: 'Unknown', color: 'default' };
  const s = status.toLowerCase();
  if (s === 'active') return { label: 'Active', color: 'success' };
  if (s === 'trial' || s === 'trialing') return { label: 'Trial', color: 'warning' };
  if (s === 'cancelled' || s === 'canceled') return { label: 'Cancelled', color: 'error' };
  if (s === 'past_due') return { label: 'Past Due', color: 'error' };
  if (s === 'paused') return { label: 'Paused', color: 'default' };
  return { label: status, color: 'default' };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount, currency = 'usd') {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `$${(amount / 100).toFixed(2)}`;
  }
}

function SubscriptionSkeleton() {
  return (
    <Stack spacing={1.5}>
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="55%" />
    </Stack>
  );
}

function PaymentMethodsSkeleton() {
  return (
    <Stack spacing={2}>
      {[1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" height={72} />
      ))}
    </Stack>
  );
}

function InvoicesSkeleton() {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rounded" height={40} />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={52} />
      ))}
    </Stack>
  );
}

export default function BillingSettingsPage() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { refreshTrialStatus } = useTrialStatus();

  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pmLoading, setPmLoading] = useState(true);
  const [pmError, setPmError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicesHasMore, setInvoicesHasMore] = useState(false);
  const [invoicesLoadingMore, setInvoicesLoadingMore] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const showError = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const showSuccess = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  const loadSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      const result = await getSubscription(getAuthHeaders());
      setSubscription(result.data || null);
    } catch (err) {
      const { message } = getBillingErrorMessage(err);
      setSubscriptionError(message);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [getAuthHeaders]);

  const loadPaymentMethods = useCallback(async () => {
    try {
      setPmLoading(true);
      setPmError(null);
      const result = await getPaymentMethods(getAuthHeaders());
      setPaymentMethods(result.data || []);
    } catch (err) {
      const { message } = getBillingErrorMessage(err);
      setPmError(message);
      setPaymentMethods([]);
    } finally {
      setPmLoading(false);
    }
  }, [getAuthHeaders]);

  const loadInvoices = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setInvoicesLoadingMore(true);
      } else {
        setInvoicesLoading(true);
        setInvoicesError(null);
      }
      const result = await getInvoices(getAuthHeaders(), page, 10);
      const newInvoices = result.data || [];
      if (append) {
        setInvoices((prev) => [...prev, ...newInvoices]);
      } else {
        setInvoices(newInvoices);
      }
      const pagination = result.pagination || {};
      const totalPages = pagination.totalPages || 1;
      setInvoicesHasMore(page < totalPages);
      setInvoicePage(page);
    } catch (err) {
      const { message } = getBillingErrorMessage(err);
      if (append) {
        showError(message);
      } else {
        setInvoicesError(message);
      }
    } finally {
      setInvoicesLoading(false);
      setInvoicesLoadingMore(false);
    }
  }, [getAuthHeaders, showError]);

  useEffect(() => {
    loadSubscription();
    loadPaymentMethods();
    loadInvoices(1, false);
  }, [loadSubscription, loadPaymentMethods, loadInvoices]);

  const handleAddSuccess = async ({ paymentMethodId }) => {
    try {
      setSubmitting(true);
      await storePaymentMethod(paymentMethodId, getAuthHeaders());
      setShowAddForm(false);
      await loadPaymentMethods();
      await refreshTrialStatus();
      showSuccess('Payment method added successfully.');
    } catch (err) {
      const { message } = getBillingErrorMessage(err);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (pm) => {
    if (pm.isDefault) return;
    try {
      setActionInProgress(pm.id);
      await setDefaultPaymentMethod(pm.id, getAuthHeaders());
      await loadPaymentMethods();
    } catch (err) {
      const { message } = getBillingErrorMessage(err);
      showError(message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const pmToDelete = deleteConfirm;
    try {
      setActionInProgress(pmToDelete.id);
      await deletePaymentMethod(pmToDelete.id, getAuthHeaders());
      setDeleteConfirm(null);
      await loadPaymentMethods();
      showSuccess('Payment method removed.');
    } catch (err) {
      const { message } = getBillingErrorMessage(err);
      showError(message);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatExpiration = (month, year) => {
    const m = String(month).padStart(2, '0');
    const y = String(year).slice(-2);
    return `${m}/${y}`;
  };

  const chipProps = getSubscriptionChipProps(subscription?.status);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Billing Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Billing Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your subscription, payment methods, and invoice history.
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subscription Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {subscriptionLoading ? (
            <SubscriptionSkeleton />
          ) : subscriptionError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadSubscription}>
                  Retry
                </Button>
              }
            >
              {subscriptionError}
            </Alert>
          ) : !subscription ? (
            <Typography color="text.secondary">No subscription information available.</Typography>
          ) : (
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <Typography variant="body1">
                  <strong>Plan:</strong> {subscription.plan || subscription.tier || '—'}
                </Typography>
                <Chip
                  label={chipProps.label}
                  color={chipProps.color}
                  size="small"
                  data-testid="subscription-status-chip"
                />
              </Stack>
              {subscription.currentPeriodStart && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Period start:</strong> {formatDate(subscription.currentPeriodStart)}
                </Typography>
              )}
              {subscription.currentPeriodEnd && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Period end:</strong> {formatDate(subscription.currentPeriodEnd)}
                </Typography>
              )}
              {subscription.nextInvoiceAmount != null && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Next invoice:</strong>{' '}
                  {formatCurrency(subscription.nextInvoiceAmount, subscription.currency)}
                </Typography>
              )}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard /> Payment Methods
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {pmLoading ? (
            <PaymentMethodsSkeleton />
          ) : pmError ? (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={loadPaymentMethods}>
                  Retry
                </Button>
              }
            >
              {pmError}
            </Alert>
          ) : (
            <>
              {paymentMethods.length === 0 && !showAddForm ? (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  No payment methods on file. Add a card to ensure your subscription continues.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {paymentMethods.map((pm) => (
                    <Card key={pm.id} variant="outlined">
                      <CardContent>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Stack direction="row" alignItems="center" gap={1} flex={1}>
                            <Typography variant="body1">
                              {pm.brand ? `${pm.brand.toUpperCase()} ` : ''}•••• •••• •••• {pm.last4}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires {formatExpiration(pm.expirationMonth, pm.expirationYear)}
                            </Typography>
                            {pm.isDefault && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                          </Stack>
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            <Button
                              size="small"
                              variant={pm.isDefault ? 'contained' : 'outlined'}
                              startIcon={pm.isDefault ? <Star /> : <StarBorder />}
                              onClick={() => handleSetDefault(pm)}
                              disabled={pm.isDefault || actionInProgress === pm.id}
                            >
                              {pm.isDefault ? 'Default' : 'Set default'}
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm(pm)}
                              disabled={
                                paymentMethods.length <= 1 || actionInProgress === pm.id
                              }
                              aria-label={`Remove card ending in ${pm.last4}`}
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}

              {showAddForm ? (
                <Box sx={{ mt: 2 }}>
                  <PaymentMethodForm
                    onSuccess={handleAddSuccess}
                    onCancel={() => setShowAddForm(false)}
                    disabled={submitting}
                  />
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setShowAddForm(true)}
                >
                  Add payment method
                </Button>
              )}
            </>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt /> Invoice History
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {invoicesLoading ? (
            <InvoicesSkeleton />
          ) : invoicesError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => loadInvoices(1, false)}>
                  Retry
                </Button>
              }
            >
              {invoicesError}
            </Alert>
          ) : invoices.length === 0 ? (
            <Typography color="text.secondary">No invoices found.</Typography>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>PDF</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id || inv.invoiceId}>
                        <TableCell>{formatDate(inv.date || inv.createdAt || inv.periodStart)}</TableCell>
                        <TableCell>{formatCurrency(inv.amount || inv.amountDue, inv.currency)}</TableCell>
                        <TableCell>
                          <Chip
                            label={inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : '—'}
                            size="small"
                            color={
                              inv.status === 'paid'
                                ? 'success'
                                : inv.status === 'open'
                                ? 'warning'
                                : inv.status === 'void' || inv.status === 'uncollectible'
                                ? 'error'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {inv.pdfUrl || inv.invoicePdf ? (
                            <Button
                              size="small"
                              variant="text"
                              endIcon={<OpenInNew fontSize="small" />}
                              href={inv.pdfUrl || inv.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {invoicesHasMore && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => loadInvoices(invoicePage + 1, true)}
                    disabled={invoicesLoadingMore}
                    startIcon={invoicesLoadingMore ? <CircularProgress size={16} /> : null}
                  >
                    {invoicesLoadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        aria-labelledby="delete-pm-dialog-title"
      >
        <DialogTitle id="delete-pm-dialog-title">Remove payment method?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteConfirm
              ? `Are you sure you want to remove the card ending in ${deleteConfirm.last4}? This cannot be undone.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={!!actionInProgress}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
