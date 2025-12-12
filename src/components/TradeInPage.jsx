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
  SwapHoriz,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TradeInPage = () => {
  const navigate = useNavigate();

  const tradeInData = [
    { id: 1, customer: 'John Smith', item: 'Used Nintendo Switch', condition: 'Good', offer: '$180.00', status: 'Pending' },
    { id: 2, customer: 'Mike Chen', item: 'Pokémon Card Collection', condition: 'Excellent', offer: '$250.00', status: 'Approved' },
    { id: 3, customer: 'Sarah Johnson', item: 'PS4 Console', condition: 'Fair', offer: '$120.00', status: 'Pending' },
  ];

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

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SwapHoriz sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Trade-in Requests
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Offer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tradeInData.map((tradeIn) => (
                    <TableRow key={tradeIn.id} hover>
                      <TableCell>{tradeIn.customer}</TableCell>
                      <TableCell>{tradeIn.item}</TableCell>
                      <TableCell>{tradeIn.condition}</TableCell>
                      <TableCell align="right">{tradeIn.offer}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={tradeIn.status}
                          size="small"
                          color={tradeIn.status === 'Approved' ? 'success' : 'warning'}
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

export default TradeInPage;

