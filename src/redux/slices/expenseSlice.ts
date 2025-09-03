import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from '../../types';

interface ExpenseState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  selectedExpense: null,
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload);
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }    
    },
    removeExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
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
  setExpenses,
  setSelectedExpense,
  addExpense,
  updateExpense,
  removeExpense,
  setLoading,
  setError,
} = expenseSlice.actions;

export default expenseSlice.reducer;