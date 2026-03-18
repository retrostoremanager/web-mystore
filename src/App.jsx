import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TrialStatusProvider } from './contexts/TrialStatusContext';
import { FormattingProvider } from './contexts/FormattingContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRedirect from './components/AuthRedirect';
import LandingPage from './components/LandingPage';
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TrialStatusProvider>
          <FormattingProvider>
          <Router>
            <AuthRedirect>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/c/:slug/login" element={<CompanyLoginPage />} />
              <Route path="/c/:slug/customer" element={<CompanyCustomerPage />} />
              <Route path="/c/:slug" element={<CompanyLandingPage />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/set-password" element={<SetPasswordPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/inventory" element={<InventoryPage />} />
              <Route path="/dashboard/inventory/add" element={<AddInventoryItem />} />
              <Route path="/dashboard/inventory/bulk-import" element={<BulkImportInventory />} />
              <Route path="/dashboard/inventory/:id" element={<InventoryItemDetail />} />
              <Route path="/dashboard/customers" element={<CustomersPage />} />
              <Route path="/dashboard/users" element={<UsersPage />} />
              <Route path="/dashboard/roles" element={<RolesPage />} />
              <Route path="/dashboard/trade-in" element={<TradeInPage />} />
              <Route path="/dashboard/checkout" element={<CheckoutPage />} />
              <Route path="/dashboard/sales-history" element={<SalesHistoryPage />} />
              <Route path="/dashboard/billing" element={<BillingSettingsPage />} />
              <Route path="/dashboard/subscription" element={<SubscriptionPage />} />
              <Route path="/dashboard/profile" element={<CompanyProfilePage />} />
            </Routes>
            </AuthRedirect>
          </Router>
          </FormattingProvider>
          </TrialStatusProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

