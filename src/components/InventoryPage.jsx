import { useState, useMemo, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  TableSortLabel,
  Popover,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Inventory,
  ArrowBack,
  Add,
  FilterList,
  Clear,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  Search,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetInventoryQuery } from '../store/inventoryApi';
import { getCompanyProfile } from '../services/profileApi';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Alert } from '@mui/material';

const InventoryPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [locations, setLocations] = useState([]);

  const { data: inventory = [], isLoading, isError, error } = useGetInventoryQuery(
    {
      q: searchQuery || undefined,
      locationId: locationFilter ? Number(locationFilter) : undefined,
    },
    { pollingInterval: 30000 }
  );

  useEffect(() => {
    getCompanyProfile(getAuthHeaders())
      .then((res) => setLocations(res?.data?.locations ?? []))
      .catch(() => {});
  }, [getAuthHeaders]);
  
  // Sorting state
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  
  // Client-side column filters (in addition to server search/location)
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
  });
  
  // Filter popover state
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [activeFilterField, setActiveFilterField] = useState(null);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle filter icon click
  const handleFilterClick = (event, field) => {
    // If clicking the same filter, close it; otherwise open the new one
    if (filterAnchor && activeFilterField === field) {
      handleFilterClose();
    } else {
      setActiveFilterField(field);
      setFilterAnchor(event.currentTarget);
    }
  };

  // Handle filter popover close
  const handleFilterClose = () => {
    setFilterAnchor(null);
    setActiveFilterField(null);
  };

  // Handle filter changes
  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Clear specific filter
  const handleClearFilter = (field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: '',
    }));
    handleFilterClose();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      name: '',
      category: '',
      quantity: '',
      price: '',
    });
  };

  // Normalize items for display (API returns sellPrice, we use price for display)
  const normalizedInventory = useMemo(
    () =>
      inventory.map((item) => ({
        ...item,
        price: item.sellPrice != null ? `$${Number(item.sellPrice).toFixed(2)}` : '$0.00',
      })),
    [inventory]
  );

  // Sort and filter inventory
  const sortedAndFilteredInventory = useMemo(() => {
    let filtered = [...normalizedInventory];

    // Apply filters
    if (filters.name) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter((item) =>
        item.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.quantity) {
      filtered = filtered.filter((item) =>
        String(item.quantity ?? '').includes(filters.quantity)
      );
    }
    if (filters.price) {
      filtered = filtered.filter((item) =>
        (item.price ?? '').toLowerCase().includes(filters.price.toLowerCase())
      );
    }

    // Apply sorting
    if (orderBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (orderBy) {
          case 'name':
            aValue = a.name?.toLowerCase() ?? '';
            bValue = b.name?.toLowerCase() ?? '';
            break;
          case 'category':
            aValue = a.category?.toLowerCase() ?? '';
            bValue = b.category?.toLowerCase() ?? '';
            break;
          case 'quantity':
            aValue = a.quantity ?? 0;
            bValue = b.quantity ?? 0;
            break;
          case 'price':
            aValue = a.sellPrice ?? 0;
            bValue = b.sellPrice ?? 0;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string') {
          return order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        }
      });
    }

    return filtered;
  }, [normalizedInventory, filters, orderBy, order]);

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== '');

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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Inventory sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Inventory Items
                </Typography>
                {sortedAndFilteredInventory.length !== normalizedInventory.length && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    ({sortedAndFilteredInventory.length} of {normalizedInventory.length})
                  </Typography>
                )}
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
                <TextField
                  size="small"
                  placeholder="Search by name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="location-filter-label">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" /> Location
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="location-filter-label"
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
                  onClick={() => navigate('/dashboard/inventory/add')}
                >
                  Add Item
                </Button>
              </Stack>
            </Box>

            {hasActiveFilters && (
              <Box sx={{ mb: 2 }}>
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  variant="outlined"
                >
                  Clear All Filters
                </Button>
              </Box>
            )}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error?.data?.message || error?.message || 'Failed to load inventory'}
              </Alert>
            )}
            {!isLoading && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.7 },
                          }}
                          onClick={() => handleRequestSort('name')}
                        >
                          <Typography sx={{ fontWeight: 600 }}>Item Name</Typography>
                          {orderBy === 'name' ? (
                            order === 'asc' ? (
                              <ArrowUpward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            ) : (
                              <ArrowDownward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            )
                          ) : (
                            <UnfoldMore sx={{ fontSize: 18, ml: 0.5, color: 'action.disabled' }} />
                          )}
                        </Box>
                        <Badge
                          badgeContent={filters.name ? 1 : 0}
                          color="primary"
                          invisible={!filters.name}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'name')}
                            sx={{
                              p: 0.5,
                              color: filters.name ? 'primary.main' : 'action.disabled',
                            }}
                          >
                            <FilterList fontSize="small" />
                          </IconButton>
                        </Badge>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.7 },
                          }}
                          onClick={() => handleRequestSort('category')}
                        >
                          <Typography sx={{ fontWeight: 600 }}>Category</Typography>
                          {orderBy === 'category' ? (
                            order === 'asc' ? (
                              <ArrowUpward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            ) : (
                              <ArrowDownward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            )
                          ) : (
                            <UnfoldMore sx={{ fontSize: 18, ml: 0.5, color: 'action.disabled' }} />
                          )}
                        </Box>
                        <Badge
                          badgeContent={filters.category ? 1 : 0}
                          color="primary"
                          invisible={!filters.category}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'category')}
                            sx={{
                              p: 0.5,
                              color: filters.category ? 'primary.main' : 'action.disabled',
                            }}
                          >
                            <FilterList fontSize="small" />
                          </IconButton>
                        </Badge>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn fontSize="small" /> Location
                        </Box>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.7 },
                          }}
                          onClick={() => handleRequestSort('quantity')}
                        >
                          <Typography sx={{ fontWeight: 600 }}>Quantity</Typography>
                          {orderBy === 'quantity' ? (
                            order === 'asc' ? (
                              <ArrowUpward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            ) : (
                              <ArrowDownward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            )
                          ) : (
                            <UnfoldMore sx={{ fontSize: 18, ml: 0.5, color: 'action.disabled' }} />
                          )}
                        </Box>
                        <Badge
                          badgeContent={filters.quantity ? 1 : 0}
                          color="primary"
                          invisible={!filters.quantity}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'quantity')}
                            sx={{
                              p: 0.5,
                              color: filters.quantity ? 'primary.main' : 'action.disabled',
                            }}
                          >
                            <FilterList fontSize="small" />
                          </IconButton>
                        </Badge>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.7 },
                          }}
                          onClick={() => handleRequestSort('price')}
                        >
                          <Typography sx={{ fontWeight: 600 }}>Price</Typography>
                          {orderBy === 'price' ? (
                            order === 'asc' ? (
                              <ArrowUpward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            ) : (
                              <ArrowDownward sx={{ fontSize: 18, ml: 0.5, color: 'primary.main' }} />
                            )
                          ) : (
                            <UnfoldMore sx={{ fontSize: 18, ml: 0.5, color: 'action.disabled' }} />
                          )}
                        </Box>
                        <Badge
                          badgeContent={filters.price ? 1 : 0}
                          color="primary"
                          invisible={!filters.price}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'price')}
                            sx={{
                              p: 0.5,
                              color: filters.price ? 'primary.main' : 'action.disabled',
                            }}
                          >
                            <FilterList fontSize="small" />
                          </IconButton>
                        </Badge>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {normalizedInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No inventory items yet. Click "Add Item" to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : sortedAndFilteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No items match your filters. Try adjusting your search criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedAndFilteredInventory.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        onClick={() => navigate(`/dashboard/inventory/${item.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.locationName || `Location ${item.locationId}`}
                            size="small"
                            variant="outlined"
                            icon={<LocationOn sx={{ fontSize: 14 }} />}
                          />
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            )}

            {/* Filter Popover */}
            {filterAnchor && activeFilterField && (
              <Popover
                open={Boolean(filterAnchor && activeFilterField)}
                anchorEl={filterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <Box sx={{ p: 2, minWidth: 250 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Filter by{' '}
                    {activeFilterField === 'name'
                      ? 'Item Name'
                      : activeFilterField === 'category'
                      ? 'Category'
                      : activeFilterField === 'quantity'
                      ? 'Quantity'
                      : 'Price'}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={filters[activeFilterField] || ''}
                    onChange={handleFilterChange(activeFilterField)}
                    placeholder={`Enter ${
                      activeFilterField === 'name'
                        ? 'item name'
                        : activeFilterField === 'category'
                        ? 'category'
                        : activeFilterField === 'quantity'
                        ? 'quantity'
                        : 'price'
                    }...`}
                    type={activeFilterField === 'quantity' ? 'number' : 'text'}
                    autoFocus
                    InputProps={{
                      endAdornment: filters[activeFilterField] && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => handleClearFilter(activeFilterField)}
                            edge="end"
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Popover>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InventoryPage;

