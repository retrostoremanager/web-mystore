import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
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
} from '@mui/material';
import { CreditCard, Add, ArrowBack, Delete, Star, StarBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getPaymentMethods,
  storePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from '../services/billingApi';
import { getBillingErrorMessage } from '../utils/billingErrorUtils';
import PaymentMethodForm from './PaymentMethodForm';

/**
 * BillingSettingsPage - Manage payment methods for subscription billing
 *
 * Displays stored payment methods (last 4 digits, expiration) and allows
 * adding new payment methods via Stripe Elements.
 */
export default function BillingSettingsPage() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [errorRetryable, setErrorRetryable] = useState(false);
  const [pendingRetryAction, setPendingRetryAction] = useState(null);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorRetryable(false);
      setPendingRetryAction(null);
      const result = await getPaymentMethods(getAuthHeaders());
      setPaymentMethods(result.data || []);
    } catch (err) {
      const { message, isRetryable } = getBillingErrorMessage(err);
      setError(message);
      setErrorRetryable(isRetryable);
      setPendingRetryAction(isRetryable ? loadPaymentMethods : null);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleAddSuccess = async ({ paymentMethodId }) => {
    try {
      setSubmitting(true);
      setError(null);
      setErrorRetryable(false);
      setPendingRetryAction(null);
      await storePaymentMethod(paymentMethodId, getAuthHeaders());
      setShowAddForm(false);
      await loadPaymentMethods();
    } catch (err) {
      const { message, isRetryable } = getBillingErrorMessage(err);
      setError(message);
      setErrorRetryable(isRetryable);
      setPendingRetryAction(isRetryable ? () => storePaymentMethod(paymentMethodId, getAuthHeaders()).then(() => loadPaymentMethods()).then(() => setShowAddForm(false)) : null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setError(null);
  };

  const handleSetDefault = async (pm) => {
    if (pm.isDefault) return;
    try {
      setActionInProgress(pm.id);
      setError(null);
      setErrorRetryable(false);
      setPendingRetryAction(null);
      await setDefaultPaymentMethod(pm.id, getAuthHeaders());
      await loadPaymentMethods();
    } catch (err) {
      const { message, isRetryable } = getBillingErrorMessage(err);
      setError(message);
      setErrorRetryable(isRetryable);
      setPendingRetryAction(isRetryable ? () => setDefaultPaymentMethod(pm.id, getAuthHeaders()).then(loadPaymentMethods) : null);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteClick = (pm) => {
    setDeleteConfirm(pm);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const pmToDelete = deleteConfirm;
    try {
      setActionInProgress(pmToDelete.id);
      setError(null);
      setErrorRetryable(false);
      setPendingRetryAction(null);
      await deletePaymentMethod(pmToDelete.id, getAuthHeaders());
      setDeleteConfirm(null);
      await loadPaymentMethods();
    } catch (err) {
      const { message, isRetryable } = getBillingErrorMessage(err);
      setError(message);
      setErrorRetryable(isRetryable);
      setPendingRetryAction(isRetryable ? () => deletePaymentMethod(pmToDelete.id, getAuthHeaders()).then(() => { setDeleteConfirm(null); loadPaymentMethods(); }) : null);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const formatExpiration = (month, year) => {
    const m = String(month).padStart(2, '0');
    const y = String(year).slice(-2);
    return `${m}/${y}`;
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Billing & Payment Methods
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Billing & Payment Methods
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your payment methods for subscription billing. Your card information is securely stored by Stripe.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => { setError(null); setErrorRetryable(false); setPendingRetryAction(null); }}
          action={
            errorRetryable && (
              <Button
                color="inherit"
                size="small"
                onClick={async () => {
                  setError(null);
                  setErrorRetryable(false);
                  const retry = pendingRetryAction || loadPaymentMethods;
                  try {
                    await retry();
                  } catch (e) {
                    const { message, isRetryable } = getBillingErrorMessage(e);
                    setError(message);
                    setErrorRetryable(isRetryable);
                  }
                }}
              >
                Retry
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard /> Payment methods
            </Typography>

            {paymentMethods.length === 0 && !showAddForm ? (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No payment methods on file. Add a card to ensure your subscription continues after trial.
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
                            •••• •••• •••• {pm.last4}
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
                            onClick={() => handleDeleteClick(pm)}
                            disabled={
                              paymentMethods.length <= 1 || actionInProgress === pm.id
                            }
                            aria-label={`Delete card ending in ${pm.last4}`}
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
                  onCancel={handleCancelAdd}
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
          </Paper>

          <Dialog
            open={!!deleteConfirm}
            onClose={handleDeleteCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">
              Remove payment method?
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                {deleteConfirm
                  ? `Are you sure you want to remove the card ending in ${deleteConfirm.last4}? This cannot be undone.`
                  : ''}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
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
        </>
      )}
      </Container>
    </Box>
  );
}
