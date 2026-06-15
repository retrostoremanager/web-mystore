import {
  Box,
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
  Schedule,
  History,
} from '@mui/icons-material';

/**
 * Static dashboard preview for the landing hero. Deliberately non-numeric so we do not
 * imply fake business results—only layout and navigation patterns.
 */
const DashboardPreview = () => {
  const stats = [
    { label: 'Total Inventory Items', value: '—', icon: <Inventory />, color: 'primary' },
    { label: 'Active Customers', value: '—', icon: <People />, color: 'success' },
    { label: 'Users', value: '—', icon: <Badge />, color: 'info' },
    { label: "Today's Sales", value: '—', icon: <PointOfSale />, color: 'warning' },
  ];

  const sections = [
    { title: 'Store Inventory', icon: <Inventory sx={{ fontSize: 32 }} />, color: 'primary' },
    { title: 'Customers', icon: <People sx={{ fontSize: 32 }} />, color: 'success' },
    { title: 'Checkout', icon: <PointOfSale sx={{ fontSize: 32 }} />, color: 'secondary' },
    { title: 'Sales history', icon: <History sx={{ fontSize: 32 }} />, color: 'primary' },
    { title: 'Users', icon: <Badge sx={{ fontSize: 32 }} />, color: 'info' },
    { title: 'Roles', icon: <Security sx={{ fontSize: 32 }} />, color: 'secondary' },
    { title: 'Trade-in', icon: <SwapHoriz sx={{ fontSize: 32 }} />, color: 'warning' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 520 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mb: 1,
          color: 'rgba(255,255,255,0.85)',
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}
      >
        Sample layout — your live numbers appear after sign-in
      </Typography>
      <Box
        sx={{
          width: '100%',
          bgcolor: 'grey.100',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ minHeight: 48, px: 2 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 700, fontSize: '0.95rem' }}>
              Your Store Dashboard
            </Typography>
            <Button
              color="inherit"
              size="small"
              startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
              sx={{ fontSize: '0.75rem' }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 1.5 }}>
          <Alert
            severity="info"
            icon={<Schedule sx={{ fontSize: 20 }} />}
            sx={{ mb: 1.5, py: 0.5, '& .MuiAlert-message': { flex: 1 } }}
          >
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                Trial and billing reminders for your team appear here
              </Typography>
              <Chip
                label="Free Trial"
                size="small"
                color="info"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </Stack>
          </Alert>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Card elevation={1} sx={{ '& .MuiCardContent-root': { py: 1, px: 1.5 } }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: 1,
                          bgcolor: `${stat.color}.light`,
                          color: `${stat.color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.8rem' }}>
            Manage Your Store
          </Typography>
          <Grid container spacing={1}>
            {sections.map((section, index) => (
              <Grid item xs={4} key={index}>
                <Card
                  elevation={1}
                  sx={{
                    '& .MuiCardContent-root': { py: 1, px: 1 },
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardActionArea sx={{ '&.Mui-focusVisible': { backgroundColor: 'transparent' } }}>
                    <CardContent>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: `${section.color}.light`,
                            color: `${section.color}.main`,
                            display: 'inline-flex',
                            mb: 0.5,
                          }}
                        >
                          {section.icon}
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.65rem', display: 'block' }}>
                          {section.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: `${section.color}.main` }}>
                            Open
                          </Typography>
                          <ArrowForward sx={{ fontSize: 12 }} />
                        </Stack>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPreview;
