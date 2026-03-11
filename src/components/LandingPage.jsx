import { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Inventory,
  PointOfSale,
  Analytics,
  People,
  Security,
  Speed,
  Dashboard as DashboardIcon,
  Store,
  SwapHoriz,
  History,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CONTACT_EMAIL = 'contact@retrostoremanager.com';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);

  const scrollTo = (ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Inventory sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Inventory Management',
      description: 'Track your video games and TCG inventory in real-time with automated alerts and smart restocking.',
    },
    {
      icon: <PointOfSale sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Point of Sale',
      description: 'Streamlined checkout process with support for multiple payment methods and receipt generation.',
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Analytics & Reports',
      description: 'Comprehensive insights into sales, inventory turnover, and customer behavior to drive decisions.',
    },
    {
      icon: <People sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Customer Management',
      description: 'Build lasting relationships with customer profiles, purchase history, and loyalty programs.',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with regular backups and data encryption to protect your business.',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Fast & Efficient',
      description: 'Lightning-fast performance that keeps your store running smoothly, even during peak hours.',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            RetroStore Manager
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" sx={{ display: { xs: 'none', sm: 'block' } }} onClick={() => scrollTo(featuresRef)}>
              Features
            </Button>
            <Button color="inherit" sx={{ display: { xs: 'none', sm: 'block' } }} onClick={() => scrollTo(pricingRef)}>
              Pricing
            </Button>
            <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700, mb: 3 }}
              >
                Complete Store Management
                <br />
                <Box component="span" sx={{ color: '#ffd700' }}>
                  All in One Place
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
              >
                Streamline your video game and TCG store operations with our
                comprehensive platform. Manage inventory, sales, customers, and
                analytics from a single, intuitive dashboard.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => scrollTo(featuresRef)}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  See Features
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: { xs: 300, md: 400 },
                }}
              >
                {/* Dashboard Mockup - CSS only, no external images */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    bgcolor: 'background.paper',
                  }}
                >
                  {/* Mock app bar */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    <Store sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      RetroStore Manager
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', minHeight: 280 }}>
                    {/* Mock sidebar */}
                    <Box
                      sx={{
                        width: 56,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        py: 1.5,
                        gap: 0.5,
                      }}
                    >
                      <DashboardIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                      <Inventory sx={{ fontSize: 22, color: 'grey.500' }} />
                      <People sx={{ fontSize: 22, color: 'grey.500' }} />
                      <SwapHoriz sx={{ fontSize: 22, color: 'grey.500' }} />
                      <History sx={{ fontSize: 22, color: 'grey.500' }} />
                    </Box>
                    {/* Mock main content */}
                    <Box sx={{ flex: 1, p: 2 }}>
                      <Typography variant="caption" sx={{ color: 'grey.500', fontWeight: 600, mb: 1, display: 'block' }}>
                        Dashboard
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {[
                          { label: 'Inventory', value: '1,247', color: '#1976d2' },
                          { label: 'Customers', value: '892', color: '#2e7d32' },
                          { label: "Today's Sales", value: '$2.4k', color: '#ed6c02' },
                        ].map((stat, i) => (
                          <Grid item xs={4} key={i}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                bgcolor: 'grey.50',
                                border: '1px solid',
                                borderColor: 'grey.200',
                              }}
                            >
                              <Typography variant="caption" sx={{ color: 'grey.600', display: 'block' }}>
                                {stat.label}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: stat.color }}>
                                {stat.value}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      <Box
                        sx={{
                          border: '1px solid',
                          borderColor: 'grey.200',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#27ca40' }} />
                        </Box>
                        {[
                          ['The Legend of Zelda', 'Video Game', '12', '$49.99'],
                          ['Pokémon Scarlet', 'Video Game', '8', '$59.99'],
                          ['Magic: The Gathering Booster', 'TCG', '24', '$4.99'],
                        ].map((row, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: 'flex',
                              fontSize: '10px',
                              py: 0.5,
                              px: 1,
                              borderBottom: i < 2 ? '1px solid' : 'none',
                              borderColor: 'grey.100',
                              '& > *': { flex: 1 },
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{row[0]}</span>
                            <span style={{ color: '#666' }}>{row[1]}</span>
                            <span>{row[2]}</span>
                            <span style={{ color: '#2e7d32', fontWeight: 600 }}>{row[3]}</span>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container ref={featuresRef} maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Everything You Need to Run Your Store
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Powerful features designed specifically for video game and TCG retailers
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box ref={pricingRef} sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Start free. Scale as you grow. No hidden fees.
            </Typography>
          </Box>

          <Grid container justifyContent="center" spacing={4}>
            <Grid item xs={12} md={6} lg={4}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  RECOMMENDED
                </Box>
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mt: 2 }}>
                    Pro
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="span" variant="h3" sx={{ fontWeight: 700 }}>
                      $49
                    </Typography>
                    <Typography component="span" color="text.secondary">
                      /month
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Everything you need to run your store. Unlimited inventory, customers, and users.
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
                    {['Unlimited inventory items', 'Unlimited customers', 'Point of sale & checkout', 'Sales history & analytics', 'Trade-in management', 'Multi-user support', 'Email support'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>✓</Typography>
                        </Box>
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/signup')}
                    sx={{ py: 1.5, fontWeight: 600 }}
                  >
                    Start Free Trial
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    14-day free trial • No credit card required
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Ready to Transform Your Store?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join store owners who are already streamlining their operations
            with RetroStore Manager. Start your free trial today — no credit card required.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              component="a"
              href={`mailto:${CONTACT_EMAIL}?subject=RetroStore Manager - Sales Inquiry`}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Contact Sales
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 700 }}>
                RetroStore Manager
              </Typography>
              <Typography variant="body2">
                Complete store management solution for video game and TCG retailers.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={3} justifyContent={{ md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={() => scrollTo(featuresRef)}
                  sx={{
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    color: 'inherit',
                    p: 0,
                    font: 'inherit',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Features
                </Typography>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={() => scrollTo(pricingRef)}
                  sx={{
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    color: 'inherit',
                    p: 0,
                    font: 'inherit',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Pricing
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={`mailto:${CONTACT_EMAIL}`}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Contact
                </Typography>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={() => navigate('/signup')}
                  sx={{
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    color: 'inherit',
                    p: 0,
                    font: 'inherit',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Sign Up
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'grey.800', textAlign: 'center' }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} RetroStore Manager. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
