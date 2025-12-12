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
  History,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SalesHistoryPage = () => {
  const navigate = useNavigate();

  const salesData = [
    { id: 1, transactionId: 'TXN-001', customer: 'John Smith', items: 3, total: '$349.97', date: '2024-01-15', status: 'Completed' },
    { id: 2, transactionId: 'TXN-002', customer: 'Mike Chen', items: 2, total: '$199.98', date: '2024-01-14', status: 'Completed' },
    { id: 3, transactionId: 'TXN-003', customer: 'Emily Davis', items: 1, total: '$149.99', date: '2024-01-13', status: 'Completed' },
    { id: 4, transactionId: 'TXN-004', customer: 'Sarah Johnson', items: 4, total: '$499.96', date: '2024-01-12', status: 'Completed' },
    { id: 5, transactionId: 'TXN-005', customer: 'David Wilson', items: 2, total: '$299.98', date: '2024-01-11', status: 'Completed' },
    { id: 6, transactionId: 'TXN-006', customer: 'John Smith', items: 1, total: '$89.99', date: '2024-01-10', status: 'Completed' },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Historical Sales Records
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <History sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Sales History
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Items</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesData.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{transaction.transactionId}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
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

export default SalesHistoryPage;

