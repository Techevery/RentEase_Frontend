import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import tenantReducer from './slices/tenantSlice';
import paymentReducer from './slices/paymentSlice';
import expenseReducer from './slices/expenseSlice';
import notificationReducer from './slices/notificationSlice';
import managerReducer from './slices/managerSlice';
import landlordReducer from './slices/landloardSlice';
import uiReducer from './slices/uiSlice';
import { authApi } from './services/authApi';
import { propertyApi } from './services/propertyApi';
import { paymentApi } from './services/paymentApi';
import { expenseApi } from './services/expenseApi';
import { tenantApi } from './services/tenantApi';
import { managerApi } from './services/managerApi';

import { reportApi } from './services/reportApi';
import { landlordApi } from './services/landlordApi';
const userData = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token');

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    tenant: tenantReducer,
    payment: paymentReducer,
    expense: expenseReducer,
    notification: notificationReducer,
    manager: managerReducer,
    landlord: landlordReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [propertyApi.reducerPath]: propertyApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [expenseApi.reducerPath]: expenseApi.reducer,
    [tenantApi.reducerPath]: tenantApi.reducer,
    [managerApi.reducerPath]: managerApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [landlordApi.reducerPath]: landlordApi.reducer
  },

preloadedState: {
    auth: {
      user: userData,
      token: token,
      isAuthenticated: !!token,
      loading: false,
    },
  },


  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      propertyApi.middleware,
      paymentApi.middleware,
      expenseApi.middleware,
      tenantApi.middleware,
      managerApi.middleware,
      reportApi.middleware,
      landlordApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;