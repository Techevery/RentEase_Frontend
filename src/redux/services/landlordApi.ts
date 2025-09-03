import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';


export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  type: string;
  tenantId: string;
  unitId: string;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}



export interface Expense {
  id: string;
  amount: number;
  expenseDate: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  houseId: string;
  createdAt: string;
}

export interface DashboardStats {
  overview: {
    totalProperties: number;
    totalUnits: number;
    totalManagers: number;
    totalTenants: number;
    occupancyRate: number;
    vacancyRate: number;
  };
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalExpenses: number;
    monthlyExpenses: number;
    netIncome: number;
    monthlyNetIncome: number;
    pendingPayments: number;
    overduePayments: number;
    collectionRate: number;
    incomeCollectedPercent: number;
  };
  operational: {
    maintenanceRequests: {
      pending: number;
      inProgress: number;
      completed: number;
      overdue: number;
    };
    inspectionsDue: number;
    leaseExpirations: {
      thisMonth: number;
      nextMonth: number;
      next3Months: number;
    };
    documentsExpiring: number;
  };
  performance: {
    averageOccupancyRate: number;
    averageRentCollection: number;
    averageMaintenanceTime: number;
    tenantRetentionRate: number;
    propertyAppreciationRate: number;
  };
  recentActivity: {
    payments: Payment[];
    expenses: Expense[];
    // maintenance: MaintenanceRecord[];
    notifications: Notification[];
  };
  trends: {
    revenueGrowth: number;
    occupancyTrend: number;
    expenseGrowth: number;
    tenantGrowth: number;
  };
  
}


export interface CreateManagerRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateManagerRequest {
  id: string;
  name?: string;
  email?: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phonenumber: string;
  role: 'manager';
  createdAt: string;
  updatedAt: string;
}


export const landlordApi = createApi({
  reducerPath: 'landlordApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/landlords`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Manager', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard endpoints
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => 'dashboard',
      providesTags: ['Dashboard'],
    }),

    // Manager endpoints
    getManagers: builder.query<{ success: boolean; count: number; data: Manager[] }, void>({
      query: () => 'managers',
      providesTags: ['Manager'],
    }),

    getManager: builder.query<{ success: boolean; data: Manager }, string>({
      query: (id) => `managers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Manager', id }],
    }),

    createManager: builder.mutation<
      { success: boolean; data: Manager; message: string },
      CreateManagerRequest
    >({
      query: (managerData) => ({
        url: 'managers',
        method: 'POST',
        body: managerData,
      }),
      invalidatesTags: ['Manager', 'Dashboard'],
    }),

    updateManager: builder.mutation<
      { success: boolean; data: Manager },
      UpdateManagerRequest
    >({
      query: ({ id, ...managerData }) => ({
        url: `managers/${id}`,
        method: 'PUT',
        body: managerData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Manager', id },
        'Manager',
        'Dashboard',
      ],
    }),

    deleteManager: builder.mutation<{ success: boolean; data: object }, string>({
      query: (id) => ({
        url: `managers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Manager', 'Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetManagersQuery,
  useGetManagerQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
} = landlordApi;