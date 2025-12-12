import { useState, useMemo } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';

const InventoryPage = () => {
  const navigate = useNavigate();
  const { inventory } = useInventory();
  
  // Sorting state
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  
  // Filtering state
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

  // Sort and filter inventory
  const sortedAndFilteredInventory = useMemo(() => {
    let filtered = [...inventory];

    // Apply filters
    if (filters.name) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter((item) =>
        item.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.quantity) {
      filtered = filtered.filter((item) =>
        String(item.quantity).includes(filters.quantity)
      );
    }
    if (filters.price) {
      filtered = filtered.filter((item) =>
        item.price.toLowerCase().includes(filters.price.toLowerCase())
      );
    }

    // Apply sorting
    if (orderBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (orderBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'category':
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          case 'quantity':
            aValue = a.quantity || 0;
            bValue = b.quantity || 0;
            break;
          case 'price':
            // Extract numeric value from price string (e.g., "$149.99" -> 149.99)
            aValue = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
            bValue = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
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
  }, [inventory, filters, orderBy, order]);

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Inventory Items
                </Typography>
                {sortedAndFilteredInventory.length !== inventory.length && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    ({sortedAndFilteredInventory.length} of {inventory.length})
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={2}>
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
                  {inventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No inventory items yet. Click "Add Item" to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : sortedAndFilteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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

