import { useState } from 'react';
import { 
  useGetHousesQuery, 
  useCreateHouseMutation, 
  useUpdateHouseMutation, 
  useDeleteHouseMutation,
  useUploadHouseImagesMutation,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useUploadUnitImagesMutation,
  useAssignManagerToHouseMutation,
  useGetTenantsInHouseQuery
} from '../../redux/services/propertyApi';

export const usePropertyApi = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setSuccess(null);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    // Auto-clear success after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    // Queries
    useGetHousesQuery,
    useGetUnitsQuery,
    
    // Mutations
    useCreateHouseMutation,
    useUpdateHouseMutation,
    useDeleteHouseMutation,
    useUploadHouseImagesMutation,
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useDeleteUnitMutation,
    useUploadUnitImagesMutation,
    useAssignManagerToHouseMutation,
    useGetTenantsInHouseQuery,
    
    
    // Error/Success handling
    error,
    success,
    showError,
    showSuccess,
    clearMessages
  };
};