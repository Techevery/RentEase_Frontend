import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const expenseApi = createApi({
  reducerPath: 'expenseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/expenses`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Expenses'],
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: () => '',
      providesTags: ['Expenses'],
    }),
    createExpense: builder.mutation({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Expenses'],
    }),
    approveExpense: builder.mutation({
      query: (id) => ({
        url: `${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Expenses'],
    }),
    rejectExpense: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Expenses'],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),

     updateExpense: builder.mutation({
    query: ({ id, formData }) => ({
      url: `${id}`,
      method: 'PUT',
      body: formData,
    }),
    invalidatesTags: ['Expenses'],
  }),
  }),

  
});

// Export hooks for usage in functional components
export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,

} = expenseApi;