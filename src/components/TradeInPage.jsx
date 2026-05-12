import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import {
  SwapHoriz,
  ArrowBack,
  Inventory2,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TradeInPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Trade-in
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SwapHoriz sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Trade-ins
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Guided trade-in workflows and market-based pricing are on our roadmap. Until then, process buy-outs at
              the counter and add accepted items to inventory with your cost and condition so stock and margins stay
              accurate.
            </Alert>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You can track incoming stock and sell prices from{' '}
              <strong>Inventory</strong>, and use <strong>Checkout</strong> when trade credit or cash-outs tie to a sale.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" startIcon={<Inventory2 />} onClick={() => navigate('/dashboard/inventory')}>
                Go to inventory
              </Button>
              <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default TradeInPage;
