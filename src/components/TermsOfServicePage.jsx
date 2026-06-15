import { Box, Container, Typography, AppBar, Toolbar, Button, Link as MuiLink, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'contact@retrostoremanager.com';

/**
 * Starter terms for marketing and sign-up flows. Have counsel review before heavy promotion.
 */
const TermsOfServicePage = () => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} color="default">
        <Toolbar>
          <Button component={Link} to="/" color="inherit">
            ← Home
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Terms of Service
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
              Agreement
            </Typography>
            <Typography variant="body1" color="text.secondary">
              By creating an account or using RetroStore Manager (&quot;Service&quot;), you agree to these terms. If you
              use the Service on behalf of a business, you represent that you have authority to bind that business.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              The Service
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We provide software on a subscription basis. Features may change as we improve the product. We strive for
              high availability but do not guarantee uninterrupted access. Scheduled maintenance or events outside our
              control may affect the Service.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Your responsibilities
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Keep account credentials confidential and manage staff access appropriately</li>
                <li>Ensure your use complies with applicable laws (including sales tax and customer records where you operate)</li>
                <li>Maintain backups or exports of business-critical data if your operations require them</li>
                <li>Pay fees according to your selected plan and trial/subscription terms presented at checkout</li>
              </Box>
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Fees and trials
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Subscription fees and trial terms are shown when you sign up. Non-payment or trial expiration may limit or
              suspend access as described in-product. Card payments are processed by Stripe under their terms and your
              issuer&apos;s rules.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Disclaimer and liability limit
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The Service is provided &quot;as is&quot; to the maximum extent permitted by law. We are not liable for
              indirect or consequential damages. Our total liability for claims relating to the Service in a twelve-month
              period is limited to amounts you paid us for the Service in that period (or, if none, one hundred U.S.
              dollars). Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to
              the fullest extent allowed.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Termination
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You may stop using the Service or close your account according to in-product flows when available. We may
              suspend or terminate access for material breach, legal requirements, or abuse. Provisions that by their
              nature should survive will survive termination.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Questions:{' '}
              <MuiLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</MuiLink>.
            </Typography>
          </section>

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            This page is a practical starting point, not legal advice. Review with qualified counsel for your
            jurisdictions and liability needs.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default TermsOfServicePage;
