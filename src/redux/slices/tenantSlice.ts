import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tenant } from '../../types';

interface TenantState {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  tenants: [],
  selectedTenant: null,
  loading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenants: (state, action: PayloadAction<Tenant[]>) => {
      state.tenants = action.payload;
    },
    setSelectedTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.selectedTenant = action.payload;
    },
    addTenant: (state, action: PayloadAction<Tenant>) => {
      state.tenants.push(action.payload);
    },
    updateTenant: (state, action: PayloadAction<Tenant>) => {
      const index = state.tenants.findIndex(tenant => tenant.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
    },
    removeTenant: (state, action: PayloadAction<string>) => {
      state.tenants = state.tenants.filter(tenant => tenant.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTenants,
  setSelectedTenant,
  addTenant,
  updateTenant,
  removeTenant,
  setLoading,
  setError,
} = tenantSlice.actions;

export default tenantSlice.reducer;