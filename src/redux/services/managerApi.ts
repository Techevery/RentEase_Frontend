import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { ManagerDashboardStats, Tenant, House, Flat } from '../../types';



export const managerApi = createApi({
  reducerPath: 'managerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/managers`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ManagerDashboard', 'Tenants', 'Properties'],
  endpoints: (builder) => ({
    getManagerDashboard: builder.query<ManagerDashboardStats, void>({
      query: () => '/dashboard',
      providesTags: ['ManagerDashboard'],
    }),
    getManagedProperties: builder.query<{ data: { properties: House[], flats: Flat[] } }, void>({
      query: () => '/properties',
      providesTags: ['Properties'],
    }),
    getManagedTenants: builder.query<Tenant[], void>({
      query: () => '/tenants',
      providesTags: ['Tenants'],
      
      transformResponse: (response: any) => {
        return response.data.map((tenant: any) => ({
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          property: tenant.property,
          unit: tenant.unit,
          leaseStartDate: tenant.leaseStart,
          leaseEndDate: tenant.leaseEnd,
          rentAmount: tenant.rentAmount,
          paymentStatus: tenant.paymentStatus || 'current',
          lastPayment: tenant.lastPayment ? new Date(tenant.lastPayment).toISOString() : null,
          lastPaymentAmount: tenant.lastPaymentAmount,
          nextPayment: tenant.nextPayment ? new Date(tenant.nextPayment).toISOString() : null,
          emergencyContact: tenant.emergencyContact,
          createdAt: tenant.createdAt
        }));
      }
    }),
    getTenantById: builder.query<Tenant, string>({
      query: (id) => `/tenants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tenants', id }],
    }),
    updateTenant: builder.mutation<Tenant, Partial<Tenant> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/tenants/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tenants', id }],
    }),
    recordPayment: builder.mutation({
      query: ({ tenantId, ...paymentData }) => ({
        url: `/tenants/${tenantId}/payments`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Tenants', 'ManagerDashboard'],
    }),
  }),
});

export const {
  useGetManagerDashboardQuery,
  useGetManagedPropertiesQuery,
  useGetManagedTenantsQuery,
  useGetTenantByIdQuery,
  useUpdateTenantMutation,
  useRecordPaymentMutation,
} = managerApi;