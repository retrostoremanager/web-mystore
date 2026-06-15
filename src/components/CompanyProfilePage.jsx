import { useState, useEffect, useRef, useCallback } from 'react';
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
  MenuItem,
  Stack,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
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
  getTaxSettings,
  updateTaxSettings,
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

const ACCEPTED_LOGO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_LOGO_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

export function validateLogoFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' };
  if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please use JPG, PNG, or WebP.' };
  }
  if (file.size > MAX_LOGO_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }
  return { valid: true, error: null };
}

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const { refresh: refreshFormatting } = useFormatting();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    companyName: '',
    companyAddress: '',
    companyAddress2: '',
    companyCity: '',
    companyState: '',
    companyZipCode: '',
    companyCountry: '',
    companyPhone: '',
    locale: 'en-US',
    logoUrl: '',
  });
  const [locations, setLocations] = useState([]);
  const [trialStatus, setTrialStatus] = useState(null);

  const [infoForm, setInfoForm] = useState({
    companyName: '',
    companyAddress: '',
    companyAddress2: '',
    companyCity: '',
    companyState: '',
    companyZipCode: '',
    companyCountry: '',
    companyPhone: '',
    locale: 'en-US',
  });
  const [infoSaving, setInfoSaving] = useState(false);

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoPendingFile, setLogoPendingFile] = useState(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoRemoveConfirm, setLogoRemoveConfirm] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

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
  const [locationSaving, setLocationSaving] = useState(false);

  const [taxForm, setTaxForm] = useState({ taxEnabled: false, taxRate: '', taxLabel: '' });
  const [taxLoading, setTaxLoading] = useState(true);
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxRateError, setTaxRateError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletionInfo, setDeletionInfo] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const showSnackbar = (severity, message) => {
    setSnackbar({ open: true, severity, message });
  };

  const loadTaxSettings = async () => {
    try {
      setTaxLoading(true);
      const result = await getTaxSettings(getAuthHeaders());
      const t = result.data || {};
      setTaxForm({
        taxEnabled: t.taxEnabled ?? false,
        taxRate: t.taxRate != null ? String(parseFloat((t.taxRate * 100).toFixed(2))) : '',
        taxLabel: t.taxLabel || '',
      });
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to load tax settings');
    } finally {
      setTaxLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await getCompanyProfile(getAuthHeaders());
      const p = result.data?.profile || {};
      const locs = result.data?.locations || [];
      const profileData = {
        companyName: p.companyName || '',
        companyAddress: p.companyAddress || '',
        companyAddress2: p.companyAddress2 || '',
        companyCity: p.companyCity || '',
        companyState: p.companyState || '',
        companyZipCode: p.companyZipCode || '',
        companyCountry: p.companyCountry || '',
        companyPhone: p.companyPhone || '',
        locale: p.locale || 'en-US',
        logoUrl: p.logoUrl || '',
      };
      setProfile(profileData);
      setInfoForm({
        companyName: profileData.companyName,
        companyAddress: profileData.companyAddress,
        companyAddress2: profileData.companyAddress2,
        companyCity: profileData.companyCity,
        companyState: profileData.companyState,
        companyZipCode: profileData.companyZipCode,
        companyCountry: profileData.companyCountry,
        companyPhone: profileData.companyPhone,
        locale: profileData.locale,
      });
      setLocations(locs);
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && getAuthHeaders().Authorization) {
      loadProfile();
      loadTaxSettings();
      getTrialStatus(getAuthHeaders())
        .then((res) => setTrialStatus(res.data || null))
        .catch(() => setTrialStatus(null));
    }
  }, [isAuthenticated, getAuthHeaders]);

  const TIER_LOCATION_LIMITS = { Basic: 1, Trial: 1, Premium: 3, Enterprise: null };
  const tier = (trialStatus?.subscriptionTier || 'Basic').replace(/^trial$/i, 'Basic');
  const locationLimit = TIER_LOCATION_LIMITS[tier] ?? TIER_LOCATION_LIMITS.Basic;
  const canAddLocation = locationLimit == null || locations.length < locationLimit;

  const handleTaxChange = (field, value) => {
    setTaxForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'taxRate') {
      const num = parseFloat(value);
      if (value !== '' && (isNaN(num) || num < 0 || num > 100)) {
        setTaxRateError('Rate must be between 0 and 100.');
      } else {
        setTaxRateError('');
      }
    }
  };

  const handleTaxSave = async () => {
    const rateNum = parseFloat(taxForm.taxRate);
    if (taxForm.taxRate !== '' && (isNaN(rateNum) || rateNum < 0 || rateNum > 100)) return;
    try {
      setTaxSaving(true);
      await updateTaxSettings(
        {
          taxEnabled: taxForm.taxEnabled,
          taxRate: taxForm.taxRate === '' ? 0 : parseFloat((rateNum / 100).toFixed(6)),
          taxLabel: taxForm.taxLabel || 'Sales Tax',
        },
        getAuthHeaders()
      );
      showSnackbar('success', 'Tax settings saved successfully.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to save tax settings.');
    } finally {
      setTaxSaving(false);
    }
  };

  const handleInfoChange = (field, value) => {
    setInfoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInfoSave = async () => {
    if (!infoForm.companyName.trim()) return;
    try {
      setInfoSaving(true);
      await updateCompanyProfile(infoForm, getAuthHeaders());
      await loadProfile();
      refreshFormatting();
      showSnackbar('success', 'Company info saved successfully.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to save company info.');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleFileSelected = (file) => {
    const { valid, error } = validateLogoFile(file);
    if (!valid) {
      showSnackbar('error', error);
      return;
    }
    setLogoPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    e.target.value = '';
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }, []);

  const handleLogoSave = async () => {
    if (!logoPendingFile) return;
    try {
      setLogoSaving(true);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(logoPendingFile);
      });
      await uploadLogo(
        { file: base64, fileName: logoPendingFile.name, contentType: logoPendingFile.type },
        getAuthHeaders()
      );
      setLogoPendingFile(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      await loadProfile();
      showSnackbar('success', 'Logo uploaded successfully.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to upload logo.');
    } finally {
      setLogoSaving(false);
    }
  };

  const handleLogoCancelPreview = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoPendingFile(null);
  };

  const handleLogoRemove = async () => {
    try {
      setLogoSaving(true);
      await deleteLogo(getAuthHeaders());
      setLogoRemoveConfirm(false);
      await loadProfile();
      showSnackbar('success', 'Logo removed.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to remove logo.');
    } finally {
      setLogoSaving(false);
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
      setLocationSaving(true);
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
      showSnackbar('success', locationDialog.mode === 'add' ? 'Location added.' : 'Location updated.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to save location.');
    } finally {
      setLocationSaving(false);
    }
  };

  const handleDeleteClick = async (loc) => {
    try {
      const info = await getLocationDeletionInfo(loc.id, getAuthHeaders());
      const data = info.data || null;
      setDeletionInfo(data);
      setDeleteConfirm(loc);
      setDeleteAction(
        data?.hasInventory && !data.otherLocations?.length
          ? { action: 'delete_inventory' }
          : null
      );
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to load deletion info.');
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteConfirm) return;
    if (deletionInfo?.hasInventory && !deleteAction) {
      showSnackbar('error', 'Please choose how to handle inventory: delete it or move to another location.');
      return;
    }
    if (
      deleteAction?.action === 'reassign' &&
      (!deletionInfo?.otherLocations?.length || !deleteAction.targetId)
    ) {
      showSnackbar('error', 'Please select a location to move inventory to.');
      return;
    }
    try {
      setDeleteSubmitting(true);
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
      showSnackbar('success', 'Location deleted.');
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to delete location.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const currentLogoSrc = logoPreview || profile.logoUrl;

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
          Manage your company information, logo, and store locations.
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Company Info
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your company name and contact details. Use for mailing address, PO box, or headquarters.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {loading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
                <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
                <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
              </Stack>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Skeleton variant="rounded" width={100} height={36} />
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Company Name"
                value={infoForm.companyName}
                onChange={(e) => handleInfoChange('companyName', e.target.value)}
                required
                disabled={infoSaving}
              />
              <TextField
                fullWidth
                label="Address Line 1"
                value={infoForm.companyAddress}
                onChange={(e) => handleInfoChange('companyAddress', e.target.value)}
                placeholder="Street, PO box, etc."
                disabled={infoSaving}
              />
              <TextField
                fullWidth
                label="Address Line 2"
                value={infoForm.companyAddress2}
                onChange={(e) => handleInfoChange('companyAddress2', e.target.value)}
                placeholder="Apt, suite, unit, building, floor, etc."
                disabled={infoSaving}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={infoForm.companyCity}
                  onChange={(e) => handleInfoChange('companyCity', e.target.value)}
                  disabled={infoSaving}
                />
                <TextField
                  fullWidth
                  label="State/Province"
                  value={infoForm.companyState}
                  onChange={(e) => handleInfoChange('companyState', e.target.value)}
                  disabled={infoSaving}
                />
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={infoForm.companyZipCode}
                  onChange={(e) => handleInfoChange('companyZipCode', e.target.value)}
                  disabled={infoSaving}
                />
              </Stack>
              <TextField
                fullWidth
                label="Country"
                value={infoForm.companyCountry}
                onChange={(e) => handleInfoChange('companyCountry', e.target.value)}
                disabled={infoSaving}
                placeholder="e.g. United States"
                helperText="Country name or code (e.g. USA, Canada, United Kingdom)"
              />
              <TextField
                fullWidth
                label="Phone"
                value={infoForm.companyPhone}
                onChange={(e) => handleInfoChange('companyPhone', e.target.value)}
                disabled={infoSaving}
              />
              <TextField
                fullWidth
                select
                label="Locale"
                value={infoForm.locale}
                onChange={(e) => handleInfoChange('locale', e.target.value)}
                disabled={infoSaving}
              >
                {COMMON_LOCALES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleInfoSave}
                  disabled={infoSaving || !infoForm.companyName.trim()}
                  startIcon={infoSaving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {infoSaving ? 'Saving…' : 'Save Info'}
                </Button>
              </Box>
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Company Logo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            JPG, PNG, or WebP · Max 5 MB
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {currentLogoSrc && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                {logoPreview ? 'Preview (unsaved)' : 'Current logo'}
              </Typography>
              <Box
                component="img"
                src={currentLogoSrc}
                alt="Company logo preview"
                sx={{
                  maxWidth: 180,
                  maxHeight: 120,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: logoPreview ? 'primary.main' : 'divider',
                  display: 'block',
                }}
              />
            </Box>
          )}

          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !logoSaving && fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: logoSaving ? 'not-allowed' : 'pointer',
              bgcolor: isDragOver ? 'action.hover' : 'background.paper',
              transition: 'border-color 0.2s, background-color 0.2s',
              '&:hover': logoSaving ? {} : { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Drag & drop an image here, or{' '}
              <Typography component="span" color="primary" fontWeight={600}>
                browse
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              JPG, PNG, WebP · Max 5 MB
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={ACCEPTED_LOGO_ACCEPT}
              onChange={handleFileInputChange}
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="flex-end">
            {logoPendingFile && (
              <Button variant="outlined" onClick={handleLogoCancelPreview} disabled={logoSaving}>
                Cancel
              </Button>
            )}
            {logoPendingFile && (
              <Button
                variant="contained"
                onClick={handleLogoSave}
                disabled={logoSaving}
                startIcon={logoSaving ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {logoSaving ? 'Uploading…' : 'Upload Logo'}
              </Button>
            )}
            {profile.logoUrl && !logoPendingFile && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setLogoRemoveConfirm(true)}
                disabled={logoSaving}
              >
                Remove Logo
              </Button>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tax
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure sales tax collection for your store.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {taxLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={42} width={220} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Skeleton variant="rounded" width={160} height={36} />
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={taxForm.taxEnabled}
                    onChange={(e) => handleTaxChange('taxEnabled', e.target.checked)}
                    disabled={taxSaving}
                  />
                }
                label="Enable tax collection"
              />
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={taxForm.taxRate}
                onChange={(e) => handleTaxChange('taxRate', e.target.value)}
                disabled={taxSaving || !taxForm.taxEnabled}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                error={!!taxRateError}
                helperText={taxRateError || 'Enter a percentage, e.g. 8.75 for 8.75%'}
              />
              <TextField
                fullWidth
                label="Tax Label"
                value={taxForm.taxLabel}
                onChange={(e) => handleTaxChange('taxLabel', e.target.value)}
                disabled={taxSaving || !taxForm.taxEnabled}
                placeholder="Sales Tax"
              />
              {taxForm.taxEnabled && (
                <Typography variant="body2" color="text.secondary">
                  A $100.00 sale will include ${
                    isNaN(parseFloat(taxForm.taxRate))
                      ? '0.00'
                      : ((parseFloat(taxForm.taxRate) / 100) * 100).toFixed(2)
                  } in {taxForm.taxLabel || 'Sales Tax'}.
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleTaxSave}
                  disabled={taxSaving || !!taxRateError}
                  startIcon={taxSaving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {taxSaving ? 'Saving…' : 'Save Tax Settings'}
                </Button>
              </Box>
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Locations</Typography>
            <Button
              startIcon={<Add />}
              onClick={handleOpenAddLocation}
              variant="outlined"
              size="small"
              disabled={!canAddLocation}
              title={
                !canAddLocation
                  ? `Your ${tier} plan allows ${locationLimit} location(s). Upgrade to Premium or Enterprise for more.`
                  : ''
              }
            >
              Add Location
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Physical store locations. Each can have its own address, phone, and timezone.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {locations.length === 0 ? (
            <Typography color="text.secondary">No locations yet. Add at least one location.</Typography>
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
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(loc)}
                          aria-label="Delete location"
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
        </Paper>
      </Container>

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
              disabled={locationSaving}
            />
            <TextField
              label="Address"
              value={locationForm.address}
              onChange={(e) => handleLocationFormChange('address', e.target.value)}
              fullWidth
              disabled={locationSaving}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="City"
                value={locationForm.city}
                onChange={(e) => handleLocationFormChange('city', e.target.value)}
                fullWidth
                disabled={locationSaving}
              />
              <TextField
                label="State"
                value={locationForm.state}
                onChange={(e) => handleLocationFormChange('state', e.target.value)}
                fullWidth
                disabled={locationSaving}
              />
              <TextField
                label="Zip"
                value={locationForm.zipCode}
                onChange={(e) => handleLocationFormChange('zipCode', e.target.value)}
                fullWidth
                disabled={locationSaving}
              />
            </Stack>
            <TextField
              label="Phone"
              value={locationForm.phone}
              onChange={(e) => handleLocationFormChange('phone', e.target.value)}
              fullWidth
              disabled={locationSaving}
            />
            <TextField
              fullWidth
              select
              label="Timezone"
              value={locationForm.timezone}
              onChange={(e) => handleLocationFormChange('timezone', e.target.value)}
              disabled={locationSaving}
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
              disabled={locationSaving}
            >
              {locationForm.isPrimary ? 'Primary Location' : 'Set as Primary'}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialog(null)} disabled={locationSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleLocationSubmit}
            variant="contained"
            disabled={locationSaving || !locationForm.name.trim()}
            startIcon={locationSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {locationDialog?.mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onClose={() => {
          setDeleteConfirm(null);
          setDeletionInfo(null);
          setDeleteAction(null);
        }}
        maxWidth="sm"
        fullWidth
      >
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
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                    <Button
                      variant={deleteAction?.action === 'reassign' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() =>
                        setDeleteAction({ action: 'reassign', targetId: deletionInfo.otherLocations[0].id })
                      }
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
                  onChange={(e) =>
                    setDeleteAction((a) => ({ ...a, targetId: parseInt(e.target.value, 10) }))
                  }
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
          <Button
            onClick={() => {
              setDeleteConfirm(null);
              setDeletionInfo(null);
              setDeleteAction(null);
            }}
            disabled={deleteSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteLocation}
            color="error"
            variant="contained"
            disabled={deleteSubmitting || (deletionInfo?.hasInventory && !deleteAction)}
            startIcon={deleteSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logoRemoveConfirm} onClose={() => setLogoRemoveConfirm(false)}>
        <DialogTitle>Remove Logo?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove the company logo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoRemoveConfirm(false)} disabled={logoSaving}>
            Cancel
          </Button>
          <Button onClick={handleLogoRemove} color="error" variant="contained" disabled={logoSaving}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

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
