import { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  History,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../contexts/FormattingContext';
import { getAllSales } from '../services/salesApi';

function saleCustomerLabel(sale) {
  const c = sale.customer;
  if (!c) return '—';
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
  return name || c.email || '—';
}

function formatUsd(locale, amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(n);
}

const SalesHistoryPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { locale, formatDateTime } = useFormatting();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSales = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await getAllSales(headers);
      if (!result.success) {
        throw new Error(result.message || 'Failed to retrieve sales');
      }
      setSales(Array.isArray(result.data) ? result.data : []);
    } catch (e) {
      setError(e.message || 'Failed to load sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sale #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Line items
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Payment
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No sales recorded yet. Complete a checkout to see transactions here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell>{sale.id}</TableCell>
                          <TableCell>{saleCustomerLabel(sale)}</TableCell>
                          <TableCell>
                            {sale.saleDate ? formatDateTime(sale.saleDate) : '—'}
                          </TableCell>
                          <TableCell align="right">{sale.items?.length ?? 0}</TableCell>
                          <TableCell align="right">{formatUsd(locale, sale.total)}</TableCell>
                          <TableCell align="right">
                            <Chip label={sale.paymentMethod || '—'} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SalesHistoryPage;
