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
  History,
  People,
  Groups,
  CreditCard,
  Security,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import DashboardPreview from './DashboardPreview';

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
      title: 'Inventory',
      description:
        'Track stock by location with optional IGDB-backed game metadata, condition, and pricing. Categories work for TCG and other products.',
    },
    {
      icon: <PointOfSale sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'In-store checkout',
      description:
        'Ring up sales tied to customers, add tax, record how they paid, and print a simple receipt. Inventory updates when you complete the sale.',
    },
    {
      icon: <History sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Sales history',
      description:
        'Review past transactions and see today\'s sales on your dashboard—the operational basics while richer reporting is on the roadmap.',
    },
    {
      icon: <People sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Customers',
      description:
        'Keep customer records and connect purchases to profiles so you can see who bought what over time.',
    },
    {
      icon: <Groups sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Staff & roles',
      description:
        'Invite your team with role-based permissions—owners, managers, employees, and cashier-friendly access out of the box.',
    },
    {
      icon: <CreditCard sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Subscriptions & billing',
      description:
        'Self-serve plans and subscription billing through Stripe, including trial periods and saved payment methods.',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Sign-in & access control',
      description:
        'Email verification, per-company sign-in links, and permissions so each employee only sees what they need.',
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
                Complete operations software
                <br />
                <Box component="span" sx={{ color: 'warning.light' }}>
                  for game & hobby shops
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
              >
                Run inventory, in-store checkout, customers, and staff access from one dashboard—built for retro games,
                trading cards, and collectibles. We ship what works today and say clearly what is still on the way.
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
                      bgcolor: 'grey.100',
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
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                Returning user? Use the link from your company to sign in.
              </Typography>
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
                <DashboardPreview />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container ref={featuresRef} maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Everything You Need Today
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Inventory through billing—described the way your team will actually use it
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

      <Box sx={{ bgcolor: 'grey.100', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
            On the roadmap
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center', mb: 2 }}
          >
            We ship the daily workflows first, then expand. Coming next:
          </Typography>
          <Box
            component="ul"
            sx={{
              maxWidth: 520,
              mx: 'auto',
              color: 'text.secondary',
              '& li': { mb: 1 },
            }}
          >
            <li>Trade-in flows with market pricing integrations</li>
            <li>Customer loyalty sign-in and rewards</li>
            <li>Richer analytics, exports, and retail reporting</li>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box ref={pricingRef} sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 12 }, scrollMarginTop: 80 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Scale as you grow. No hidden fees.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" alignItems="stretch">
            {[
              {
                name: 'Basic',
                price: 99.99,
                locations: '1 location',
                description: 'Perfect for single-store operations.',
                recommended: false,
              },
              {
                name: 'Pro',
                price: 149.99,
                locations: 'Up to 3 locations',
                description: 'Ideal for growing retailers with multiple stores.',
                recommended: true,
              },
              {
                name: 'Enterprise',
                price: 199.99,
                locations: 'Unlimited locations',
                description: 'For retail chains and enterprise operations.',
                recommended: false,
              },
            ].map((tier) => (
              <Grid item xs={12} sm={6} md={4} key={tier.name}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: tier.recommended ? '2px solid' : '1px solid',
                    borderColor: tier.recommended ? 'primary.main' : 'grey.200',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {tier.recommended && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        py: 0.75,
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}
                    >
                      RECOMMENDED
                    </Box>
                  )}
                  <CardContent
                    sx={{
                      p: { xs: 3, md: 4 },
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      pt: tier.recommended ? { xs: 4, md: 5 } : undefined,
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {tier.name}
                    </Typography>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ${tier.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-end', pb: 0.5 }}>
                        /month
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 1,
                      }}
                    >
                      {tier.locations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {tier.description}
                    </Typography>
                    <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
                      {[
                        'Inventory with IGDB-backed game search',
                        'In-store checkout & sales history',
                        'Customer records tied to purchases',
                        'Multi-location company profile',
                        'Team access with role permissions',
                        'Stripe subscriptions & trial billing',
                        'Email support',
                      ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              minWidth: 20,
                              borderRadius: '50%',
                              bgcolor: 'success.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>
                              ✓
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button
                      variant={tier.recommended ? 'contained' : 'outlined'}
                      size="large"
                      fullWidth
                      onClick={() => navigate('/signup')}
                      sx={{ py: 1.5, fontWeight: 600 }}
                    >
                      Start Free Trial
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                      30-day free trial • Payment method at signup; you are not charged until the trial ends
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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
            Ready to simplify daily store ops?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Start a 30-day trial with your team, connect billing when you sign up, and put checkout and inventory on one
            system. Questions? We are happy to help.
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
                  bgcolor: 'grey.100',
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
                Inventory, checkout, and team access for independent game and hobby retailers—described honestly, improved
                continuously.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={3} justifyContent={{ md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={() => scrollTo(featuresRef)}
                  sx={(theme) => ({
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    color: 'inherit',
                    p: 0,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    '&:hover': { color: 'white' },
                  })}
                >
                  Features
                </Typography>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={() => scrollTo(pricingRef)}
                  sx={(theme) => ({
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    color: 'inherit',
                    p: 0,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    '&:hover': { color: 'white' },
                  })}
                >
                  Pricing
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={`mailto:${CONTACT_EMAIL}`}
                  sx={(theme) => ({
                    color: 'inherit',
                    textDecoration: 'none',
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    '&:hover': { color: 'white' },
                  })}
                >
                  Contact
                </Typography>
                <Typography
                  variant="body2"
                  component={Link}
                  to="/privacy"
                  sx={(theme) => ({
                    color: 'inherit',
                    textDecoration: 'none',
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    '&:hover': { color: 'white' },
                  })}
                >
                  Privacy
                </Typography>
                <Typography
                  variant="body2"
                  component={Link}
                  to="/terms"
                  sx={(theme) => ({
                    color: 'inherit',
                    textDecoration: 'none',
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    '&:hover': { color: 'white' },
                  })}
                >
                  Terms
                </Typography>
                <Typography
                  variant="body2"
                  component={Link}
                  to="/signup"
                  sx={(theme) => ({
                    color: 'inherit',
                    textDecoration: 'none',
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    '&:hover': { color: 'white' },
                  })}
                >
                  Sign up
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
