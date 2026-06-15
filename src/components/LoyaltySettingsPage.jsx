import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  AppBar,
  Toolbar,
  Stack,
  Snackbar,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getLoyaltySettings, updateLoyaltySettings } from '../services/loyaltyApi';

export default function LoyaltySettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, getAuthHeaders } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const [form, setForm] = useState({
    enabled: false,
    purchasePointsPerDollar: '',
    tradeInPointsPerDollar: '',
    redemptionRate: '',
  });

  const [errors, setErrors] = useState({
    purchasePointsPerDollar: '',
    tradeInPointsPerDollar: '',
    redemptionRate: '',
  });

  const showSnackbar = (severity, message) => {
    setSnackbar({ open: true, severity, message });
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await getLoyaltySettings(getAuthHeaders());
      const d = result.data || {};
      setForm({
        enabled: d.isEnabled ?? false,
        purchasePointsPerDollar: d.pointsPerDollarSpent != null ? String(d.pointsPerDollarSpent) : '',
        tradeInPointsPerDollar: d.pointsPerDollarTradeIn != null ? String(d.pointsPerDollarTradeIn) : '',
        redemptionRate: d.redemptionRate != null ? String(d.redemptionRate) : '',
      });
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to load loyalty settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && getAuthHeaders().Authorization) {
      loadSettings();
    }
  }, [isAuthenticated, getAuthHeaders]);

  const validateField = (field, value) => {
    const num = parseFloat(value);
    if (value === '' || isNaN(num) || num < 0) {
      return 'Must be a number greater than or equal to 0';
    }
    if (field === 'redemptionRate' && !Number.isInteger(num)) {
      return 'Must be a whole number';
    }
    return '';
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field !== 'enabled') {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const isFormValid = () => {
    if (!form.enabled) return true;
    return (
      !validateField('purchasePointsPerDollar', form.purchasePointsPerDollar) &&
      !validateField('tradeInPointsPerDollar', form.tradeInPointsPerDollar) &&
      !validateField('redemptionRate', form.redemptionRate)
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    try {
      setSaving(true);
      await updateLoyaltySettings(
        {
          isEnabled: form.enabled,
          pointsPerDollarSpent: parseFloat(parseFloat(form.purchasePointsPerDollar).toFixed(2)),
          pointsPerDollarTradeIn: parseFloat(parseFloat(form.tradeInPointsPerDollar).toFixed(2)),
          redemptionRate: parseInt(form.redemptionRate, 10),
        },
        getAuthHeaders()
      );
      showSnackbar('success', 'Loyalty settings saved successfully.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to save loyalty settings.');
    } finally {
      setSaving(false);
    }
  };

  const purchasePoints = parseFloat(form.purchasePointsPerDollar);
  const redemptionRate = parseFloat(form.redemptionRate);
  const examplePurchaseEarn = !isNaN(purchasePoints) && purchasePoints >= 0
    ? (purchasePoints * 50).toFixed(2).replace(/\.00$/, '')
    : null;
  const exampleRedemptionCredit = !isNaN(redemptionRate) && redemptionRate > 0
    ? (100 / redemptionRate).toFixed(2)
    : null;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Loyalty Program Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loyalty Program
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Configure how customers earn and redeem loyalty points.
        </Typography>

        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={80} />
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Program Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.enabled}
                      onChange={(e) => handleChange('enabled', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Enable loyalty program"
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Earn Rates
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Points per $1 spent (purchases)"
                    type="number"
                    value={form.purchasePointsPerDollar}
                    onChange={(e) => handleChange('purchasePointsPerDollar', e.target.value)}
                    disabled={saving || !form.enabled}
                    inputProps={{ min: 0, step: 0.01 }}
                    error={form.enabled && !!errors.purchasePointsPerDollar}
                    helperText={
                      form.enabled && errors.purchasePointsPerDollar
                        ? errors.purchasePointsPerDollar
                        : 'Points earned per dollar spent on purchases'
                    }
                  />
                  <TextField
                    fullWidth
                    label="Points per $1 (trade-ins)"
                    type="number"
                    value={form.tradeInPointsPerDollar}
                    onChange={(e) => handleChange('tradeInPointsPerDollar', e.target.value)}
                    disabled={saving || !form.enabled}
                    inputProps={{ min: 0, step: 0.01 }}
                    error={form.enabled && !!errors.tradeInPointsPerDollar}
                    helperText={
                      form.enabled && errors.tradeInPointsPerDollar
                        ? errors.tradeInPointsPerDollar
                        : 'Points earned per dollar of trade-in value'
                    }
                  />
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Redemption Rate
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  fullWidth
                  label="Points needed per $1 store credit"
                  type="number"
                  value={form.redemptionRate}
                  onChange={(e) => handleChange('redemptionRate', e.target.value)}
                  disabled={saving || !form.enabled}
                  inputProps={{ min: 0, step: 1 }}
                  error={form.enabled && !!errors.redemptionRate}
                  helperText={
                    form.enabled && errors.redemptionRate
                      ? errors.redemptionRate
                      : 'Number of points required to redeem $1.00 of store credit (whole number)'
                  }
                />
              </Box>

              {form.enabled && (examplePurchaseEarn !== null || exampleRedemptionCredit !== null) && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Live Example
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      {examplePurchaseEarn !== null && (
                        <Typography variant="body2" color="text.secondary">
                          A <strong>$50.00 purchase</strong> earns{' '}
                          <strong>{examplePurchaseEarn} pts</strong>.
                        </Typography>
                      )}
                      {exampleRedemptionCredit !== null && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>100 pts</strong> ={' '}
                          <strong>${exampleRedemptionCredit} store credit</strong>.
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || (form.enabled && !isFormValid())}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {saving ? 'Saving…' : 'Save Settings'}
                </Button>
              </Box>
            </Stack>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
