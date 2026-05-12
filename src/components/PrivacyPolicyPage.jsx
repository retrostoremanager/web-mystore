import { Box, Container, Typography, AppBar, Toolbar, Button, Link as MuiLink, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'contact@retrostoremanager.com';

/**
 * Starter privacy policy for marketing and sign-up flows. Have counsel review before heavy promotion.
 */
const PrivacyPolicyPage = () => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} color="default">
        <Toolbar>
          <Button component={Link} to="/" color="inherit">
            ← Home
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Privacy Policy
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: May 11, 2026
        </Typography>

        <Stack spacing={3}>
          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Who we are
            </Typography>
            <Typography variant="body1" color="text.secondary">
              RetroStore Manager (&quot;we&quot;, &quot;us&quot;) provides cloud software for retail store operations.
              Contact:{' '}
              <MuiLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</MuiLink>.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Information we process
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Account data you provide (name, email, company, credentials)</li>
                <li>Business data you enter (inventory, customers, sales, locations, staff)</li>
                <li>Billing data processed by our payment provider (Stripe), not full card numbers on our servers</li>
                <li>Technical and security logs needed to run and protect the service</li>
              </Box>
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              How we use information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We use this information to provide the service, authenticate users, bill subscriptions, communicate about
              your account, improve reliability and security, and comply with law. We do not sell your personal
              information.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Retention
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We retain data while your account is active and as needed for legal, tax, and dispute purposes. If you
              need data export or deletion, contact us at the email above.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Changes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We may update this policy and will post the revised date here. Material changes may be communicated by
              email or in-app notice where appropriate.
            </Typography>
          </section>

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            This page is a practical starting point, not legal advice. Review with qualified counsel for your
            jurisdictions and use cases.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;
