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
} from '@mui/material';
import {
  Inventory,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InventoryPage = () => {
  const navigate = useNavigate();

  const inventoryData = [
    { id: 1, name: 'Pokémon Booster Box', category: 'TCG', quantity: 12, price: '$149.99' },
    { id: 2, name: 'Magic: The Gathering Set', category: 'TCG', quantity: 8, price: '$99.99' },
    { id: 3, name: 'Nintendo Switch Console', category: 'Video Games', quantity: 5, price: '$299.99' },
    { id: 4, name: 'PlayStation 5', category: 'Video Games', quantity: 3, price: '$499.99' },
    { id: 5, name: 'Yu-Gi-Oh! Structure Deck', category: 'TCG', quantity: 20, price: '$24.99' },
    { id: 6, name: 'Xbox Series X', category: 'Video Games', quantity: 2, price: '$499.99' },
  ];

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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Inventory sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Inventory Items
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip label={item.category} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.price}</TableCell>
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

export default InventoryPage;

