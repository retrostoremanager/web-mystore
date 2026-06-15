import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { ArrowBack, CreditCard, WorkspacePremium, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrialStatus } from '../contexts/TrialStatusContext';
import { useFormatting } from '../contexts/FormattingContext';
import { getTrialStatus, changeSubscriptionTier } from '../services/billingApi';
import { getCompanyProfile } from '../services/profileApi';

const TIER_LABELS = {
  Trial: 'Free Trial',
  Basic: 'Basic',
  Premium: 'Premium',
  Enterprise: 'Enterprise',
};

const TIER_LOCATION_LIMITS = {
  Trial: 1,
  Basic: 1,
  Premium: 3,
  Enterprise: null, // unlimited
};

const TIER_ORDER = { Basic: 1, Premium: 2, Enterprise: 3 };

const AVAILABLE_TIERS = [
  { id: 'Basic', label: 'Basic', locations: 1, description: '1 location' },
  { id: 'Premium', label: 'Premium', locations: 3, description: 'Up to 3 locations' },
  { id: 'Enterprise', label: 'Enterprise', locations: null, description: 'Unlimited locations' },
];

/**
 * SubscriptionPage - View subscription status, tier, billing cycle, and usage limits.
 * EPIC-0-009-001: Subscription Status Display UI
 */
export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { trialStatus: contextTrialStatus, refreshTrialStatus } = useTrialStatus();
  const { formatDate } = useFormatting();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [locationCount, setLocationCount] = useState(0);
  const [changingTier, setChangingTier] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!getAuthHeaders().Authorization) return;
      try {
        setLoading(true);
        setError(null);
        const [trialResult, profileResult] = await Promise.all([
          getTrialStatus(getAuthHeaders()),
          getCompanyProfile(getAuthHeaders()).catch(() => ({ data: null })),
        ]);
        setSubscriptionData(trialResult.data || null);
        const locs = profileResult?.data?.locations || [];
        setLocationCount(locs.length);
        await refreshTrialStatus();
      } catch (err) {
        setError(err.message || 'Failed to load subscription status');
        setSubscriptionData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getAuthHeaders, refreshTrialStatus]);

  const data = subscriptionData || contextTrialStatus;
  const tier = data?.subscriptionTier || 'Trial';
  // Derive trial status: API uses TrialEndDate > now (backend fix). Fallback: compute from trialEndDate if API missed it
  const trialEnd = data?.trialEndDate ? new Date(data.trialEndDate) : null;
  const isInTrial =
    data?.isInTrial ??
    (trialEnd && trialEnd > new Date());
  const daysRemaining =
    data?.daysRemaining ?? (isInTrial && trialEnd ? Math.max(0, Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24))) : 0);
  const locationLimit = TIER_LOCATION_LIMITS[tier] ?? 1;
  const locationUsage =
    locationLimit === null
      ? `${locationCount} (unlimited)`
      : `${locationCount} / ${locationLimit}`;

  const effectiveTierForOrder = tier === 'Trial' ? 'Basic' : tier;
  const currentTierOrder = TIER_ORDER[effectiveTierForOrder] ?? 0;

  const canDowngradeTo = (targetTier) => {
    const limit = TIER_LOCATION_LIMITS[targetTier];
    if (limit === null) return true;
    return locationCount <= limit;
  };

  const handleChangeTier = async (targetTier) => {
    if (targetTier === tier) return;
    try {
      setChangingTier(targetTier);
      setError(null);
      const result = await changeSubscriptionTier(targetTier, locationCount, getAuthHeaders());
      setSuccessMessage(result?.data?.message || 'Plan updated successfully.');
      const [trialResult, profileResult] = await Promise.all([
        getTrialStatus(getAuthHeaders()),
        getCompanyProfile(getAuthHeaders()).catch(() => ({ data: null })),
      ]);
      setSubscriptionData(trialResult.data || null);
      const locs = profileResult?.data?.locations || [];
      setLocationCount(locs.length);
      await refreshTrialStatus();
    } catch (err) {
      setError(err.message || 'Failed to change tier');
    } finally {
      setChangingTier(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Subscription
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Current Tier Card */}
            <Card elevation={2}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <WorkspacePremium color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Current Plan
                    </Typography>
                    <Chip
                      label={isInTrial ? `${TIER_LABELS[tier] || tier} (Trial)` : (TIER_LABELS[tier] || tier)}
                      color={isInTrial ? 'info' : 'primary'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Stack>

                <Grid container spacing={2}>
                  {isInTrial && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Trial Ends
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {data?.trialEndDate ? formatDate(data.trialEndDate) : '—'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Days Remaining
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {daysRemaining}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {!isInTrial && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Billing Cycle
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Monthly
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Next Billing Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          —
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Change Plan - EPIC-0-009-002 */}
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Change Plan
                </Typography>
                <Grid container spacing={2}>
                  {AVAILABLE_TIERS.map((t) => {
                    const effectiveTier = tier === 'Trial' ? 'Basic' : tier;
                    const isCurrent = effectiveTier === t.id;
                    const targetOrder = TIER_ORDER[t.id] ?? 0;
                    const isUpgrade = targetOrder > currentTierOrder;
                    const isDowngrade = targetOrder < currentTierOrder;
                    const downgradeBlocked = isDowngrade && !canDowngradeTo(t.id);
                    const actionLabel = isCurrent
                      ? 'Current'
                      : isUpgrade
                        ? 'Upgrade'
                        : isDowngrade
                          ? 'Downgrade'
                          : 'Select';
                    return (
                      <Grid item xs={12} sm={4} key={t.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            height: '100%',
                            borderColor: isCurrent ? 'primary.main' : 'divider',
                            borderWidth: isCurrent ? 2 : 1,
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {t.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {t.description}
                          </Typography>
                          <Button
                            variant={isCurrent ? 'outlined' : 'contained'}
                            size="small"
                            fullWidth
                            disabled={isCurrent || changingTier !== null || downgradeBlocked}
                            onClick={() => handleChangeTier(t.id)}
                            sx={{ mt: 2 }}
                          >
                            {changingTier === t.id ? (
                              <CircularProgress size={20} />
                            ) : downgradeBlocked ? (
                              `Remove locations first`
                            ) : (
                              actionLabel
                            )}
                          </Button>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>

            {/* Usage Limits Card */}
            <Card elevation={2}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Schedule color="action" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Usage Limits
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Locations
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {locationUsage}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment Methods Link */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CreditCard color="action" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Payment Methods
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your payment methods for subscription billing
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<CreditCard />}
                  onClick={() => navigate('/dashboard/billing')}
                >
                  Manage Payment
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
