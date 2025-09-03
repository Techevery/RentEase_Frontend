import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface ManagerState {
  managers: User[];
  selectedManager: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  managers: [],
  selectedManager: null,
  loading: false,
  error: null,
};

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    setManagers: (state, action: PayloadAction<User[]>) => {
      state.managers = action.payload;
    },
    setSelectedManager: (state, action: PayloadAction<User | null>) => {
      state.selectedManager = action.payload;
    },
    addManager: (state, action: PayloadAction<User>) => {
      state.managers.push(action.payload);
    },
    updateManager: (state, action: PayloadAction<User>) => {
      const index = state.managers.findIndex(manager => manager.id === action.payload.id);
      if (index !== -1) {
        state.managers[index] = action.payload;
      }
    },
    removeManager: (state, action: PayloadAction<string>) => {
      state.managers = state.managers.filter(manager => manager.id !== action.payload);
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
  setManagers,
  setSelectedManager,
  addManager,
  updateManager,
  removeManager,
  setLoading,
  setError,
} = managerSlice.actions;

export default managerSlice.reducer;