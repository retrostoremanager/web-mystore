import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  PointOfSale,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();

  const checkoutData = [
    { id: 1, transactionId: 'TXN-001', customer: 'John Smith', items: 3, total: '$349.97', status: 'Completed' },
    { id: 2, transactionId: 'TXN-002', customer: 'Mike Chen', items: 2, total: '$199.98', status: 'Completed' },
    { id: 3, transactionId: 'TXN-003', customer: 'Emily Davis', items: 1, total: '$149.99', status: 'Pending' },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Checkout
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PointOfSale sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Transactions
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Items</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkoutData.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{transaction.transactionId}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell align="right">{transaction.items}</TableCell>
                      <TableCell align="right">{transaction.total}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={transaction.status === 'Completed' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CheckoutPage;

