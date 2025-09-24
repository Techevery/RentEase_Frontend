import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: 'forgotpassword',
        method: 'POST',
        body: email,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `resetpassword/${token}`,
        method: 'PUT',
        body: { password },
      }),
    }),
    getCurrentUser: builder.query({
      query: () => 'me',
    }),

    // ✅ FIXED: Update password mutation with correct field names
    updatePassword: builder.mutation<
      any,
      { 
        currentPassword: string;
        newPassword: string;
      }
    >({
      query: (data) => ({
        url: 'updatepassword',
        method: 'PUT',
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        },
      }),
    }),

    // ✅ Update user profile mutation
    updateUser: builder.mutation<
      any,
      Partial<{ name: string; email: string; phonenumber: string }>
    >({
      query: (data) => ({
        url: 'update-me',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
} = authApi;