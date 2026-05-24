import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Inventory,
  ArrowBack,
  Add,
  Edit,
  Delete,
  Search,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetInventoryQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from '../store/inventoryApi';
import { getCompanyProfile } from '../services/profileApi';
import { searchGames } from '../services/gameApi';
import { useAuth } from '../contexts/AuthContext';

const CONDITIONS = ['Loose', 'CIB', 'New'];

const getItemSystemLabel = (item) => {
  const fromCategory = item.category?.trim();
  if (fromCategory) return fromCategory;
  const fromGame = item.game?.console?.trim();
  if (fromGame) return fromGame;
  return '';
};

const emptyForm = {
  name: '',
  category: '',
  condition: '',
  sellPrice: '',
  quantity: '',
  locationId: '',
};

const ItemDialog = ({ open, onClose, onSubmit, initialValues, loading, locations }) => {
  const [form, setForm] = useState(emptyForm);
  const [gameSearch, setGameSearch] = useState('');
  const [gameResults, setGameResults] = useState([]);
  const [gameSearching, setGameSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...initialValues } : emptyForm);
      if (!initialValues) {
        setGameSearch('');
        setGameResults([]);
        setSelectedGame(null);
      }
    }
  }, [open, initialValues]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGameSearch = async () => {
    if (!gameSearch.trim()) {
      setGameResults([]);
      return;
    }
    setGameSearching(true);
    try {
      const results = await searchGames(gameSearch.trim());
      setGameResults(results);
    } catch {
      setGameResults([]);
    } finally {
      setGameSearching(false);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setGameResults([]);
    setGameSearch(`${game.title} (${game.console})`);
    setForm((prev) => ({
      ...prev,
      name: prev.name || `${game.title} (${game.console})`,
      category: prev.category || game.console || '',
    }));
  };

  const handleSubmit = () => {
    onSubmit(form, selectedGame);
  };

  const isEdit = Boolean(initialValues);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {!isEdit && (
            <Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Search game catalog"
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGameSearch(); }}
                  fullWidth
                  size="small"
                  placeholder="e.g. Zelda, NES, etc."
                />
                <Button
                  variant="outlined"
                  onClick={handleGameSearch}
                  disabled={gameSearching}
                  startIcon={gameSearching ? <CircularProgress size={14} /> : <Search />}
                  sx={{ minWidth: 90, whiteSpace: 'nowrap' }}
                >
                  Search
                </Button>
              </Stack>
              {gameResults.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 180, overflow: 'auto' }} variant="outlined">
                  <List dense disablePadding>
                    {gameResults.map((game) => (
                      <ListItem key={game.id} disablePadding>
                        <ListItemButton onClick={() => handleGameSelect(game)}>
                          <ListItemText
                            primary={game.title}
                            secondary={game.console}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              {selectedGame && (
                <Alert severity="info" sx={{ mt: 1 }} icon={false}>
                  Selected: <strong>{selectedGame.title}</strong> ({selectedGame.console})
                </Alert>
              )}
            </Box>
          )}
          <TextField
            label="Name"
            value={form.name}
            onChange={handleChange('name')}
            required
            fullWidth
            autoFocus={isEdit}
          />
          <TextField
            label="Platform / Category"
            value={form.category}
            onChange={handleChange('category')}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Condition</InputLabel>
            <Select
              value={form.condition}
              label="Condition"
              onChange={handleChange('condition')}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {CONDITIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Price"
            type="number"
            value={form.sellPrice}
            onChange={handleChange('sellPrice')}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          />
          <TextField
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange('quantity')}
            fullWidth
            inputProps={{ min: 0, step: 1 }}
          />
          <FormControl fullWidth required>
            <InputLabel>Location</InputLabel>
            <Select
              value={form.locationId}
              label="Location"
              onChange={handleChange('locationId')}
            >
              <MenuItem value="">
                <em>Select a location</em>
              </MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !form.name.trim() || !form.locationId || (!isEdit && !selectedGame)}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {isEdit ? 'Save' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfirmDialog = ({ open, onClose, onConfirm, loading, itemName }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Item</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : null}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const InventoryPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [locations, setLocations] = useState([]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { data: inventory = [], isLoading, isError, error } = useGetInventoryQuery(
    { locationId: locationFilter ? Number(locationFilter) : undefined },
    { pollingInterval: 30000 }
  );

  const [createItem, { isLoading: isCreating }] = useCreateInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation();
  const [deleteItemMutation, { isLoading: isDeleting }] = useDeleteInventoryItemMutation();

  useEffect(() => {
    getCompanyProfile(getAuthHeaders())
      .then((res) => setLocations(res?.data?.locations ?? []))
      .catch(() => {});
  }, [getAuthHeaders]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const normalizedRows = useMemo(
    () =>
      inventory.map((item) => ({
        ...item,
        systemLabel: getItemSystemLabel(item),
        displayPrice: item.sellPrice != null ? Number(item.sellPrice) : 0,
      })),
    [inventory]
  );

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return normalizedRows;
    const q = searchQuery.toLowerCase();
    return normalizedRows.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.systemLabel?.toLowerCase().includes(q)
    );
  }, [normalizedRows, searchQuery]);

  const handleAdd = async (form, selectedGame) => {
    const catalogGameId =
      selectedGame?.id != null && selectedGame.id !== ''
        ? String(selectedGame.id)
        : null;
    try {
      await createItem({
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        condition: form.condition || undefined,
        sellPrice: form.sellPrice !== '' ? Number(form.sellPrice) : undefined,
        quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
        locationId: form.locationId !== '' ? Number(form.locationId) : undefined,
        gameId: catalogGameId,
        game: selectedGame && catalogGameId
          ? {
              id: catalogGameId,
              title: selectedGame.title,
              console: selectedGame.console,
            }
          : undefined,
      }).unwrap();
      setAddDialogOpen(false);
      showSnackbar('Item added successfully');
    } catch (err) {
      showSnackbar(err?.data?.message || err?.message || 'Failed to add item', 'error');
    }
  };

  const handleEdit = async (form, _selectedGame) => {
    try {
      await updateItem({
        id: editItem.id,
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        condition: form.condition || undefined,
        sellPrice: form.sellPrice !== '' ? Number(form.sellPrice) : undefined,
        quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
        locationId: form.locationId !== '' ? Number(form.locationId) : undefined,
      }).unwrap();
      setEditDialogOpen(false);
      setEditItem(null);
      showSnackbar('Item updated successfully');
    } catch (err) {
      showSnackbar(err?.data?.message || err?.message || 'Failed to update item', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItemMutation(deleteItem.id).unwrap();
      setDeleteDialogOpen(false);
      setDeleteItem(null);
      showSnackbar('Item deleted successfully');
    } catch (err) {
      showSnackbar(err?.data?.message || err?.message || 'Failed to delete item', 'error');
    }
  };

  const openEdit = (item) => {
    setEditItem({
      id: item.id,
      name: item.name || '',
      category: item.systemLabel || '',
      condition: item.condition || '',
      sellPrice: item.sellPrice != null ? String(item.sellPrice) : '',
      quantity: item.quantity != null ? String(item.quantity) : '',
      locationId: item.locationId != null ? item.locationId : '',
    });
    setEditDialogOpen(true);
  };

  const openDelete = (item) => {
    setDeleteItem(item);
    setDeleteDialogOpen(true);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 160,
    },
    {
      field: 'systemLabel',
      headerName: 'Platform / Category',
      flex: 1.5,
      minWidth: 140,
      renderCell: ({ value }) =>
        value ? (
          <Chip label={value} size="small" color="primary" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: 'condition',
      headerName: 'Condition',
      flex: 1,
      minWidth: 100,
      renderCell: ({ value }) =>
        value ? (
          <Chip label={value} size="small" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: 'displayPrice',
      headerName: 'Price',
      flex: 1,
      minWidth: 90,
      type: 'number',
      valueFormatter: ({ value }) =>
        value != null ? `$${Number(value).toFixed(2)}` : '$0.00',
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 0.8,
      minWidth: 80,
      type: 'number',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            aria-label="edit"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              openDelete(row);
            }}
            aria-label="delete"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const skeletonRows = Array.from({ length: 8 }, (_, i) => ({ id: `skeleton-${i}` }));

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Store Inventory
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { md: 'center' },
                gap: 2,
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Inventory sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Inventory Items
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
                <TextField
                  size="small"
                  placeholder="Search by name, platform..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 220 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" /> Location
                    </Box>
                  </InputLabel>
                  <Select
                    value={locationFilter}
                    label="Location"
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={String(loc.id)}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/inventory/bulk-import')}
                >
                  Bulk Import
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddDialogOpen(true)}
                >
                  Add Item
                </Button>
              </Stack>
            </Box>

            {isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error?.data?.message || error?.message || 'Failed to load inventory'}
              </Alert>
            )}

            {isLoading ? (
              <Box>
                {skeletonRows.map((row) => (
                  <Skeleton key={row.id} variant="rectangular" height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
                ))}
              </Box>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  autoHeight
                  pageSizeOptions={[25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                  onRowClick={({ row }) => navigate(`/dashboard/inventory/${row.id}`)}
                  sx={{ cursor: 'pointer', border: 'none' }}
                  slots={{
                    noRowsOverlay: () => (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          py: 6,
                        }}
                      >
                        <Inventory sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          {searchQuery
                            ? 'No items match your search.'
                            : 'No items yet. Add your first item.'}
                        </Typography>
                        {!searchQuery && (
                          <Button
                            variant="contained"
                            startIcon={<Add />}
                            sx={{ mt: 2 }}
                            onClick={() => setAddDialogOpen(true)}
                          >
                            Add Item
                          </Button>
                        )}
                      </Box>
                    ),
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <ItemDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAdd}
        initialValues={null}
        loading={isCreating}
        locations={locations}
      />

      <ItemDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleEdit}
        initialValues={editItem}
        loading={isUpdating}
        locations={locations}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteItem(null);
        }}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemName={deleteItem?.name}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryPage;
