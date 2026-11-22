import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Stack,
  Alert,
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Inventory,
  People,
  Badge,
  Security,
  SwapHoriz,
  PointOfSale,
  ExitToApp,
  Schedule,
  History,
} from '@mui/icons-material';

/**
 * Static dashboard preview for the landing hero. Deliberately non-numeric so we do not
 * imply fake business results—only layout and navigation patterns. The hamburger menu
 * actually toggles, so it demonstrates the real (standard, mobile-first) nav pattern
 * rather than just describing it.
 */
const DashboardPreview = () => {
  const [menuOpen, setMenuOpen] = useState(true);

  const stats = [
    { label: 'Total Inventory Items', value: '—', icon: <Inventory />, color: 'primary' },
    { label: 'Active Customers', value: '—', icon: <People />, color: 'success' },
    { label: 'Users', value: '—', icon: <Badge />, color: 'info' },
    { label: "Today's Sales", value: '—', icon: <PointOfSale />, color: 'warning' },
  ];

  const navItems = [
    { label: 'Store Inventory', icon: <Inventory fontSize="small" /> },
    { label: 'Customers', icon: <People fontSize="small" /> },
    { label: 'Checkout', icon: <PointOfSale fontSize="small" /> },
    { label: 'Sales History', icon: <History fontSize="small" /> },
    { label: 'Users', icon: <Badge fontSize="small" /> },
    { label: 'Roles', icon: <Security fontSize="small" /> },
    { label: 'Trade-In', icon: <SwapHoriz fontSize="small" /> },
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
          <Toolbar sx={{ minHeight: 48, px: 1 }}>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
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

        <Collapse in={menuOpen}>
          <List dense disablePadding sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
            {navItems.map((item, index) => (
              <ListItemButton key={index} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { fontSize: '0.8rem', fontWeight: 500 } }}
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
        </Collapse>

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

          <Grid container spacing={1}>
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
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPreview;
