import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// Define types for the payment summary response
export interface PaymentSummary {
  success: boolean;
  data: {
    tenant: {
      id: string;
      name: string;
      email: string;
      phone: string;
      emergencyContact?: string;
      rentAmount: number;
      leaseStart: Date;
      leaseEnd: Date;
      status: string;
      property: {
        id: string;
        name: string;
        address: string;
      } | null;
      unit: {
        id: string;
        number: string;
      } | null;
    };
    summary: {
      totalPayments: number;
      totalAmount: number;
      approved: {
        count: number;
        amount: number;
      };
      pending: {
        count: number;
        amount: number;
      };
      rejected: {
        count: number;
        amount: number;
      };
      averagePayment: number;
    };
    paymentMethodBreakdown: Record<string, { count: number; totalAmount: number }>;
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monthlyBreakdown: Record<string, { count: number; totalAmount: number; payments: any[] }>;
    recentActivity: {
      period: string;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payments: any[];
    };
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allPayments: any[];
  };
}

// Define the API service
export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/payments`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Payments', 'PaymentSummary'],
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (params?: { 
        status?: string; 
        tenantId?: string; 
        flatId?: string; 
        houseId?: string; 
        fromDate?: string; 
        toDate?: string; 
        page?: number; 
        limit?: number; 
        sort?: string;
      }) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, value.toString());
            }
          });
        }
        
        return queryParams.toString() ? `?${queryParams.toString()}` : '';
      },
      providesTags: ['Payments'],
    }),
    
    getPayment: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payments', id }],
    }),
    
    createPayment: builder.mutation({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Payments', 'PaymentSummary'],
    }),
    
    approvePayment: builder.mutation({
      query: (id) => ({
        url: `${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Payments', 'PaymentSummary'],
    }),
    
    rejectPayment: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Payments', 'PaymentSummary'],
    }),
    
    sendReminders: builder.mutation({
      query: () => ({
        url: 'send-reminders',
        method: 'POST',
      }),
    }),
    
    // New endpoint for tenant payment summary
    getTenantPaymentSummary: builder.query<PaymentSummary, string>({
      query: (tenantId) => `/tenant/${tenantId}/summary`,
      providesTags: (result, error, tenantId) => [
        { type: 'PaymentSummary', id: tenantId },
        'PaymentSummary'
      ],
    }),
  }),
});


export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useSendRemindersMutation,
  useGetTenantPaymentSummaryQuery, 
} = paymentApi;