import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const propertyApi = createApi({
  reducerPath: 'propertyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_API_URL}/api/properties`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Houses', 'Flats', 'Tenants'],
  endpoints: (builder) => ({
    // Houses
     getTenantsInHouse: builder.query({
      query: (houseId) => `houses/${houseId}/tenants`,
      providesTags: (result, error, houseId) => [
        { type: 'Tenants', id: houseId },
        { type: 'Flats', id: houseId }
      ],
    }),

    getHouses: builder.query({
      query: () => 'houses',
      providesTags: ['Houses'],
    }),
    getHouse: builder.query({
      query: (id) => `houses/${id}`,
      providesTags: ['Houses'],
    }),
    createHouse: builder.mutation({
      query: (formData) => ({
        url: 'houses',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Houses'],
    }),
    updateHouse: builder.mutation({
  query: ({ id, formData }) => ({
    url: `houses/${id}`,
    method: 'PUT',
    body: formData,
   
    headers: {
      ...(formData instanceof FormData ? {} : { 'Content-Type': 'application/json' })
    }
  }),
  invalidatesTags: ['Houses'],
}),
    deleteHouse: builder.mutation({
      query: (id) => ({
        url: `houses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Houses'],
    }),
    uploadHouseImages: builder.mutation({
      query: ({ id, images }) => {
        const formData = new FormData();
        images.forEach((image: File) => {
          formData.append('images', image);
        });
        return {
          url: `houses/${id}/images`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Houses'],
    }),
    deleteHouseImage: builder.mutation({
      query: ({ houseId, imageId }) => ({
        url: `houses/${houseId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Houses'],
    }),
    assignManagerToHouse: builder.mutation<void, { houseId: string; managerId: string }>({
      query: ({ houseId, managerId }) => ({
        url: `houses/${houseId}/assign-manager/${managerId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Houses'],
    }),

    // Flats/Units
    getUnits: builder.query({
      query: (houseId) => `houses/${houseId}/flats`,
      providesTags: ['Flats'],
    }),
    getUnit: builder.query({
      query: (id) => `flats/${id}`,
      providesTags: (result, error, id) => [{ type: 'Flats', id }],
    }),
    createUnit: builder.mutation({
      query: ({ houseId, formData }) => ({
        url: `houses/${houseId}/flats`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Flats'],
    }),
  updateUnit: builder.mutation({
  query: ({ id, formData }) => ({
    url: `flats/${id}`,
    method: 'PUT',
    body: formData,
    // Add form data headers for file uploads
    headers: {
      ...(formData instanceof FormData ? {} : { 'Content-Type': 'application/json' })
    }
  }),
  invalidatesTags: (result) => [
    { type: 'Flats', id: result?.houseId },
    { type: 'Tenants', id: result?.houseId }
  ],
}),
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `flats/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Flats'],
    }),
    uploadUnitImages: builder.mutation({
      query: ({ id, images }) => {
        const formData = new FormData();
        images.forEach((image: File) => {
          formData.append('images', image);
        });
        return {
          url: `flats/${id}/images`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Flats'],
    }),
    deleteUnitImage: builder.mutation({
      query: ({ unitId, imageId }) => ({
        url: `flats/${unitId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Flats'],
    }),
    assignManagerToFlat: builder.mutation<void, { flatId: string; managerId: string }>({
      query: ({ flatId, managerId }) => ({
        url: `flats/${flatId}/assign-manager/${managerId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Flats'],
    }),

    // Maintenance
    addMaintenanceRecord: builder.mutation({
      query: ({ unitId, maintenanceData }) => ({
        url: `flats/${unitId}/maintenance`,
        method: 'POST',
        body: maintenanceData,
      }),
      invalidatesTags: ['Flats'],
    }),
    getMaintenanceHistory: builder.query({
      query: (unitId) => `flats/${unitId}/maintenance`,
      providesTags: ['Flats'],
    }),
  }),
});

export const {
  useGetHousesQuery,
  useGetHouseQuery,
  useCreateHouseMutation,
  useUpdateHouseMutation,
  useDeleteHouseMutation,
  useUploadHouseImagesMutation,
  useDeleteHouseImageMutation,
  useGetUnitsQuery,
  useGetUnitQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useUploadUnitImagesMutation,
  useDeleteUnitImageMutation,
  useAddMaintenanceRecordMutation,
  useGetMaintenanceHistoryQuery,
  useAssignManagerToHouseMutation,
  useAssignManagerToFlatMutation,
   useGetTenantsInHouseQuery
} = propertyApi;