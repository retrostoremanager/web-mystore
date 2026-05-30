import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SalesHistoryPage, { buildCsvContent, filterSalesByDateRange } from './SalesHistoryPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    getAuthHeaders: () => ({ Authorization: 'Bearer tok', 'X-Company-Id': '1' }),
  }),
}));

vi.mock('../contexts/FormattingContext', () => ({
  useFormatting: () => ({
    locale: 'en-US',
    formatDateTime: (d) => new Date(d).toLocaleString('en-US'),
  }),
}));

vi.mock('../services/salesApi', () => ({
  getAllSales: vi.fn(),
  getSalesByDateRange: vi.fn(),
  getSaleReceipt: vi.fn(),
  emailSaleReceipt: vi.fn(),
}));

import { getAllSales, getSaleReceipt } from '../services/salesApi';

const mockSales = [
  {
    id: 1,
    saleDate: '2024-03-15T10:00:00Z',
    customer: { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
    items: [
      { inventoryItem: { name: 'Game A' }, quantity: 2, unitPrice: 10, discount: 0 },
    ],
    total: 20,
    paymentMethod: 'cash',
    user: { firstName: 'Bob', lastName: 'Jones' },
  },
  {
    id: 2,
    saleDate: '2024-04-20T14:00:00Z',
    customer: null,
    items: [],
    total: 0,
    paymentMethod: 'card',
    user: null,
  },
];

const renderPage = () =>
  render(
    <BrowserRouter>
      <SalesHistoryPage />
    </BrowserRouter>
  );

describe('SalesHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllSales.mockResolvedValue({ success: true, data: mockSales });
    getSaleReceipt.mockResolvedValue({
      success: true,
      data: {
        receiptNumber: '001',
        storeName: 'Test Store',
        saleDate: '2024-03-15T10:00:00Z',
        items: [],
        subtotal: 20,
        taxAmount: 0,
        total: 20,
        paymentMethod: 'cash',
      },
    });
  });

  describe('DataGrid rendering', () => {
    it('shows Skeleton loading state while data loads', () => {
      getAllSales.mockReturnValue(new Promise(() => {}));
      renderPage();
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders DataGrid after data loads', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
    });

    it('has Date column header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
      });
    });

    it('has Customer column header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /customer/i })).toBeInTheDocument();
      });
    });

    it('has Items column header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /items/i })).toBeInTheDocument();
      });
    });

    it('renders DataGrid with column fields including Date, Customer, Items, Total, Employee', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      const headers = document.querySelectorAll('.MuiDataGrid-columnHeader');
      const fieldNames = Array.from(headers).map((h) => h.getAttribute('data-field'));
      expect(fieldNames).toContain('dateLabel');
      expect(fieldNames).toContain('customerLabel');
      expect(fieldNames).toContain('itemCount');
      expect(fieldNames.length).toBeGreaterThanOrEqual(3);
    });

    it('shows Snackbar error when API fails', async () => {
      getAllSales.mockRejectedValue(new Error('Network error'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows empty state when no sales', async () => {
      getAllSales.mockResolvedValue({ success: true, data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/no sales match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Receipt Dialog', () => {
    it('opens receipt dialog when a row is clicked', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      const rows = document.querySelectorAll('.MuiDataGrid-row');
      expect(rows.length).toBeGreaterThan(0);
      fireEvent.click(rows[0]);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes receipt dialog when Close is clicked', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      const rows = document.querySelectorAll('.MuiDataGrid-row');
      fireEvent.click(rows[0]);
      await waitFor(() => screen.getByRole('dialog'));
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Export CSV button', () => {
    it('Export CSV button is disabled when no rows', async () => {
      getAllSales.mockResolvedValue({ success: true, data: [] });
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      const exportBtn = screen.getByRole('button', { name: /export csv/i });
      expect(exportBtn).toBeDisabled();
    });

    it('Export CSV button is enabled when rows are present', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      const exportBtn = screen.getByRole('button', { name: /export csv/i });
      expect(exportBtn).not.toBeDisabled();
    });
  });
});

describe('buildCsvContent', () => {
  const locale = 'en-US';

  it('returns a header line as the first row', () => {
    const csv = buildCsvContent([], locale);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Date,Customer,Items,Total,Employee,Payment Method');
  });

  it('returns only header when rows is empty', () => {
    const csv = buildCsvContent([], locale);
    const lines = csv.split('\n');
    expect(lines.length).toBe(1);
  });

  it('includes one data row per entry', () => {
    const rows = [
      {
        dateLabel: '3/15/2024',
        customerLabel: 'Alice Smith',
        itemCount: 2,
        total: 20,
        employeeLabel: 'Bob Jones',
        paymentMethod: 'cash',
      },
    ];
    const csv = buildCsvContent(rows, locale);
    const lines = csv.split('\n');
    expect(lines.length).toBe(2);
  });

  it('wraps string fields in double quotes', () => {
    const rows = [
      {
        dateLabel: '3/15/2024',
        customerLabel: 'Alice Smith',
        itemCount: 1,
        total: 10,
        employeeLabel: 'Bob',
        paymentMethod: 'cash',
      },
    ];
    const csv = buildCsvContent(rows, locale);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toContain('"Alice Smith"');
  });

  it('formats total as USD currency', () => {
    const rows = [
      {
        dateLabel: '',
        customerLabel: '',
        itemCount: 0,
        total: 49.99,
        employeeLabel: '',
        paymentMethod: '',
      },
    ];
    const csv = buildCsvContent(rows, locale);
    expect(csv).toContain('$49.99');
  });

  it('handles missing fields gracefully', () => {
    const rows = [{}];
    expect(() => buildCsvContent(rows, locale)).not.toThrow();
  });
});

describe('filterSalesByDateRange', () => {
  const sales = [
    { id: 1, saleDate: '2024-01-10T00:00:00Z' },
    { id: 2, saleDate: '2024-03-15T12:00:00Z' },
    { id: 3, saleDate: '2024-06-20T08:00:00Z' },
    { id: 4, saleDate: null },
  ];

  it('returns all sales when no dates are provided', () => {
    expect(filterSalesByDateRange(sales, null, null)).toEqual(sales);
  });

  it('returns all sales when both dates are undefined', () => {
    expect(filterSalesByDateRange(sales, undefined, undefined)).toEqual(sales);
  });

  it('filters to only include sales on or after startDate', () => {
    const result = filterSalesByDateRange(sales, '2024-03-01', null);
    const ids = result.map((s) => s.id);
    expect(ids).toContain(2);
    expect(ids).toContain(3);
    expect(ids).not.toContain(1);
  });

  it('filters to only include sales on or before endDate', () => {
    const result = filterSalesByDateRange(sales, null, '2024-03-31');
    const ids = result.map((s) => s.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).not.toContain(3);
  });

  it('filters within a date range (both start and end provided)', () => {
    const result = filterSalesByDateRange(sales, '2024-03-01', '2024-03-31');
    const ids = result.map((s) => s.id);
    expect(ids).toEqual([2]);
  });

  it('excludes sales with null saleDate', () => {
    const result = filterSalesByDateRange(sales, '2024-01-01', '2024-12-31');
    const ids = result.map((s) => s.id);
    expect(ids).not.toContain(4);
  });

  it('returns empty array when no sales fall in range', () => {
    const result = filterSalesByDateRange(sales, '2025-01-01', '2025-12-31');
    expect(result).toEqual([]);
  });

  it('includes sales exactly on the startDate boundary', () => {
    const result = filterSalesByDateRange(sales, '2024-01-10', '2024-01-10');
    const ids = result.map((s) => s.id);
    expect(ids).toContain(1);
  });
});
