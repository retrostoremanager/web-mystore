import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

const AUTH_STORAGE_KEY = 'mystore_auth';

const getAuthHeaders = () => {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const { token, companyId } = JSON.parse(stored);
      if (token && companyId) {
        return {
          Authorization: `Bearer ${token}`,
          'X-Company-Id': String(companyId),
        };
      }
    }
  } catch {
    // ignore
  }
  return {};
};

const baseQuery = fetchBaseQuery({
  baseUrl: config.apiUrl,
  prepareHeaders: (headers) => {
    const authHeaders = getAuthHeaders();
    Object.entries(authHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    return headers;
  },
});

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery,
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: (arg) => {
        const params = {};
        if (arg != null && typeof arg === 'object') {
          if (arg.q != null && arg.q !== '') params.q = arg.q;
          if (arg.locationId != null && arg.locationId > 0) params.locationId = arg.locationId;
        } else if (arg != null) {
          params.locationId = arg;
        }
        return {
          url: 'inventory',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch inventory');
        }
        return response.data ?? [];
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Inventory', id })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),
    getInventoryItem: builder.query({
      query: (id) => `inventory/${id}`,
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch inventory item');
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),
    getInventoryItemLocations: builder.query({
      query: (id) => `inventory/${id}/locations`,
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch item locations');
        }
        return response.data ?? [];
      },
      providesTags: (result, error, id) => [{ type: 'Inventory', id: `${id}-locations` }],
    }),
    createInventoryItem: builder.mutation({
      query: (body) => ({
        url: 'inventory',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create inventory item');
        }
        return response.data;
      },
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    updateInventoryItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `inventory/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update inventory item');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
    deleteInventoryItem: builder.mutation({
      query: (id) => ({
        url: `inventory/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to delete inventory item');
        }
        return response.data;
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useGetInventoryItemLocationsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
