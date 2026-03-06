import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  PointOfSale,
  ArrowBack,
  Add,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetInventoryQuery } from '../store/inventoryApi';

const steps = ['Select Customer', 'Add Items', 'Review & Complete'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: inventory = [] } = useGetInventoryQuery(undefined, { pollingInterval: 30000 });
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [checkoutData, setCheckoutData] = useState({
    customer: null,
    customerName: '',
    customerEmail: '',
    items: [],
  });

  // Mock customer list
  const customers = [
    { id: 1, name: 'John Smith', email: 'john.smith@email.com' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    { id: 3, name: 'Mike Chen', email: 'mike.chen@email.com' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@email.com' },
    { id: 5, name: 'David Wilson', email: 'david.w@email.com' },
  ];

  const handleCustomerSelect = (event, value) => {
    if (value) {
      setCheckoutData({
        ...checkoutData,
        customer: value,
        customerName: value.name,
        customerEmail: value.email,
      });
    } else {
      setCheckoutData({
        ...checkoutData,
        customer: null,
        customerName: '',
        customerEmail: '',
      });
    }
    setError('');
  };

  const handleNewCustomer = () => {
    setCheckoutData({
      ...checkoutData,
      customer: null,
      customerName: '',
      customerEmail: '',
    });
  };

  const handleAddItem = (item) => {
    const existingItem = checkoutData.items.find((i) => i.id === item.id);
    if (existingItem) {
      setCheckoutData({
        ...checkoutData,
        items: checkoutData.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      setCheckoutData({
        ...checkoutData,
        items: [...checkoutData.items, { ...item, quantity: 1 }],
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    setCheckoutData({
      ...checkoutData,
      items: checkoutData.items.filter((i) => i.id !== itemId),
    });
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCheckoutData({
      ...checkoutData,
      items: checkoutData.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    });
  };

  const calculateTotal = () => {
    return checkoutData.items.reduce((total, item) => {
      const price = parseFloat(item.sellPrice || item.price?.replace('$', '') || 0);
      return total + price * item.quantity;
    }, 0);
  };

  const validateStep1 = () => {
    if (!checkoutData.customerName.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!checkoutData.customerEmail.trim()) {
      setError('Customer email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.customerEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (checkoutData.items.length === 0) {
      setError('Please add at least one item to the cart');
      return false;
    }
    // Check if all items have available quantity
    for (const cartItem of checkoutData.items) {
      const inventoryItem = inventory.find((i) => i.id === cartItem.id);
      if (!inventoryItem || cartItem.quantity > (inventoryItem.quantity || 0)) {
        setError(`Insufficient quantity for ${cartItem.name}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (activeStep === 0 && !validateStep1()) {
      return;
    }
    if (activeStep === 1 && !validateStep2()) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call to process transaction
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call here to:
      // 1. Create/update customer record
      // 2. Create transaction record
      // 3. Update inventory quantities
      
      console.log('Transaction completed:', {
        customer: checkoutData.customerName,
        email: checkoutData.customerEmail,
        items: checkoutData.items,
        total: calculateTotal(),
      });
      
      // Move to completion step
      setActiveStep(2);
    } catch (err) {
      setError('Failed to process transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Select Customer
            </Typography>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={checkoutData.customer}
              onChange={handleCustomerSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for existing customer"
                  placeholder="Type to search..."
                />
              )}
            />
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Box>
            <TextField
              label="Customer Name"
              fullWidth
              required
              value={checkoutData.customerName}
              onChange={(e) => {
                setCheckoutData({ ...checkoutData, customerName: e.target.value });
                setError('');
              }}
              placeholder="Enter customer name"
              autoFocus
            />
            <TextField
              label="Customer Email"
              fullWidth
              required
              type="email"
              value={checkoutData.customerEmail}
              onChange={(e) => {
                setCheckoutData({ ...checkoutData, customerEmail: e.target.value });
                setError('');
              }}
              placeholder="customer@email.com"
            />
          </Stack>
        );
      
      case 1:
        const availableItems = inventory.filter((item) => (item.quantity || 0) > 0);
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Add Items to Cart
            </Typography>
            {availableItems.length === 0 ? (
              <Alert severity="info">No items available in inventory</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Available</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableItems.map((item) => {
                      const cartItem = checkoutData.items.find((i) => i.id === item.id);
                      const inCart = !!cartItem;
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.price || `$${item.sellPrice || '0.00'}`}</TableCell>
                          <TableCell align="right">{item.quantity || 0}</TableCell>
                          <TableCell align="right">
                            {inCart ? (
                              <Chip
                                label={`${cartItem.quantity} in cart`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              <Button
                                size="small"
                                startIcon={<Add />}
                                onClick={() => handleAddItem(item)}
                                variant="outlined"
                              >
                                Add
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {checkoutData.items.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cart Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Subtotal</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checkoutData.items.map((item) => {
                        const price = parseFloat(item.sellPrice || item.price?.replace('$', '') || 0);
                        const subtotal = price * item.quantity;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.price || `$${price.toFixed(2)}`}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.id, parseInt(e.target.value, 10) || 0)
                                }
                                inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                              />
                            </TableCell>
                            <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        );
      
      case 2:
        return (
          <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Transaction Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 500 }}>
              The transaction has been processed successfully. A receipt has been generated.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setCheckoutData({ customer: null, customerName: '', customerEmail: '', items: [] });
                  setActiveStep(0);
                }}
              >
                New Transaction
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <PointOfSale sx={{ mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Checkout
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400, mb: 4 }}>
            {renderStepContent()}
          </Box>

          {activeStep < 2 && (
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === 1 ? handleComplete : handleNext}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? (
                  'Processing...'
                ) : activeStep === 1 ? (
                  'Complete Transaction'
                ) : (
                  'Next'
                )}
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
