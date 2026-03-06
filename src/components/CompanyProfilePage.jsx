import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  MenuItem,
  Stack,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../contexts/FormattingContext';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadLogo,
  deleteLogo,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationDeletionInfo,
} from '../services/profileApi';
import { getTrialStatus } from '../services/billingApi';

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'UTC',
];

const COMMON_LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
];

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const { refresh: refreshFormatting } = useFormatting();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZipCode: '',
    companyPhone: '',
    locale: 'en-US',
    logoUrl: '',
  });
  const [locations, setLocations] = useState([]);
  const [companyDialog, setCompanyDialog] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZipCode: '',
    companyPhone: '',
    locale: 'en-US',
  });
  const [locationDialog, setLocationDialog] = useState(null);
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    timezone: 'America/New_York',
    isPrimary: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletionInfo, setDeletionInfo] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);
  const [logoRemoveConfirm, setLogoRemoveConfirm] = useState(false);
  const [trialStatus, setTrialStatus] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCompanyProfile(getAuthHeaders());
      const p = result.data?.profile || {};
      const locs = result.data?.locations || [];
      setProfile({
        companyName: p.companyName || '',
        companyAddress: p.companyAddress || '',
        companyCity: p.companyCity || '',
        companyState: p.companyState || '',
        companyZipCode: p.companyZipCode || '',
        companyPhone: p.companyPhone || '',
        locale: p.locale || 'en-US',
        logoUrl: p.logoUrl || '',
      });
      setLocations(locs);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && getAuthHeaders().Authorization) {
      loadProfile();
      getTrialStatus(getAuthHeaders())
        .then((res) => setTrialStatus(res.data || null))
        .catch(() => setTrialStatus(null));
    }
  }, [isAuthenticated, getAuthHeaders]);

  const TIER_LOCATION_LIMITS = { Basic: 1, Trial: 1, Premium: 3, Enterprise: null };
  const tier = (trialStatus?.subscriptionTier || 'Basic').replace(/^trial$/i, 'Basic');
  const locationLimit = TIER_LOCATION_LIMITS[tier] ?? TIER_LOCATION_LIMITS.Basic;
  const canAddLocation = locationLimit == null || locations.length < locationLimit;

  const handleOpenEditCompany = () => {
    setCompanyForm({
      companyName: profile.companyName || '',
      companyAddress: profile.companyAddress || '',
      companyCity: profile.companyCity || '',
      companyState: profile.companyState || '',
      companyZipCode: profile.companyZipCode || '',
      companyPhone: profile.companyPhone || '',
      locale: profile.locale || 'en-US',
    });
    setCompanyDialog(true);
  };

  const handleCompanyFormChange = (field, value) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanySubmit = async () => {
    if (!companyForm.companyName.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateCompanyProfile(companyForm, getAuthHeaders());
      setCompanyDialog(false);
      await loadProfile();
      refreshFormatting();
    } catch (err) {
      setError(err.message || 'Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setError('Invalid format. Use PNG, JPG, or SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await uploadLogo(
        { file: base64, fileName: file.name, contentType: file.type },
        getAuthHeaders()
      );
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setSubmitting(false);
      e.target.value = '';
    }
  };

  const handleLogoRemove = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await deleteLogo(getAuthHeaders());
      setLogoRemoveConfirm(false);
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Failed to remove logo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddLocation = () => {
    setLocationForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      timezone: 'America/New_York',
      isPrimary: locations.length === 0,
    });
    setLocationDialog({ mode: 'add' });
  };

  const handleOpenEditLocation = (loc) => {
    setLocationForm({
      name: loc.name,
      address: loc.address || '',
      city: loc.city || '',
      state: loc.state || '',
      zipCode: loc.zipCode || '',
      phone: loc.phone || '',
      timezone: loc.timezone || 'America/New_York',
      isPrimary: loc.isPrimary || false,
    });
    setLocationDialog({ mode: 'edit', location: loc });
  };

  const handleLocationFormChange = (field, value) => {
    setLocationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSubmit = async () => {
    if (!locationForm.name.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        name: locationForm.name.trim(),
        address: locationForm.address || undefined,
        city: locationForm.city || undefined,
        state: locationForm.state || undefined,
        zipCode: locationForm.zipCode || undefined,
        phone: locationForm.phone || undefined,
        timezone: locationForm.timezone || undefined,
        isPrimary: locationForm.isPrimary,
      };
      if (locationDialog.mode === 'add') {
        await createLocation(payload, getAuthHeaders());
      } else {
        await updateLocation(locationDialog.location.id, payload, getAuthHeaders());
      }
      setLocationDialog(null);
      await loadProfile();
      refreshFormatting();
    } catch (err) {
      setError(err.message || 'Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (loc) => {
    try {
      const info = await getLocationDeletionInfo(loc.id, getAuthHeaders());
      const data = info.data || null;
      setDeletionInfo(data);
      setDeleteConfirm(loc);
      setDeleteAction(
        data?.hasInventory && (!data.otherLocations?.length)
          ? { action: 'delete_inventory' }
          : null
      );
    } catch (err) {
      setError(err.message || 'Failed to load deletion info');
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteConfirm) return;
    if (deletionInfo?.hasInventory && !deleteAction) {
      setError('Please choose how to handle inventory: delete it or move to another location.');
      return;
    }
    if (deleteAction?.action === 'reassign' && (!deletionInfo?.otherLocations?.length || !deleteAction.targetId)) {
      setError('Please select a location to move inventory to.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const options = deletionInfo?.hasInventory
        ? deleteAction?.action === 'reassign'
          ? { action: 'reassign', targetLocationId: deleteAction.targetId }
          : { action: 'delete_inventory' }
        : {};
      await deleteLocation(deleteConfirm.id, options, getAuthHeaders());
      setDeleteConfirm(null);
      setDeletionInfo(null);
      setDeleteAction(null);
      await loadProfile();
      refreshFormatting();
    } catch (err) {
      setError(err.message || 'Failed to delete location');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Company Profile
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Company Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your company information and locations. Company address/phone can differ from location addresses (e.g. mailing address or PO box).
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Company</Typography>
            <IconButton size="small" onClick={handleOpenEditCompany} aria-label="Edit company">
              <Edit />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Company name and contact info. Use for mailing address, PO box, or headquarters if different from store locations.
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {profile.logoUrl && (
                  <Box
                    component="img"
                    src={profile.logoUrl}
                    alt="Company logo"
                    sx={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 1 }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {profile.companyName || '—'}
              </Typography>
              {(profile.companyAddress || profile.companyCity) && (
                <Typography variant="body2" color="text.secondary">
                  {[profile.companyAddress, profile.companyCity, profile.companyState, profile.companyZipCode].filter(Boolean).join(', ')}
                </Typography>
              )}
              {profile.companyPhone && (
                <Typography variant="body2" color="text.secondary">
                  {profile.companyPhone}
                </Typography>
              )}
              {profile.locale && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {COMMON_LOCALES.find((l) => l.value === profile.locale)?.label || profile.locale}
                </Typography>
              )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Paper>

        <Dialog open={companyDialog} onClose={() => setCompanyDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Company Logo (PNG, JPG, SVG, max 5MB)
                </Typography>
                {profile.logoUrl ? (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      component="img"
                      src={profile.logoUrl}
                      alt="Company logo"
                      sx={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" component="label" disabled={submitting}>
                        Change
                        <input type="file" hidden accept="image/png,image/jpeg,image/jpg,image/svg+xml" onChange={handleLogoUpload} />
                      </Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => setLogoRemoveConfirm(true)} disabled={submitting}>
                        Remove
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Button variant="outlined" size="small" component="label" disabled={submitting}>
                    Upload Logo
                    <input type="file" hidden accept="image/png,image/jpeg,image/jpg,image/svg+xml" onChange={handleLogoUpload} />
                  </Button>
                )}
              </Box>
              <TextField
                fullWidth
                label="Company Name"
                value={companyForm.companyName}
                onChange={(e) => handleCompanyFormChange('companyName', e.target.value)}
                required
                helperText="The business name you entered at registration."
              />
              <TextField
                fullWidth
                label="Address"
                value={companyForm.companyAddress}
                onChange={(e) => handleCompanyFormChange('companyAddress', e.target.value)}
                placeholder="Street, PO box, etc."
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={companyForm.companyCity}
                  onChange={(e) => handleCompanyFormChange('companyCity', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="State"
                  value={companyForm.companyState}
                  onChange={(e) => handleCompanyFormChange('companyState', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={companyForm.companyZipCode}
                  onChange={(e) => handleCompanyFormChange('companyZipCode', e.target.value)}
                />
              </Stack>
              <TextField
                fullWidth
                label="Phone"
                value={companyForm.companyPhone}
                onChange={(e) => handleCompanyFormChange('companyPhone', e.target.value)}
              />
              <TextField
                fullWidth
                select
                label="Locale"
                value={companyForm.locale}
                onChange={(e) => handleCompanyFormChange('locale', e.target.value)}
              >
                {COMMON_LOCALES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompanyDialog(false)}>Cancel</Button>
            <Button onClick={handleCompanySubmit} variant="contained" disabled={submitting || !companyForm.companyName.trim()}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Locations</Typography>
            <Button
              startIcon={<Add />}
              onClick={handleOpenAddLocation}
              variant="outlined"
              size="small"
              disabled={!canAddLocation}
              title={!canAddLocation ? `Your ${tier} plan allows ${locationLimit} location(s). Upgrade to Premium or Enterprise for more.` : ''}
            >
              Add Location
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Physical store locations. Each can have its own address, phone, and timezone.
          </Typography>
          {locations.length === 0 ? (
            <Typography color="text.secondary">
              No locations yet. Add at least one location.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {locations.map((loc) => (
                <Card key={loc.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {loc.name}
                          {loc.isPrimary && (
                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                              (Primary)
                            </Typography>
                          )}
                        </Typography>
                        {(loc.address || loc.city) && (
                          <Typography variant="body2" color="text.secondary">
                            {[loc.address, loc.city, loc.state, loc.zipCode].filter(Boolean).join(', ')}
                          </Typography>
                        )}
                        {loc.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {loc.phone}
                          </Typography>
                        )}
                        {loc.timezone && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {loc.timezone}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row">
                        <IconButton size="small" onClick={() => handleOpenEditLocation(loc)} aria-label="Edit location">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(loc)} aria-label="Delete location">
                          <Delete />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>

        <Dialog open={!!locationDialog} onClose={() => setLocationDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>{locationDialog?.mode === 'add' ? 'Add Location' : 'Edit Location'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Location Name"
                value={locationForm.name}
                onChange={(e) => handleLocationFormChange('name', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Address"
                value={locationForm.address}
                onChange={(e) => handleLocationFormChange('address', e.target.value)}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="City"
                  value={locationForm.city}
                  onChange={(e) => handleLocationFormChange('city', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="State"
                  value={locationForm.state}
                  onChange={(e) => handleLocationFormChange('state', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Zip"
                  value={locationForm.zipCode}
                  onChange={(e) => handleLocationFormChange('zipCode', e.target.value)}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Phone"
                value={locationForm.phone}
                onChange={(e) => handleLocationFormChange('phone', e.target.value)}
                fullWidth
              />
              <TextField
                fullWidth
                select
                label="Timezone"
                value={locationForm.timezone}
                onChange={(e) => handleLocationFormChange('timezone', e.target.value)}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant={locationForm.isPrimary ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleLocationFormChange('isPrimary', !locationForm.isPrimary)}
              >
                {locationForm.isPrimary ? 'Primary Location' : 'Set as Primary'}
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLocationDialog(null)}>Cancel</Button>
            <Button onClick={handleLocationSubmit} variant="contained" disabled={submitting || !locationForm.name.trim()}>
              {locationDialog?.mode === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!deleteConfirm} onClose={() => { setDeleteConfirm(null); setDeletionInfo(null); setDeleteAction(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Location?</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;?
            </Typography>
            {deletionInfo?.hasInventory ? (
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  This location has {deletionInfo.inventoryCount} inventory item(s). Choose how to proceed:
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Button
                    variant={deleteAction?.action === 'delete_inventory' ? 'contained' : 'outlined'}
                    size="small"
                    color="error"
                    onClick={() => setDeleteAction({ action: 'delete_inventory' })}
                  >
                    Delete all inventory
                  </Button>
                  {deletionInfo.otherLocations?.length > 0 && (
                    <>
                      <Typography variant="body2" color="text.secondary">or</Typography>
                      <Button
                        variant={deleteAction?.action === 'reassign' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setDeleteAction({ action: 'reassign', targetId: deletionInfo.otherLocations[0].id })}
                      >
                        Move to another location
                      </Button>
                    </>
                  )}
                </Stack>
                {deleteAction?.action === 'reassign' && deletionInfo.otherLocations?.length > 0 && (
                  <TextField
                    select
                    fullWidth
                    label="Move inventory to"
                    value={deleteAction.targetId || ''}
                    onChange={(e) => setDeleteAction((a) => ({ ...a, targetId: parseInt(e.target.value, 10) }))}
                  >
                    {deletionInfo.otherLocations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary">This cannot be undone.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setDeleteConfirm(null); setDeletionInfo(null); setDeleteAction(null); }}>Cancel</Button>
            <Button onClick={handleDeleteLocation} color="error" variant="contained" disabled={submitting || (deletionInfo?.hasInventory && !deleteAction)}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={logoRemoveConfirm} onClose={() => setLogoRemoveConfirm(false)}>
          <DialogTitle>Remove Logo?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove the company logo?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoRemoveConfirm(false)}>Cancel</Button>
            <Button onClick={handleLogoRemove} color="error" variant="contained" disabled={submitting}>
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
