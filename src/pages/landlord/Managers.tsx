import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Building, Loader2, AlertCircle, CheckCircle, X, Trash2, Edit } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  useGetManagersQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
  Manager,
  CreateManagerRequest,
} from '../../redux/services/landlordApi';

// Toast notification component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {type === 'success' ? (
          <CheckCircle size={20} className="mr-2" />
        ) : (
          <AlertCircle size={20} className="mr-2" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel, 
  isLoading = false,
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  const typeColors = {
    danger: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${typeColors[type]}`}>
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600">{message}</p>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              disabled={isLoading}
              icon={isLoading ? <Loader2 size={16} className="animate-spin" /> : undefined}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 size={32} className="animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading managers...</span>
  </div>
);

// Error component
const ErrorMessage: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle size={48} className="text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Managers</h3>
    <p className="text-gray-600 mb-4 text-center">{message}</p>
    <Button variant="primary" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

// Modal Form for Add/Edit Manager
const ManagerForm: React.FC<{
  initial?: Manager;
  onSubmit: (data: CreateManagerRequest) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ initial, onSubmit, onClose, isLoading }) => {
  const [form, setForm] = useState<CreateManagerRequest>({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phonenumber || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initial ? 'Edit Manager' : 'Add New Manager'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                placeholder="Enter manager's full name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter manager's email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter manager's phone number"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading}
                icon={isLoading ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {isLoading ? 'Saving...' : initial ? 'Update Manager' : 'Add Manager'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LandlordManagers: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // API hooks
  const { 
    data: managersResponse, 
    error, 
    isLoading, 
    refetch 
  } = useGetManagersQuery();
  
  const [createManager, { isLoading: isCreating }] = useCreateManagerMutation();
  const [updateManager, { isLoading: isUpdating }] = useUpdateManagerMutation();
  const [deleteManager, { isLoading: isDeleting }] = useDeleteManagerMutation();

  const managers = managersResponse?.data || [];

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (manager: Manager) => {
    setEditing(manager);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateManagerRequest) => {
    console.log('Submitting form data:', data);
    
    try {
      if (editing) {
        console.log('Updating manager:', editing.id);
        const result = await updateManager({ 
          id: editing.id, 
          ...data 
        }).unwrap();
        console.log('Update successful:', result);
        showToast('Manager updated successfully!', 'success');
      } else {
        console.log('Creating new manager');
        const result = await createManager(data).unwrap();
        console.log('Create successful:', result);
        const successMessage = result.message || 'Manager created successfully!';
        showToast(successMessage, 'success');
      }
      // Close modal on success
      setShowForm(false);
      setEditing(null);
    } catch (error: any) {
      console.error('API Error full object:', error);
      console.error('API Error data:', error?.data);
      console.error('API Error status:', error?.status);
      console.error('API Error message:', error?.message);
      
      let errorMessage = 'Failed to save manager';
      
      // Try to extract error message from different possible structures
      if (error?.data) {
        // Check for RTK Query error structure
        if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.error) {
          errorMessage = error.data.error;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        }
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.log('Final error message to display:', errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteClick = (manager: Manager) => {
    setManagerToDelete(manager);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!managerToDelete) return;

    try {
      await deleteManager(managerToDelete.id).unwrap();
      showToast('Manager deleted successfully!', 'success');
      setShowDeleteModal(false);
      setManagerToDelete(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete manager';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setManagerToDelete(null);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    const errorData = error as any;
    const errorMessage = errorData?.data?.message || 'Failed to load managers';
    
    return <ErrorMessage message={errorMessage} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Managers</h1>
          <p className="text-gray-600 mt-1">
            Manage your property managers and their access
          </p>
        </div>
        <Button 
          variant="primary" 
          icon={<UserPlus size={20} />} 
          onClick={handleAdd}
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          Add Manager
        </Button>
      </div>

      {managers.length === 0 ? (
        <div className="text-center py-12">
          <Building size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Managers Yet</h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first property manager to help manage your properties.
          </p>
          <Button variant="primary" icon={<UserPlus size={20} />} onClick={handleAdd}>
            Add Your First Manager
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager) => (
            <Card key={manager.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-xl font-semibold text-white">
                        {manager.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{manager.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm truncate">{manager.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">{manager.phonenumber}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">
                      Added {formatDate(manager.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth 
                    onClick={() => handleEdit(manager)}
                    disabled={isUpdating}
                    icon={<Edit size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleDeleteClick(manager)}
                    disabled={isDeleting}
                    icon={isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Manager"
        message={`Are you sure you want to delete ${managerToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Manager"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
        type="danger"
      />

      {/* Add/Edit Manager Form */}
      {showForm && (
        <ManagerForm
          initial={editing || undefined}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default LandlordManagers;