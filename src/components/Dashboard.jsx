import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  AppBar,
  Toolbar,
  Button,
  Stack,
  Alert,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Inventory,
  People,
  Badge,
  Security,
  SwapHoriz,
  PointOfSale,
  ExitToApp,
  ArrowForward,
  History,
  CreditCard,
  Schedule,
  Store,
  WorkspacePremium,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetInventoryQuery } from '../store/inventoryApi';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useFormatting } from '../contexts/FormattingContext';
import { getCompanyProfile } from '../services/profileApi';
import { getTrialStatus } from '../services/billingApi';
import { getUsers } from '../services/usersApi';
import { getCustomers } from '../services/customersApi';
import { getSalesByDateRange } from '../services/salesApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: inventory = [], isLoading: inventoryLoading } = useGetInventoryQuery(undefined, { pollingInterval: 60000 });
  const { auth, logout, isAuthenticated, getAuthHeaders } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { formatNumber, locale, timezone } = useFormatting();
  const [trialStatus, setTrialStatus] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [customerCount, setCustomerCount] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [todaySalesTotal, setTodaySalesTotal] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated || !getAuthHeaders().Authorization) return;
    const loadProfile = async () => {
      try {
        const result = await getCompanyProfile(getAuthHeaders());
        setCompanyName(result.data?.profile?.companyName || '');
      } catch {
        setCompanyName('');
      }
    };
    loadProfile();
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (!isAuthenticated || !getAuthHeaders().Authorization) return;
    const loadTrialStatus = async () => {
      try {
        const result = await getTrialStatus(getAuthHeaders());
        setTrialStatus(result.data || null);
      } catch {
        setTrialStatus(null);
      }
    };
    loadTrialStatus();
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (!isAuthenticated || !getAuthHeaders().Authorization) return;
    const loadUserCount = async () => {
      try {
        const result = await getUsers(getAuthHeaders());
        const users = result.data || [];
        const activeCount = users.filter((u) => u.status === 'active').length;
        setUserCount(activeCount);
      } catch {
        setUserCount(null);
      }
    };
    loadUserCount();
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (location.pathname !== '/dashboard') return;
    if (!isAuthenticated || !getAuthHeaders().Authorization) return;
    const loadCustomerCount = async () => {
      setCustomerLoading(true);
      try {
        const result = await getCustomers(getAuthHeaders());
        setCustomerCount((result.data || []).length);
        setErrors((prev) => ({ ...prev, customers: null }));
      } catch (err) {
        setCustomerCount(null);
        setErrors((prev) => ({ ...prev, customers: err.message || 'Failed to load customers' }));
      } finally {
        setCustomerLoading(false);
      }
    };
    loadCustomerCount();
  }, [location.pathname, isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (location.pathname !== '/dashboard') return;
    if (!isAuthenticated || !getAuthHeaders().Authorization) return;
    if (permissionsLoading || !hasPermission('sales.view')) return;

    const run = async () => {
      setSalesLoading(true);
      try {
        const headers = getAuthHeaders();
        const now = new Date();
        const rangeStart = new Date(now.getTime() - 72 * 60 * 60 * 1000);
        const rangeEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const result = await getSalesByDateRange(
          rangeStart.toISOString(),
          rangeEnd.toISOString(),
          headers
        );
        if (!result.success) {
          throw new Error(result.message || 'Failed to load sales');
        }
        const list = Array.isArray(result.data) ? result.data : [];
        const todayKey = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(now);
        const todays = list.filter((s) => {
          if (s.saleDate == null) return false;
          const key = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(s.saleDate));
          return key === todayKey;
        });
        const total = todays.reduce((sum, s) => sum + Number(s.total ?? 0), 0);
        setTodaySalesTotal(total);
        const sorted = [...list].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        setRecentSales(sorted.slice(0, 5));
        setErrors((prev) => ({ ...prev, sales: null }));
      } catch (err) {
        setTodaySalesTotal(null);
        setRecentSales([]);
        setErrors((prev) => ({ ...prev, sales: err.message || 'Failed to load sales' }));
      } finally {
        setSalesLoading(false);
      }
    };

    run();
  }, [location.pathname, isAuthenticated, getAuthHeaders, permissionsLoading, hasPermission, timezone]);

  const todaySalesDisplay =
    todaySalesTotal != null
      ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(todaySalesTotal)
      : '—';

  const handleSignOut = () => {
    const slug = auth?.slug;
    logout();
    navigate(slug ? `/${slug}` : '/');
  };

  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  void totalQuantity;

  const statsConfig = [
    {
      label: 'Total Inventory Items',
      value: formatNumber(inventory.length),
      loading: inventoryLoading,
      icon: <Inventory />,
      color: 'primary',
      permission: 'inventory.view',
    },
    {
      label: 'Customers',
      value: customerCount != null ? formatNumber(customerCount) : '—',
      loading: customerLoading,
      icon: <People />,
      color: 'success',
      permission: 'customers.view',
    },
    {
      label: 'Users',
      value: userCount != null ? String(userCount) : '—',
      loading: false,
      icon: <Badge />,
      color: 'info',
      permission: 'users.view',
    },
    {
      label: "Today's Sales",
      value: todaySalesDisplay,
      loading: salesLoading,
      icon: <PointOfSale />,
      color: 'warning',
      permission: 'sales.view',
    },
  ].filter((s) => !s.permission || permissionsLoading || hasPermission(s.permission));

  const sections = [
    { title: 'Store Inventory', description: 'View and manage your store inventory items', icon: <Inventory sx={{ fontSize: 48 }} />, color: 'primary', route: '/dashboard/inventory', permission: 'inventory.view' },
    { title: 'Customers', description: 'Manage customer information and purchase history', icon: <People sx={{ fontSize: 48 }} />, color: 'success', route: '/dashboard/customers', permission: 'customers.view' },
    { title: 'Users', description: 'View and manage user accounts and roles', icon: <Badge sx={{ fontSize: 48 }} />, color: 'info', route: '/dashboard/users', permission: 'users.view' },
    { title: 'Roles', description: 'View roles and permissions', icon: <Security sx={{ fontSize: 48 }} />, color: 'secondary', route: '/dashboard/roles', permission: 'users.view' },
    { title: 'Trade-in', description: 'Process trade-in requests and offers', icon: <SwapHoriz sx={{ fontSize: 48 }} />, color: 'warning', route: '/dashboard/trade-in', permission: 'inventory.create' },
    { title: 'Checkout', description: 'Process new customer transactions and checkout', icon: <PointOfSale sx={{ fontSize: 48 }} />, color: 'secondary', route: '/dashboard/checkout', permission: 'sales.create' },
    { title: 'Historical Sales Records', description: 'View transaction history and sales records', icon: <History sx={{ fontSize: 48 }} />, color: 'primary', route: '/dashboard/sales-history', permission: 'sales.view' },
    { title: 'Company Profile', description: 'Configure store information, locations, and settings', icon: <Store sx={{ fontSize: 48 }} />, color: 'info', route: '/dashboard/profile', permission: 'settings.manage' },
    { title: 'Subscription', description: 'View subscription tier, billing cycle, and usage limits', icon: <WorkspacePremium sx={{ fontSize: 48 }} />, color: 'success', route: '/dashboard/subscription', permission: 'billing.view' },
    { title: 'Billing & Payment', description: 'Manage payment methods for your subscription', icon: <CreditCard sx={{ fontSize: 48 }} />, color: 'success', route: '/dashboard/billing', permission: 'billing.view' },
  ].filter((s) => permissionsLoading || hasPermission(s.permission));

  const activeErrors = Object.values(errors).filter(Boolean);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {companyName ? `${companyName} Dashboard` : 'Dashboard'}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" startIcon={<ExitToApp />} onClick={handleSignOut}>
              Sign Out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {(trialStatus?.isInTrial || trialStatus?.accessRestricted) && (
          <Alert
            severity={trialStatus.accessRestricted || (trialStatus.daysRemaining <= 7 && !trialStatus.hasPaymentMethod) ? 'warning' : 'info'}
            icon={<Schedule />}
            sx={{ mb: 3 }}
            action={
              (trialStatus.accessRestricted || (trialStatus.daysRemaining <= 7 && !trialStatus.hasPaymentMethod)) ? (
                <Button color="inherit" size="small" onClick={() => navigate('/dashboard/billing')}>
                  Add payment method
                </Button>
              ) : null
            }
          >
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Typography variant="body1">
                {trialStatus.accessRestricted
                  ? 'Your free trial has ended. Add a payment method to continue.'
                  : trialStatus.daysRemaining > 0
                    ? `${trialStatus.daysRemaining} day${trialStatus.daysRemaining === 1 ? '' : 's'} remaining in your free trial`
                    : 'Your free trial has ended'}
              </Typography>
              <Chip label="Free Trial" size="small" color="info" variant="outlined" />
              {(trialStatus.accessRestricted || (trialStatus.daysRemaining <= 7 && !trialStatus.hasPaymentMethod)) && (
                <Typography variant="body2">
                  Add a payment method to ensure your subscription continues.
                </Typography>
              )}
            </Stack>
          </Alert>
        )}

        {activeErrors.map((msg, i) => (
          <Alert key={i} severity="error" sx={{ mb: 2 }}>
            {msg}
          </Alert>
        ))}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsConfig.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${stat.color}.light`,
                        color: `${stat.color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      {stat.loading ? (
                        <>
                          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1, mb: 0.5 }} />
                          <Skeleton variant="text" width={120} />
                        </>
                      ) : (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {(!permissionsLoading && hasPermission('sales.view')) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Sales
            </Typography>
            <TableContainer component={Paper} elevation={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                      </TableRow>
                    ))
                  ) : recentSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No recent sales found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentSales.map((sale) => (
                      <TableRow key={sale.id ?? sale.saleId}>
                        <TableCell>
                          {sale.saleDate
                            ? new Intl.DateTimeFormat(locale, {
                                timeZone: timezone,
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }).format(new Date(sale.saleDate))
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {sale.customerName ||
                            (sale.customer
                              ? `${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim()
                              : sale.customerId
                                ? `Customer #${sale.customerId}`
                                : 'Walk-in')}
                        </TableCell>
                        <TableCell align="right">
                          {sale.total != null
                            ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(Number(sale.total))
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Manage Your Store
        </Typography>
        <Grid container spacing={3}>
          {sections.map((section, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(section.route)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: `${section.color}.light`,
                          color: `${section.color}.main`,
                          mb: 2,
                        }}
                      >
                        {section.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {section.description}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: `${section.color}.main`,
                          fontWeight: 600,
                        }}
                      >
                        <Typography variant="body2" sx={{ mr: 0.5 }}>
                          View Details
                        </Typography>
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
