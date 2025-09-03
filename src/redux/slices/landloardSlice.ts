import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Manager, DashboardStats } from '../services/landlordApi';

interface LandlordState {
  managers: Manager[];
  selectedManager: Manager | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  managerLoading: boolean;
  managerError: string | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
}

const initialState: LandlordState = {
  managers: [],
  selectedManager: null,
  dashboardStats: null,
  loading: false,
  error: null,
  managerLoading: false,
  managerError: null,
  dashboardLoading: false,
  dashboardError: null,
};

const landlordSlice = createSlice({
  name: 'landlord',
  initialState,
  reducers: {
    setManagers: (state, action: PayloadAction<Manager[]>) => {
      state.managers = action.payload;
    },
    setSelectedManager: (state, action: PayloadAction<Manager | null>) => {
      state.selectedManager = action.payload;
    },
    addManager: (state, action: PayloadAction<Manager>) => {
      state.managers.push(action.payload);
    },
    updateManager: (state, action: PayloadAction<Manager>) => {
      const index = state.managers.findIndex(manager => manager.id === action.payload.id);
      if (index !== -1) {
        state.managers[index] = action.payload;
        if (state.selectedManager?.id === action.payload.id) {
          state.selectedManager = action.payload;
        }
      }
    },
    removeManager: (state, action: PayloadAction<string>) => {
      state.managers = state.managers.filter(manager => manager.id !== action.payload);
      if (state.selectedManager?.id === action.payload) {
        state.selectedManager = null;
      }
    },
    setDashboardStats: (state, action: PayloadAction<DashboardStats>) => {
      state.dashboardStats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setManagerLoading: (state, action: PayloadAction<boolean>) => {
      state.managerLoading = action.payload;
    },
    setManagerError: (state, action: PayloadAction<string | null>) => {
      state.managerError = action.payload;
    },
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.dashboardLoading = action.payload;
    },
    setDashboardError: (state, action: PayloadAction<string | null>) => {
      state.dashboardError = action.payload;
    },
  },
});

export const {
  setManagers,
  setSelectedManager,
  addManager,
  updateManager,
  removeManager,
  setDashboardStats,
  setLoading,
  setError,
  setManagerLoading,
  setManagerError,
  setDashboardLoading,
  setDashboardError,
} = landlordSlice.actions;

export default landlordSlice.reducer;