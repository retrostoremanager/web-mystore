import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from './contexts/InventoryContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRedirect from './components/AuthRedirect';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpForm from './components/SignUpForm';
import VerifyEmailPage from './components/VerifyEmailPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/InventoryPage';
import AddInventoryItem from './components/AddInventoryItem';
import InventoryItemDetail from './components/InventoryItemDetail';
import BulkImportInventory from './components/BulkImportInventory';
import CustomersPage from './components/CustomersPage';
import EmployeesPage from './components/EmployeesPage';
import TradeInPage from './components/TradeInPage';
import CheckoutPage from './components/CheckoutPage';
import SalesHistoryPage from './components/SalesHistoryPage';
import BillingSettingsPage from './components/BillingSettingsPage';

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
        <InventoryProvider>
          <Router>
            <AuthRedirect>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/inventory" element={<InventoryPage />} />
              <Route path="/dashboard/inventory/add" element={<AddInventoryItem />} />
              <Route path="/dashboard/inventory/bulk-import" element={<BulkImportInventory />} />
              <Route path="/dashboard/inventory/:id" element={<InventoryItemDetail />} />
              <Route path="/dashboard/customers" element={<CustomersPage />} />
              <Route path="/dashboard/employees" element={<EmployeesPage />} />
              <Route path="/dashboard/trade-in" element={<TradeInPage />} />
              <Route path="/dashboard/checkout" element={<CheckoutPage />} />
              <Route path="/dashboard/sales-history" element={<SalesHistoryPage />} />
              <Route path="/dashboard/billing" element={<BillingSettingsPage />} />
            </Routes>
            </AuthRedirect>
          </Router>
        </InventoryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

