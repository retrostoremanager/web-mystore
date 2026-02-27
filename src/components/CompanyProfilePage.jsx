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
  Grid,
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
import {
  getCompanyProfile,
  updateCompanyProfile,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../services/profileApi';

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
  const { getAuthHeaders } = useAuth();
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
  });
  const [locations, setLocations] = useState([]);
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
      });
      setLocations(locs);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await updateCompanyProfile(profile, getAuthHeaders());
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
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
    } catch (err) {
      setError(err.message || 'Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteConfirm) return;
    try {
      setSubmitting(true);
      setError(null);
      await deleteLocation(deleteConfirm.id, getAuthHeaders());
      setDeleteConfirm(null);
      await loadProfile();
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

        <Paper component="form" onSubmit={handleProfileSubmit} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Company
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Company name and contact info. Use for mailing address, PO box, or headquarters if different from store locations.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={profile.companyName}
                onChange={(e) => handleProfileChange('companyName', e.target.value)}
                required
                helperText="The business name you entered at registration."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={profile.companyAddress}
                onChange={(e) => handleProfileChange('companyAddress', e.target.value)}
                placeholder="Street, PO box, etc."
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={profile.companyCity}
                onChange={(e) => handleProfileChange('companyCity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={profile.companyState}
                onChange={(e) => handleProfileChange('companyState', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zip Code"
                value={profile.companyZipCode}
                onChange={(e) => handleProfileChange('companyZipCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.companyPhone}
                onChange={(e) => handleProfileChange('companyPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Locale"
                value={profile.locale}
                onChange={(e) => handleProfileChange('locale', e.target.value)}
              >
                {COMMON_LOCALES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" disabled={submitting || !profile.companyName.trim()}>
              {submitting ? 'Saving...' : 'Save Company'}
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Locations</Typography>
            <Button startIcon={<Add />} onClick={handleOpenAddLocation} variant="outlined" size="small">
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
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(loc)} aria-label="Delete location">
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

        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Delete Location?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={handleDeleteLocation} color="error" variant="contained" disabled={submitting}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
