import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Button,
  Stack,
  Grid,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  CircularProgress,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Add,
  VideogameAsset,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { searchGames, getMarketPrices } from '../services/gameApi';
import { useCreateInventoryItemMutation } from '../store/inventoryApi';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../contexts/FormattingContext';
import { getCompanyProfile } from '../services/profileApi';

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const [createInventoryItem, { isLoading: isCreating }] = useCreateInventoryItemMutation();
  const { getAuthHeaders } = useAuth();
  const { formatYear } = useFormatting();
  const [locationId, setLocationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [marketPrices, setMarketPrices] = useState(null);
  const [formData, setFormData] = useState({
    condition: 'Complete',
    completeness: {
      box: false,
      instructions: false,
      game: false,
      inserts: false,
      other: false,
    },
    quantity: 1,
    buyPrice: '',
    sellPrice: '',
    notes: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    getCompanyProfile(getAuthHeaders())
      .then((res) => {
        const locations = res?.data?.locations ?? [];
        const primary = locations.find((l) => l.isPrimary) ?? locations[0];
        if (primary) setLocationId(primary.id);
      })
      .catch(() => {});
  }, [getAuthHeaders]);

  const conditionOptions = ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'];
  const completenessItems = [
    { key: 'box', label: 'Box' },
    { key: 'instructions', label: 'Instructions/Manual' },
    { key: 'game', label: 'Game' },
    { key: 'inserts', label: 'Inserts' },
    { key: 'other', label: 'Other' },
  ];

  const gameSearchSubtitle = (game) => {
    const parts = [];
    if (game.console?.trim()) parts.push(game.console.trim());
    if (game.publisher?.trim()) parts.push(game.publisher.trim());
    if (game.genre?.trim()) parts.push(game.genre.trim());
    if (game.region?.trim()) parts.push(game.region.trim());
    if (game.releaseDate) {
      const y = formatYear(game.releaseDate);
      if (y) parts.push(y);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Video game';
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchGames(searchQuery, getAuthHeaders());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getSuggestedPrice = (condition, prices) => {
    if (!prices) return null;
    const complete = Number(prices.complete);
    const loose = Number(prices.loose);
    const newPrice = Number(prices.new);
    const cib = Number.isFinite(complete) ? complete : Number(prices.cib);
    const looseOk = Number.isFinite(loose) ? loose : Number.isFinite(cib) ? cib * 0.65 : NaN;
    const newOk = Number.isFinite(newPrice) ? newPrice : Number.isFinite(cib) ? cib * 1.25 : NaN;
    if (!Number.isFinite(cib) && !Number.isFinite(looseOk)) return null;

    const conditionMap = {
      New: newOk,
      'Like New': Number.isFinite(newOk) ? newOk * 0.9 : cib * 0.95,
      'Very Good': Number.isFinite(cib) ? cib * 0.85 : looseOk * 1.1,
      Good: Number.isFinite(cib) ? cib * 0.75 : looseOk,
      Fair: Number.isFinite(looseOk) ? looseOk * 0.9 : cib * 0.65,
      Poor: Number.isFinite(looseOk) ? looseOk * 0.7 : cib * 0.55,
    };

    const fallback = Number.isFinite(cib) ? cib : looseOk;
    return conditionMap[condition] ?? fallback;
  };

  const handleGameSelect = async (game) => {
    setSelectedGame(game);
    setSearchResults([]);
    setSearchQuery(`${game.title} (${game.console})`);
    
    // Fetch market prices for reference
    try {
      const prices = await getMarketPrices(game.id);
      setMarketPrices(prices);
      
      // Pre-fill sell price based on current condition
      if (prices) {
        const suggestedPrice = getSuggestedPrice(formData.condition, prices);
        if (suggestedPrice) {
          setFormData((prev) => ({
            ...prev,
            sellPrice: suggestedPrice.toFixed(2),
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching market prices:', error);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Update suggested sell price when condition changes
    if (field === 'condition' && selectedGame && marketPrices) {
      const suggestedPrice = getSuggestedPrice(value, marketPrices);
      if (suggestedPrice) {
        setFormData((prev) => ({
          ...prev,
          sellPrice: suggestedPrice.toFixed(2),
        }));
      }
    }
  };

  const handleCompletenessChange = (itemKey) => (event) => {
    setFormData((prev) => ({
      ...prev,
      completeness: {
        ...prev.completeness,
        [itemKey]: event.target.checked,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!locationId) {
      alert('Please wait for locations to load, or add a location in your company profile.');
      return;
    }

    if (!formData.completeness.game) {
      alert('Please check at least "Game" in the completeness section.');
      return;
    }

    const name = selectedGame
      ? `${selectedGame.title} (${selectedGame.console})`
      : formData.name || 'Unknown Item';
    const category = selectedGame?.console || 'Video Games';

    // MyStore API expects gameId / game.id as strings (C# string?). Numeric JSON breaks deserialization.
    const catalogGameId =
      selectedGame?.id != null && selectedGame.id !== ''
        ? String(selectedGame.id)
        : null;

    try {
      await createInventoryItem({
        locationId,
        name,
        category,
        quantity: parseInt(formData.quantity, 10),
        sellPrice: parseFloat(formData.sellPrice || 0),
        buyPrice: formData.buyPrice ? parseFloat(formData.buyPrice) : null,
        condition: formData.condition,
        gameId: catalogGameId,
        game:
          selectedGame && catalogGameId
            ? {
                id: catalogGameId,
                title: selectedGame.title,
                console: selectedGame.console,
                releaseDate: selectedGame.releaseDate || null,
                publisher: selectedGame.publisher ?? null,
                genre: selectedGame.genre ?? null,
                imageUrl: selectedGame.imageUrl ?? null,
              }
            : null,
        completeness: formData.completeness,
        notes: formData.notes || null,
      }).unwrap();

      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard/inventory'), 2000);
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to add item');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/inventory')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Add Inventory Item
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Item added successfully! Redirecting to inventory...
          </Alert>
        )}

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Search for Game
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Search games by title, console, or publisher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="e.g., Zelda, Nintendo Switch, etc."
              />
              <Button
                variant="contained"
                startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
                onClick={handleSearch}
                disabled={isSearching}
                sx={{ minWidth: 120 }}
              >
                Search
              </Button>
            </Stack>

            {searchResults.length > 0 && (
              <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {searchResults.map((game, index) => (
                    <Box key={game.id}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleGameSelect(game)}>
                          <ListItemAvatar>
                            {/* Avatar falls back to the icon child if the cover image 404s */}
                            <Avatar src={game.imageUrl || undefined} variant="rounded">
                              <VideogameAsset />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={game.title}
                            secondary={gameSearchSubtitle(game)}
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < searchResults.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            )}

            {selectedGame && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Selected: {selectedGame.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedGame.console} • Released: {formatYear(selectedGame.releaseDate)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {selectedGame && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Item Details
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Condition"
                      value={formData.condition}
                      onChange={handleInputChange('condition')}
                      required
                    >
                      {conditionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Completeness *
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={2}>
                        {completenessItems.map((item) => (
                          <Grid item xs={12} sm={6} md={4} key={item.key}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.completeness[item.key]}
                                  onChange={handleCompletenessChange(item.key)}
                                />
                              }
                              label={item.label}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </FormGroup>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={formData.quantity}
                      onChange={handleInputChange('quantity')}
                      inputProps={{ min: 1 }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Buy Price ($)"
                      value={formData.buyPrice}
                      onChange={handleInputChange('buyPrice')}
                      inputProps={{ step: '0.01', min: '0' }}
                      placeholder="0.00"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Sell Price ($)"
                      value={formData.sellPrice}
                      onChange={handleInputChange('sellPrice')}
                      inputProps={{ step: '0.01', min: '0' }}
                      placeholder="0.00"
                      required
                    />
                    {marketPrices && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Market reference: Loose ${marketPrices.loose} | CIB ${marketPrices.complete} | New ${marketPrices.new}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes"
                      value={formData.notes}
                      onChange={handleInputChange('notes')}
                      placeholder="Any additional notes about this item..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" onClick={() => navigate('/dashboard/inventory')}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Add />}
                      >
                        Add to Inventory
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default AddInventoryItem;

