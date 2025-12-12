import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from './contexts/InventoryContext';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AccountWizard from './components/AccountWizard';
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
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<AccountWizard />} />
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
            </Routes>
          </Router>
        </InventoryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

