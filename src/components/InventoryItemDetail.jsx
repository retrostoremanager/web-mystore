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
  Grid,
  Chip,
  Divider,
  Stack,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Button,
  MenuItem,
  FormGroup,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Inventory,
  CheckCircle,
  Cancel,
  Edit,
  Save,
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';

const InventoryItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { inventory, updateInventoryItem } = useInventory();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const item = inventory.find((i) => i.id === Number(id));

  // Initialize form data from item
  const [formData, setFormData] = useState(() => {
    const currentItem = inventory.find((i) => i.id === Number(id));
    if (!currentItem) return null;
    return {
      name: currentItem.name || '',
      category: currentItem.category || '',
      condition: currentItem.condition || 'New',
      quantity: currentItem.quantity || 1,
      buyPrice: currentItem.buyPrice || '',
      sellPrice: currentItem.sellPrice || '0',
      notes: currentItem.notes || '',
      completeness: currentItem.completeness || {
        box: false,
        instructions: false,
        game: false,
        inserts: false,
        other: false,
      },
      game: currentItem.game ? { ...currentItem.game } : null,
    };
  });

  const conditionOptions = ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'];

  // Show loading state if inventory is still being loaded
  if (inventory.length === 0 && !item) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar 
          position="sticky" 
          elevation={1}
          sx={{
            bgcolor: '#2c3e50',
            color: '#ffffff',
          }}
        >
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/inventory')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Loading...
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Loading item details...
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar 
          position="sticky" 
          elevation={1}
          sx={{
            bgcolor: '#2c3e50', // Dark slate gray
            color: '#ffffff',
          }}
        >
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/inventory')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Item Not Found
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                The requested inventory item could not be found.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const completenessItems = [
    { key: 'box', label: 'Box' },
    { key: 'instructions', label: 'Instructions/Manual' },
    { key: 'game', label: 'Game' },
    { key: 'inserts', label: 'Inserts' },
    { key: 'other', label: 'Other' },
  ];

  // Update form data when item changes (but not when in edit mode)
  useEffect(() => {
    if (item && !isEditMode) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        condition: item.condition || 'New',
        quantity: item.quantity || 1,
        buyPrice: item.buyPrice || '',
        sellPrice: item.sellPrice || '0',
        notes: item.notes || '',
        completeness: item.completeness || {
          box: false,
          instructions: false,
          game: false,
          inserts: false,
          other: false,
        },
        game: item.game ? { ...item.game } : null,
      });
    }
  }, [item, isEditMode]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGameFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => {
      if (!prev.game) {
        // Initialize game object if it doesn't exist
        return {
          ...prev,
          game: { [field]: value },
        };
      }
      return {
        ...prev,
        game: { ...prev.game, [field]: value },
      };
    });
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

  const handleSave = () => {
    if (!formData) return;

    // Validate that at least the game is checked
    if (!formData.completeness.game) {
      alert('Please check at least "Game" in the completeness section.');
      return;
    }

    // Prepare updates
    const updates = {
      name: formData.name,
      category: formData.category,
      condition: formData.condition,
      quantity: parseInt(formData.quantity, 10),
      buyPrice: formData.buyPrice || '',
      sellPrice: formData.sellPrice || '0',
      notes: formData.notes || '',
      completeness: formData.completeness,
      // Update price for display
      price: `$${parseFloat(formData.sellPrice || 0).toFixed(2)}`,
    };

    // Handle game data - convert release date to ISO format if it's a date string
    if (formData.game) {
      const gameData = { ...formData.game };
      if (gameData.releaseDate && typeof gameData.releaseDate === 'string' && gameData.releaseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Convert YYYY-MM-DD to ISO string
        gameData.releaseDate = new Date(gameData.releaseDate + 'T00:00:00').toISOString();
      }
      updates.game = gameData;
    } else {
      updates.game = null;
    }

    updateInventoryItem(Number(id), updates);
    setIsEditMode(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    // Reset form data to original item values
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        condition: item.condition || 'New',
        quantity: item.quantity || 1,
        buyPrice: item.buyPrice || '',
        sellPrice: item.sellPrice || '0',
        notes: item.notes || '',
        completeness: item.completeness || {
          box: false,
          instructions: false,
          game: false,
          inserts: false,
          other: false,
        },
        game: item.game ? { ...item.game } : null,
      });
    }
    setIsEditMode(false);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          bgcolor: '#2c3e50', // Dark slate gray
          color: '#ffffff',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/inventory')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {isEditMode ? 'Edit Inventory Item' : 'Inventory Item Details'}
          </Typography>
          {!isEditMode ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<Edit />}
              onClick={() => setIsEditMode(true)}
              sx={{ 
                ml: 2,
                fontWeight: 600,
                boxShadow: 3,
                bgcolor: '#16a085', // Teal green
                color: '#ffffff',
                '&:hover': {
                  bgcolor: '#138d75', // Darker teal on hover
                  boxShadow: 5,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Edit Item
            </Button>
          ) : (
            <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={handleCancel}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{
                  bgcolor: '#16a085', // Teal green
                  color: '#ffffff',
                  '&:hover': {
                    bgcolor: '#138d75', // Darker teal on hover
                  },
                }}
              >
                Save
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Item updated successfully!
          </Alert>
        )}
        <Grid container spacing={3}>
          {/* Main Details */}
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Inventory sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                  {isEditMode ? (
                    <TextField
                      fullWidth
                      label="Item Name"
                      value={formData?.name || ''}
                      onChange={handleInputChange('name')}
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Game Information */}
                {(item.game || (isEditMode && formData?.game)) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Game Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        {isEditMode ? (
                          <TextField
                            fullWidth
                            label="Title"
                            value={formData?.game?.title || ''}
                            onChange={handleGameFieldChange('title')}
                          />
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Title
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.game.title}
                            </Typography>
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {isEditMode ? (
                          <TextField
                            fullWidth
                            label="Console"
                            value={formData?.game?.console || ''}
                            onChange={handleGameFieldChange('console')}
                          />
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Console
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.game.console}
                            </Typography>
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {isEditMode ? (
                          <TextField
                            fullWidth
                            label="Publisher"
                            value={formData?.game?.publisher || ''}
                            onChange={handleGameFieldChange('publisher')}
                          />
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Publisher
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.game.publisher}
                            </Typography>
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {isEditMode ? (
                          <TextField
                            fullWidth
                            label="Genre"
                            value={formData?.game?.genre || ''}
                            onChange={handleGameFieldChange('genre')}
                          />
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Genre
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.game.genre}
                            </Typography>
                          </>
                        )}
                      </Grid>
                      {(item.game?.releaseDate || (isEditMode && formData?.game?.releaseDate)) && (
                        <Grid item xs={12} sm={6}>
                          {isEditMode ? (
                            <TextField
                              fullWidth
                              label="Release Date"
                              type="date"
                              value={
                                formData?.game?.releaseDate
                                  ? formData.game.releaseDate.includes('T')
                                    ? formData.game.releaseDate.split('T')[0]
                                    : formData.game.releaseDate
                                  : ''
                              }
                              onChange={(e) => handleGameFieldChange('releaseDate')({ target: { value: e.target.value } })}
                              InputLabelProps={{ shrink: true }}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                Release Date
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {new Date(item.game.releaseDate).toLocaleDateString()}
                              </Typography>
                            </>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}

                {item.game && <Divider sx={{ mb: 3 }} />}

                {/* Item Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Item Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          label="Category"
                          value={formData?.category || ''}
                          onChange={handleInputChange('category')}
                        />
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Category
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip label={item.category} size="small" color="primary" variant="outlined" />
                          </Box>
                        </>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          select
                          label="Condition"
                          value={formData?.condition || 'New'}
                          onChange={handleInputChange('condition')}
                        >
                          {conditionOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Condition
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {item.condition}
                          </Typography>
                        </>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantity"
                          value={formData?.quantity || 1}
                          onChange={handleInputChange('quantity')}
                          inputProps={{ min: 1 }}
                        />
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Quantity
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {item.quantity}
                          </Typography>
                        </>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          type="number"
                          label="Sell Price ($)"
                          value={formData?.sellPrice || '0'}
                          onChange={handleInputChange('sellPrice')}
                          inputProps={{ step: '0.01', min: '0' }}
                        />
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Sell Price
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                            ${parseFloat(item.sellPrice || 0).toFixed(2)}
                          </Typography>
                        </>
                      )}
                    </Grid>
                    {(item.buyPrice || isEditMode) && (
                      <Grid item xs={12} sm={6}>
                        {isEditMode ? (
                          <TextField
                            fullWidth
                            type="number"
                            label="Buy Price ($)"
                            value={formData?.buyPrice || ''}
                            onChange={handleInputChange('buyPrice')}
                            inputProps={{ step: '0.01', min: '0' }}
                            placeholder="0.00"
                          />
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Buy Price
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                              ${parseFloat(item.buyPrice).toFixed(2)}
                            </Typography>
                          </>
                        )}
                      </Grid>
                    )}
                    {item.addedDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Added Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {new Date(item.addedDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Completeness */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Completeness
                  </Typography>
                  {isEditMode ? (
                    <FormGroup>
                      <Grid container spacing={2}>
                        {completenessItems.map((compItem) => (
                          <Grid item xs={12} sm={6} md={4} key={compItem.key}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData?.completeness?.[compItem.key] || false}
                                  onChange={handleCompletenessChange(compItem.key)}
                                />
                              }
                              label={compItem.label}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </FormGroup>
                  ) : (
                    <Grid container spacing={2}>
                      {completenessItems.map((compItem) => (
                        <Grid item xs={12} sm={6} md={4} key={compItem.key}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: item.completeness[compItem.key] ? 'success.light' : 'grey.100',
                            }}
                          >
                            {item.completeness[compItem.key] ? (
                              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                            ) : (
                              <Cancel sx={{ color: 'error.main', mr: 1 }} />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {compItem.label}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                {/* Notes */}
                {(item.notes || isEditMode) && (
                  <>
                    <Divider sx={{ mb: 3 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notes
                      </Typography>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Notes"
                          value={formData?.notes || ''}
                          onChange={handleInputChange('notes')}
                          placeholder="Any additional notes about this item..."
                        />
                      ) : (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {item.notes || 'No notes'}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Summary
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${(
                        parseFloat(isEditMode ? (formData?.sellPrice || 0) : (item.sellPrice || 0)) *
                        (isEditMode ? (formData?.quantity || 1) : item.quantity)
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isEditMode ? (formData?.quantity || 1) : item.quantity} × $
                      {parseFloat(isEditMode ? (formData?.sellPrice || 0) : (item.sellPrice || 0)).toFixed(2)}
                    </Typography>
                  </Box>
                  {(item.buyPrice || (isEditMode && formData?.buyPrice)) && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Cost
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ${(
                          parseFloat(isEditMode ? (formData?.buyPrice || 0) : (item.buyPrice || 0)) *
                          (isEditMode ? (formData?.quantity || 1) : item.quantity)
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {(item.buyPrice || (isEditMode && formData?.buyPrice)) && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Potential Profit
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color:
                            (parseFloat(isEditMode ? (formData?.sellPrice || 0) : (item.sellPrice || 0)) -
                              parseFloat(isEditMode ? (formData?.buyPrice || 0) : (item.buyPrice || 0))) *
                              (isEditMode ? (formData?.quantity || 1) : item.quantity) >=
                            0
                              ? 'success.main'
                              : 'error.main',
                        }}
                      >
                        $
                        {(
                          (parseFloat(isEditMode ? (formData?.sellPrice || 0) : (item.sellPrice || 0)) -
                            parseFloat(isEditMode ? (formData?.buyPrice || 0) : (item.buyPrice || 0))) *
                          (isEditMode ? (formData?.quantity || 1) : item.quantity)
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default InventoryItemDetail;

