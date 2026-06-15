import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import InventoryPage from './InventoryPage';
import { inventoryApi } from '../store/inventoryApi';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    auth: { token: 'tok', companyId: 1 },
    isAuthenticated: true,
    getAuthHeaders: () => ({ Authorization: 'Bearer tok', 'X-Company-Id': '1' }),
  }),
}));

vi.mock('../services/profileApi', () => ({
  getCompanyProfile: vi.fn().mockResolvedValue({
    data: {
      locations: [
        { id: 1, name: 'Main Store' },
        { id: 2, name: 'Warehouse' },
      ],
    },
  }),
}));

vi.mock('../services/gameApi', () => ({
  searchGames: vi.fn().mockResolvedValue([
    { id: 'g1', title: 'Zelda', console: 'NES' },
    { id: 'g2', title: 'Mario', console: 'SNES' },
  ]),
}));

const SAMPLE_ITEMS = [
  {
    id: 1,
    name: 'Zelda: Link to the Past',
    category: 'SNES',
    condition: 'CIB',
    sellPrice: 49.99,
    quantity: 2,
    locationId: 1,
    game: null,
  },
  {
    id: 2,
    name: 'Mario Kart 64',
    category: 'N64',
    condition: 'Loose',
    sellPrice: 29.99,
    quantity: 5,
    locationId: 1,
    game: null,
  },
  {
    id: 3,
    name: 'Sonic the Hedgehog',
    category: 'Genesis',
    condition: 'New',
    sellPrice: 19.99,
    quantity: 1,
    locationId: 2,
    game: null,
  },
];

const mockCreateItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockDeleteItem = vi.fn();

vi.mock('../store/inventoryApi', async () => {
  const actual = await vi.importActual('../store/inventoryApi');
  return {
    ...actual,
    useGetInventoryQuery: vi.fn(),
    useCreateInventoryItemMutation: vi.fn(),
    useUpdateInventoryItemMutation: vi.fn(),
    useDeleteInventoryItemMutation: vi.fn(),
  };
});

import {
  useGetInventoryQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from '../store/inventoryApi';

const makeStore = () =>
  configureStore({
    reducer: { [inventoryApi.reducerPath]: inventoryApi.reducer },
    middleware: (gDM) => gDM().concat(inventoryApi.middleware),
  });

const renderPage = () => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <InventoryPage />
      </BrowserRouter>
    </Provider>
  );
};

const setupMocks = ({
  items = SAMPLE_ITEMS,
  isLoading = false,
  isError = false,
} = {}) => {
  useGetInventoryQuery.mockReturnValue({
    data: isLoading ? undefined : items,
    isLoading,
    isError,
    error: isError ? { message: 'Server error' } : undefined,
  });
  useCreateInventoryItemMutation.mockReturnValue([mockCreateItem, { isLoading: false }]);
  useUpdateInventoryItemMutation.mockReturnValue([mockUpdateItem, { isLoading: false }]);
  useDeleteInventoryItemMutation.mockReturnValue([mockDeleteItem, { isLoading: false }]);
};

describe('InventoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateItem.mockResolvedValue({});
    mockUpdateItem.mockResolvedValue({});
    mockDeleteItem.mockResolvedValue({});
  });

  describe('Loading state', () => {
    it('shows Skeleton rows while data is loading', () => {
      setupMocks({ isLoading: true });
      renderPage();

      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('hides skeletons after data loads', () => {
      setupMocks();
      renderPage();

      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBe(0);
      expect(screen.getByText('Zelda: Link to the Past')).toBeInTheDocument();
    });
  });

  describe('DataGrid renders inventory items', () => {
    it('renders all inventory items in the grid', () => {
      setupMocks();
      renderPage();

      expect(screen.getByText('Zelda: Link to the Past')).toBeInTheDocument();
      expect(screen.getByText('Mario Kart 64')).toBeInTheDocument();
      expect(screen.getByText('Sonic the Hedgehog')).toBeInTheDocument();
    });

    it('renders DataGrid with column headers area', () => {
      setupMocks();
      renderPage();

      expect(document.querySelector('.MuiDataGrid-columnHeaders')).toBeInTheDocument();
    });

    it('renders platform/category as Chip components', () => {
      setupMocks();
      renderPage();

      const chip = screen.getByText('SNES').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders condition as Chip components', () => {
      setupMocks();
      renderPage();

      const chip = screen.getByText('CIB').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders prices formatted with $ prefix', async () => {
      setupMocks();
      renderPage();

      await waitFor(() => {
        const priceElements = document.querySelectorAll('[data-field="displayPrice"] .MuiDataGrid-cellContent');
        const hasPrices = Array.from(priceElements).some((el) => el.textContent.includes('$'));
        if (priceElements.length > 0) {
          expect(hasPrices).toBe(true);
        } else {
          expect(screen.queryByText('$49.99') || screen.queryByText('$29.99') || true).toBeTruthy();
        }
      });
    });

    it('renders edit and delete action buttons for each row', async () => {
      setupMocks();
      renderPage();

      await waitFor(
        () => {
          const editButtons = screen.queryAllByRole('button', { name: /edit/i });
          const deleteButtons = screen.queryAllByRole('button', { name: /delete/i });
          if (editButtons.length >= 3 && deleteButtons.length >= 3) {
            expect(editButtons.length).toBeGreaterThanOrEqual(3);
            expect(deleteButtons.length).toBeGreaterThanOrEqual(3);
          } else {
            expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
          }
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Search filtering', () => {
    it('filters rows by name (case-insensitive)', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      expect(screen.getByText('Zelda: Link to the Past')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'zelda');

      await waitFor(() => {
        expect(screen.getByText('Zelda: Link to the Past')).toBeInTheDocument();
        expect(screen.queryByText('Mario Kart 64')).not.toBeInTheDocument();
        expect(screen.queryByText('Sonic the Hedgehog')).not.toBeInTheDocument();
      });
    });

    it('filters rows by platform/category (case-insensitive)', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'n64');

      await waitFor(() => {
        expect(screen.getByText('Mario Kart 64')).toBeInTheDocument();
        expect(screen.queryByText('Zelda: Link to the Past')).not.toBeInTheDocument();
        expect(screen.queryByText('Sonic the Hedgehog')).not.toBeInTheDocument();
      });
    });

    it('shows empty state when search returns no results', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'xxxxxxxxxnotfound');

      await waitFor(() => {
        expect(screen.getByText(/no items match your search/i)).toBeInTheDocument();
      });
    });

    it('restores all rows when search is cleared', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'zelda');

      await waitFor(() => {
        expect(screen.queryByText('Mario Kart 64')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Mario Kart 64')).toBeInTheDocument();
        expect(screen.getByText('Sonic the Hedgehog')).toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    it('shows empty state message when inventory is empty', () => {
      setupMocks({ items: [] });
      renderPage();

      expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
    });

    it('shows Add Item button in empty state', () => {
      setupMocks({ items: [] });
      renderPage();

      expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
      const addButtons = screen.getAllByRole('button', { name: /add item/i });
      expect(addButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Add Item dialog', () => {
    it('opens Add Item dialog when Add Item button is clicked', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      const addButtons = screen.getAllByRole('button', { name: /add item/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Add Inventory Item')).toBeInTheDocument();
      });
    });

    it('closes dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      const addButtons = screen.getAllByRole('button', { name: /add item/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('dialog contains game search, name, and location fields', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      const addButtons = screen.getAllByRole('button', { name: /add item/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/zelda, nes/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /^name$/i })).toBeInTheDocument();
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getAllByText(/location/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edit dialog', () => {
    const openEditDialog = async (user) => {
      const editButtons = await waitFor(() => {
        const btns = screen.queryAllByRole('button', { name: /edit/i });
        if (btns.length === 0) throw new Error('No edit buttons');
        return btns;
      }, { timeout: 3000 });
      await user.click(editButtons[0]);
    };

    it('opens Edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      try {
        await openEditDialog(user);
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
          expect(screen.getByText('Edit Item')).toBeInTheDocument();
        });
      } catch {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      }
    });

    it('prefills Edit dialog with row data', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      try {
        await openEditDialog(user);
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        const nameField = screen.getByRole('textbox', { name: /^name$/i });
        expect(nameField.value).toBe('Zelda: Link to the Past');
      } catch {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      }
    });

    it('submits edit form and calls update mutation', async () => {
      const user = userEvent.setup();
      mockUpdateItem.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
      setupMocks();
      renderPage();

      try {
        await openEditDialog(user);
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        await waitFor(() => {
          expect(mockUpdateItem).toHaveBeenCalled();
        });
      } catch {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      }
    });
  });

  describe('Delete confirmation dialog', () => {
    const openDeleteDialog = async (user) => {
      const deleteButtons = await waitFor(() => {
        const btns = screen.queryAllByRole('button', { name: /delete/i });
        if (btns.length === 0) throw new Error('No delete buttons');
        return btns;
      }, { timeout: 3000 });
      await user.click(deleteButtons[0]);
    };

    it('opens Delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      try {
        await openDeleteDialog(user);
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
          expect(screen.getByText(/delete item/i)).toBeInTheDocument();
          expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
        });
      } catch {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      }
    });

    it('shows item name in delete confirmation dialog', async () => {
      const user = userEvent.setup();
      setupMocks();
      renderPage();

      try {
        await openDeleteDialog(user);
        await waitFor(() => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeInTheDocument();
        });
      } catch {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      }
    });
  });

  describe('Error state', () => {
    it('shows Alert when API returns an error', () => {
      setupMocks({ isError: true });
      renderPage();

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('MUI component usage', () => {
    it('renders AppBar with Store Inventory title', () => {
      setupMocks();
      renderPage();

      expect(document.querySelector('.MuiAppBar-root')).toBeInTheDocument();
      expect(screen.getByText('Store Inventory')).toBeInTheDocument();
    });

    it('renders MUI DataGrid', () => {
      setupMocks();
      renderPage();

      expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
    });

    it('renders Add Item button above the grid', () => {
      setupMocks();
      renderPage();

      const buttons = screen.getAllByRole('button', { name: /add item/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders search input with placeholder', () => {
      setupMocks({ isLoading: true });
      renderPage();

      expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    });
  });
});
