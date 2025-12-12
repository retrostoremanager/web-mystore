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
  IconButton,
} from '@mui/material';
import {
  People,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CustomersPage = () => {
  const navigate = useNavigate();

  const customersData = [
    { id: 1, name: 'John Smith', email: 'john.smith@email.com', totalPurchases: 15, totalSpent: '$1,245.00' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', totalPurchases: 8, totalSpent: '$567.50' },
    { id: 3, name: 'Mike Chen', email: 'mike.chen@email.com', totalPurchases: 22, totalSpent: '$2,100.00' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@email.com', totalPurchases: 5, totalSpent: '$389.99' },
    { id: 5, name: 'David Wilson', email: 'david.w@email.com', totalPurchases: 12, totalSpent: '$890.25' },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Customers
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <People sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Customer List
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total Purchases</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customersData.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell align="right">{customer.totalPurchases}</TableCell>
                      <TableCell align="right">{customer.totalSpent}</TableCell>
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

export default CustomersPage;

