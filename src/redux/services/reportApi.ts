import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface BaseApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  warnings?: string;
  filters?: {
    fromDate?: string;
    toDate?: string;
    propertyId?: string;
  };
}

// Financial Summary Types
interface FinancialSummary {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
  };
  counts: {
    totalPayments: number;
    totalExpenses: number;
  };
  monthlyBreakdown: {
    revenue: Record<string, number>;
    expenses: Record<string, number>;
  };
  timeframe: {
    from: string;
    to: string;
  };
}

// Property Performance Types
interface PropertyPerformanceItem {
  property: {
    id: string;
    name: string;
    address: string;
    totalFlats: number;
    occupiedFlats: number;
    occupancyRate: number;
    summary: {
      totalRevenue: number;
      totalExpenses: number;
      netIncome: number;
    };
  };
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
  };
  counts: {
    payments: number;
    expenses: number;
  };
}

interface PropertyPerformanceResponse {
  data: PropertyPerformanceItem[];
  summary: {
    totalProperties: number;
    averageOccupancyRate: number;
    totalRevenueAcrossProperties: number;
    totalExpensesAcrossProperties: number;
    totalNetIncomeAcrossProperties: number;
  };
}

// Expenses Breakdown Types
interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  description: string;
  vendor: string;
  expenseDate: string;
  property: string;
  flat: string;
  manager: string;
}

interface CategoryBreakdown {
  [category: string]: {
    count: number;
    totalAmount: number;
    averageAmount: number;
    percentage: number;
    expenses: any[];
  };
}

interface MonthlyBreakdown {
  [monthYear: string]: {
    totalAmount: number;
    count: number;
    byCategory: Record<string, number>;
  };
}

interface PropertyBreakdown {
  [propertyId: string]: {
    name: string;
    totalAmount: number;
    count: number;
    byCategory: Record<string, number>;
  };
}

interface ExpensesBreakdownResponse {
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
  };
  categoryBreakdown: CategoryBreakdown;
  monthlyBreakdown: MonthlyBreakdown;
  propertyBreakdown: PropertyBreakdown;
  topExpenses: ExpenseItem[];
  allExpenses: ExpenseItem[];
}

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/reports`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    // Financial Summary
    getFinancialSummary: builder.query<BaseApiResponse<FinancialSummary>, { 
      startDate?: string;
      endDate?: string;
    }>({
      query: ({ startDate, endDate } = {}) => ({
        url: '/financial',
        params: { 
          fromDate: startDate,
          toDate: endDate 
        },
      }),
      providesTags: ['Reports'],
    }),
    
    // Property Performance
    getPropertyPerformance: builder.query<BaseApiResponse<PropertyPerformanceResponse>, {
      startDate?: string;
      endDate?: string;
      propertyId?: string;
    }>({
      query: ({ startDate, endDate, propertyId } = {}) => ({
        url: '/property-performance',
        params: { 
          fromDate: startDate,
          toDate: endDate,
          propertyId 
        },
      }),
      providesTags: ['Reports'],
    }),
    
    // Expenses Breakdown
    getExpensesBreakdown: builder.query<BaseApiResponse<ExpensesBreakdownResponse>, {
      startDate?: string;
      endDate?: string;
      propertyId?: string;
    }>({
      query: ({ startDate, endDate, propertyId } = {}) => ({
        url: '/expense-category-breakdown',
        params: { 
          fromDate: startDate,
          toDate: endDate,
          propertyId 
        },
      }),
      providesTags: ['Reports'],
    }),
    
    // Export Reports (if implemented later)
    exportReports: builder.mutation<BaseApiResponse<Blob>, {
      reportType: 'financial' | 'property' | 'expenses';
      format?: 'csv' | 'excel' | 'pdf';
      startDate?: string;
      endDate?: string;
      propertyId?: string;
    }>({
      query: ({ reportType, format = 'csv', startDate, endDate, propertyId }) => ({
        url: `export/${reportType}`,
        params: {
          format,
          fromDate: startDate,
          toDate: endDate,
          propertyId,
        },
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetFinancialSummaryQuery,
  useGetPropertyPerformanceQuery,
  useGetExpensesBreakdownQuery,
  useExportReportsMutation,
  useLazyGetFinancialSummaryQuery,
  useLazyGetPropertyPerformanceQuery,
  useLazyGetExpensesBreakdownQuery,
} = reportApi;