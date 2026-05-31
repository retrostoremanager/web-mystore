import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Skeleton,
  Stack,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete, LocalOffer } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../services/promotionsApi';

const EMPTY_FORM = {
  name: '',
  type: 'percentage',
  scope: 'store_wide',
  scopeValue: '',
  discountPercent: '',
  buyQuantity: '',
  getQuantity: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const EMPTY_ERRORS = {
  name: '',
  discountPercent: '',
  buyQuantity: '',
  getQuantity: '',
  scopeValue: '',
};

function formatValue(row) {
  if (row.type === 'percentage') {
    return row.discountPercent != null ? `${row.discountPercent}%` : '—';
  }
  if (row.type === 'bxgy') {
    const b = row.buyQuantity ?? row.buy_quantity;
    const g = row.getQuantity ?? row.get_quantity;
    if (b != null && g != null) return `Buy ${b} Get ${g}`;
  }
  return '—';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

const PromotionsPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (severity, message) =>
    setSnackbar({ open: true, message, severity });

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPromotions(getAuthHeaders());
      setPromotions(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to load promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFieldErrors(EMPTY_ERRORS);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setForm({
      name: row.name || '',
      type: row.type || 'percentage',
      scope: row.scope || 'store_wide',
      scopeValue: row.scopeValue || row.scope_value || '',
      discountPercent:
        row.discountPercent != null ? String(row.discountPercent) : '',
      buyQuantity:
        (row.buyQuantity ?? row.buy_quantity) != null
          ? String(row.buyQuantity ?? row.buy_quantity)
          : '',
      getQuantity:
        (row.getQuantity ?? row.get_quantity) != null
          ? String(row.getQuantity ?? row.get_quantity)
          : '',
      startDate: row.startDate
        ? row.startDate.slice(0, 10)
        : row.start_date
          ? row.start_date.slice(0, 10)
          : '',
      endDate: row.endDate
        ? row.endDate.slice(0, 10)
        : row.end_date
          ? row.end_date.slice(0, 10)
          : '',
      isActive: row.isActive ?? row.is_active ?? true,
    });
    setFieldErrors(EMPTY_ERRORS);
    setDialogOpen(true);
  };

  const openDelete = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = { ...EMPTY_ERRORS };
    let valid = true;

    if (!form.name.trim()) {
      errs.name = 'Name is required';
      valid = false;
    }

    if (form.type === 'percentage') {
      const pct = parseFloat(form.discountPercent);
      if (form.discountPercent === '' || isNaN(pct) || pct < 0 || pct > 100) {
        errs.discountPercent = 'Enter a percentage between 0 and 100';
        valid = false;
      }
    }

    if (form.type === 'bxgy') {
      const bq = parseInt(form.buyQuantity, 10);
      if (form.buyQuantity === '' || isNaN(bq) || bq < 1) {
        errs.buyQuantity = 'Enter a positive integer';
        valid = false;
      }
      const gq = parseInt(form.getQuantity, 10);
      if (form.getQuantity === '' || isNaN(gq) || gq < 1) {
        errs.getQuantity = 'Enter a positive integer';
        valid = false;
      }
    }

    if (form.scope !== 'store_wide' && !form.scopeValue.trim()) {
      errs.scopeValue = 'Scope value is required';
      valid = false;
    }

    setFieldErrors(errs);
    return valid;
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      type: form.type,
      scope: form.scope,
      isActive: form.isActive,
    };
    if (form.startDate) payload.startDate = form.startDate;
    if (form.endDate) payload.endDate = form.endDate;
    if (form.scope !== 'store_wide') payload.scopeValue = form.scopeValue.trim();
    if (form.type === 'percentage') {
      payload.discountPercent = parseFloat(form.discountPercent);
    }
    if (form.type === 'bxgy') {
      payload.buyQuantity = parseInt(form.buyQuantity, 10);
      payload.getQuantity = parseInt(form.getQuantity, 10);
    }
    return payload;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (editTarget) {
        const result = await updatePromotion(editTarget.id, payload, getAuthHeaders());
        const updated = result.data || { ...editTarget, ...payload };
        setPromotions((prev) =>
          prev.map((p) => (p.id === editTarget.id ? { ...p, ...updated } : p))
        );
        showSnackbar('success', 'Promotion updated successfully');
      } else {
        const result = await createPromotion(payload, getAuthHeaders());
        const created = result.data || { id: Date.now(), ...payload };
        setPromotions((prev) => [...prev, created]);
        showSnackbar('success', 'Promotion created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to save promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePromotion(deleteTarget.id, getAuthHeaders());
      setPromotions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showSnackbar('success', 'Promotion deleted');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to delete promotion');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (row) => {
    setTogglingId(row.id);
    const newActive = !(row.isActive ?? row.is_active);
    try {
      const result = await updatePromotion(row.id, { isActive: newActive }, getAuthHeaders());
      const updated = result.data || { ...row, isActive: newActive };
      setPromotions((prev) =>
        prev.map((p) => (p.id === row.id ? { ...p, ...updated, isActive: newActive } : p))
      );
      showSnackbar('success', `Promotion ${newActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showSnackbar('error', err.message || 'Failed to update promotion');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1.5, minWidth: 150 },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          label={value === 'bxgy' ? 'Buy X Get Y' : 'Percentage'}
          size="small"
          color={value === 'bxgy' ? 'info' : 'secondary'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 140,
      valueGetter: (_, row) => formatValue(row),
    },
    {
      field: 'scope',
      headerName: 'Scope',
      width: 130,
      renderCell: ({ value, row }) => {
        const sv = row.scopeValue || row.scope_value;
        return (
          <Typography variant="body2">
            {value === 'store_wide' ? 'Store Wide' : value === 'category' ? `Category: ${sv || ''}` : `Item: ${sv || ''}`}
          </Typography>
        );
      },
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      valueGetter: (value, row) => value || row.start_date,
      renderCell: ({ value }) => <Typography variant="body2">{formatDate(value)}</Typography>,
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      valueGetter: (value, row) => value || row.end_date,
      renderCell: ({ value }) => <Typography variant="body2">{formatDate(value)}</Typography>,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      valueGetter: (value, row) => value ?? row.is_active,
      renderCell: ({ value, row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {togglingId === row.id ? (
            <CircularProgress size={16} />
          ) : (
            <Switch
              size="small"
              checked={!!value}
              onChange={() => handleToggleActive(row)}
            />
          )}
          <Chip
            label={value ? 'Active' : 'Inactive'}
            size="small"
            color={value ? 'success' : 'default'}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => openDelete(row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const skeletonRows = Array.from({ length: 5 }).map((_, i) => ({ id: `skel-${i}` }));

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Promotions
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            variant="outlined"
            onClick={openCreate}
            sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
          >
            Create Promotion
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <LocalOffer color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Promotions
          </Typography>
        </Stack>

        <Box sx={{ height: 520 }}>
          {loading ? (
            <Stack spacing={1}>
              {skeletonRows.map((r) => (
                <Skeleton key={r.id} variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          ) : (
            <DataGrid
              rows={promotions}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              slots={{
                noRowsOverlay: () => (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      gap: 1,
                    }}
                  >
                    <LocalOffer sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography color="text.secondary">No promotions found</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
                      Create your first promotion
                    </Button>
                  </Box>
                ),
              }}
            />
          )}
        </Box>
      </Container>

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              disabled={submitting}
            />

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value, discountPercent: '', buyQuantity: '', getQuantity: '' }))
                }
                disabled={submitting}
              >
                <MenuItem value="percentage">Percentage Discount</MenuItem>
                <MenuItem value="bxgy">Buy X Get Y Free</MenuItem>
              </Select>
            </FormControl>

            {form.type === 'percentage' && (
              <TextField
                label="Discount Percent"
                required
                fullWidth
                type="number"
                value={form.discountPercent}
                onChange={(e) => setForm((p) => ({ ...p, discountPercent: e.target.value }))}
                error={!!fieldErrors.discountPercent}
                helperText={fieldErrors.discountPercent || 'Enter a value between 0 and 100'}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                disabled={submitting}
              />
            )}

            {form.type === 'bxgy' && (
              <>
                <TextField
                  label="Buy Quantity"
                  required
                  fullWidth
                  type="number"
                  value={form.buyQuantity}
                  onChange={(e) => setForm((p) => ({ ...p, buyQuantity: e.target.value }))}
                  error={!!fieldErrors.buyQuantity}
                  helperText={fieldErrors.buyQuantity || 'Number of items to buy'}
                  inputProps={{ min: 1, step: 1 }}
                  disabled={submitting}
                />
                <TextField
                  label="Get Quantity"
                  required
                  fullWidth
                  type="number"
                  value={form.getQuantity}
                  onChange={(e) => setForm((p) => ({ ...p, getQuantity: e.target.value }))}
                  error={!!fieldErrors.getQuantity}
                  helperText={fieldErrors.getQuantity || 'Number of items given free'}
                  inputProps={{ min: 1, step: 1 }}
                  disabled={submitting}
                />
              </>
            )}

            <FormControl fullWidth required>
              <InputLabel>Scope</InputLabel>
              <Select
                label="Scope"
                value={form.scope}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scope: e.target.value, scopeValue: '' }))
                }
                disabled={submitting}
              >
                <MenuItem value="store_wide">Store Wide</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="item">Item</MenuItem>
              </Select>
            </FormControl>

            {form.scope !== 'store_wide' && (
              <TextField
                label={form.scope === 'category' ? 'Category' : 'Item'}
                required
                fullWidth
                value={form.scopeValue}
                onChange={(e) => setForm((p) => ({ ...p, scopeValue: e.target.value }))}
                error={!!fieldErrors.scopeValue}
                helperText={
                  fieldErrors.scopeValue ||
                  (form.scope === 'category' ? 'Enter the category name' : 'Enter the item identifier')
                }
                disabled={submitting}
              />
            )}

            <TextField
              label="Start Date"
              fullWidth
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
            />

            <TextField
              label="End Date"
              fullWidth
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              helperText="Optional"
              disabled={submitting}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  disabled={submitting}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Promotion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? 'Deleting…' : 'Delete'}
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
};

export default PromotionsPage;
