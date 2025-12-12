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
} from '@mui/material';
import {
  Inventory,
  People,
  Badge,
  SwapHoriz,
  PointOfSale,
  ExitToApp,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Inventory Items', value: '1,234', icon: <Inventory />, color: 'primary' },
    { label: 'Active Customers', value: '156', icon: <People />, color: 'success' },
    { label: 'Employees', value: '4', icon: <Badge />, color: 'info' },
    { label: 'Today\'s Sales', value: '$2,450.00', icon: <PointOfSale />, color: 'warning' },
  ];

  const sections = [
    {
      title: 'Store Inventory',
      description: 'View and manage your store inventory items',
      icon: <Inventory sx={{ fontSize: 48 }} />,
      color: 'primary',
      route: '/dashboard/inventory',
    },
    {
      title: 'Customers',
      description: 'Manage customer information and purchase history',
      icon: <People sx={{ fontSize: 48 }} />,
      color: 'success',
      route: '/dashboard/customers',
    },
    {
      title: 'Employees',
      description: 'View and manage employee information',
      icon: <Badge sx={{ fontSize: 48 }} />,
      color: 'info',
      route: '/dashboard/employees',
    },
    {
      title: 'Trade-in',
      description: 'Process trade-in requests and offers',
      icon: <SwapHoriz sx={{ fontSize: 48 }} />,
      color: 'warning',
      route: '/dashboard/trade-in',
    },
    {
      title: 'Checkout',
      description: 'View transaction history and checkout records',
      icon: <PointOfSale sx={{ fontSize: 48 }} />,
      color: 'secondary',
      route: '/dashboard/checkout',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            MyStore Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" startIcon={<ExitToApp />} onClick={() => navigate('/')}>
              Sign Out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
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
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section Cards */}
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

