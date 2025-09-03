import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/tenants`,
    prepareHeaders: (headers, { getState }) => {
      const state = (getState as () => RootState)();
      const token = state.auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Tenants'],
  endpoints: (builder) => ({
    getTenants: builder.query({
      query: () => '',
      providesTags: ['Tenants'],
    }),
    getTenant: builder.query({
      query: (id) => `${id}`,
      providesTags: ['Tenants'],
    }),
    createTenant: builder.mutation({
      query: (tenantData) => ({
        url: '',
        method: 'POST',
        body: tenantData,
      }),
      invalidatesTags: ['Tenants'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...tenantData }) => ({
        url: `${id}`,
        method: 'PUT',
        body: tenantData,
      }),
      invalidatesTags: ['Tenants'],
    }),
    deleteTenant: builder.mutation({
      query: ({ id, mode }) => ({
        url: `${id}${mode === 'deactivate' ? '?mode=deactivate' : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenants'],
    }),
    deactivateTenant: builder.mutation({
      query: (id) => ({
        url: `${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: ['Tenants'],
    }),
    assignTenantToFlat: builder.mutation({
      query: ({ tenantId, flatId }) => ({
        url: `${tenantId}/assign-flat/${flatId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Tenants'],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useDeactivateTenantMutation,
  useAssignTenantToFlatMutation,
} = tenantApi;