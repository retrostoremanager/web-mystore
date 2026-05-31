import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TrialStatusProvider } from './contexts/TrialStatusContext';
import { FormattingProvider } from './contexts/FormattingContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRedirect from './components/AuthRedirect';
import LandingPage from './components/LandingPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import CompanyLandingPage from './components/CompanyLandingPage';
import CompanyLoginPage from './components/CompanyLoginPage';
import CompanyCustomerPage from './components/CompanyCustomerPage';
import SignUpForm from './components/SignUpForm';
import VerifyEmailPage from './components/VerifyEmailPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import SetPasswordPage from './components/SetPasswordPage';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/InventoryPage';
import AddInventoryItem from './components/AddInventoryItem';
import InventoryItemDetail from './components/InventoryItemDetail';
import BulkImportInventory from './components/BulkImportInventory';
import CustomersPage from './components/CustomersPage';
import UsersPage from './components/UsersPage';
import RolesPage from './components/RolesPage';
import TradeInPage from './components/TradeInPage';
import CheckoutPage from './components/CheckoutPage';
import SalesHistoryPage from './components/SalesHistoryPage';
import BillingSettingsPage from './components/BillingSettingsPage';
import SubscriptionPage from './components/SubscriptionPage';
import CompanyProfilePage from './components/CompanyProfilePage';
import AccountSuspendedPage from './components/AccountSuspendedPage';
import TrialExpiredPrompt from './components/TrialExpiredPrompt';
import PermissionRoute from './components/PermissionRoute';
import ConsignmentPage from './components/ConsignmentPage';
import LoyaltySettingsPage from './components/LoyaltySettingsPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TrialStatusProvider>
          <FormattingProvider>
          <PermissionsProvider>
          <Router>
            <AuthRedirect>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/set-password" element={<SetPasswordPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/inventory" element={<PermissionRoute permission="inventory.view" element={<InventoryPage />} />} />
              <Route path="/dashboard/inventory/add" element={<PermissionRoute permission="inventory.create" element={<AddInventoryItem />} />} />
              <Route path="/dashboard/inventory/bulk-import" element={<PermissionRoute permission="inventory.create" element={<BulkImportInventory />} />} />
              <Route path="/dashboard/inventory/:id" element={<PermissionRoute permission="inventory.view" element={<InventoryItemDetail />} />} />
              <Route path="/dashboard/customers" element={<PermissionRoute permission="customers.view" element={<CustomersPage />} />} />
              <Route path="/dashboard/users" element={<PermissionRoute permission="users.view" element={<UsersPage />} />} />
              <Route path="/dashboard/roles" element={<PermissionRoute permission="users.view" element={<RolesPage />} />} />
              <Route path="/dashboard/trade-in" element={<PermissionRoute permission="trade_in.view" element={<TradeInPage />} />} />
              <Route path="/trade-ins" element={<PermissionRoute permission="trade_in.view" element={<TradeInPage />} />} />
              <Route path="/dashboard/checkout" element={<PermissionRoute permission="sales.create" element={<CheckoutPage />} />} />
              <Route path="/dashboard/sales-history" element={<PermissionRoute permission="sales.view" element={<SalesHistoryPage />} />} />
              <Route path="/dashboard/consignment" element={<PermissionRoute permission="consignment.view" element={<ConsignmentPage />} />} />
              <Route path="/dashboard/billing" element={<PermissionRoute permission="billing.view" element={<BillingSettingsPage />} />} />
              <Route path="/dashboard/subscription" element={<PermissionRoute permission="billing.view" element={<SubscriptionPage />} />} />
              <Route path="/dashboard/profile" element={<PermissionRoute permission="settings.manage" element={<CompanyProfilePage />} />} />
              <Route path="/settings/billing" element={<PermissionRoute permission="billing.view" element={<BillingSettingsPage />} />} />
              <Route path="/settings/loyalty" element={<PermissionRoute permission="loyalty.manage" element={<LoyaltySettingsPage />} />} />
              {/* Company store routes - must be last so system routes take precedence */}
              <Route path="/:slug/login" element={<CompanyLoginPage />} />
              <Route path="/:slug/customer" element={<CompanyCustomerPage />} />
              <Route path="/:slug" element={<CompanyLandingPage />} />
            </Routes>
            </AuthRedirect>
          </Router>
          </PermissionsProvider>
          </FormattingProvider>
          </TrialStatusProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

