import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Home, Calendar, CreditCard, Edit2, Trash2, FileText, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  useGetTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useDeactivateTenantMutation,
} from '../../redux/services/tenantApi';
import { useGetHousesQuery } from '../../redux/services/propertyApi';
import { Tenant } from '../../types/index';
import { useGetTenantPaymentSummaryQuery } from '../../redux/services/paymentApi';
import ConfirmationModal from '../../components/TenantComp/ConfirmationModal';
import TenantForm from '../../components/TenantComp/TenantForm';
import TenantProfileModal from '../../components/TenantComp/TenantProfileModal';

// Add interface for House
interface House {
  _id: string;
  name: string;
}

// Add interface for PaymentSummary
interface PaymentSummary {
  success: boolean;
  data: {
    summary: {
      totalPayments: number;
      approved: {
        count: number;
        amount: number;
      };
      pending: {
        count: number;
        amount: number;
      };
      rejected: {
        count: number;
        amount: number;
      };
    };
    recentActivity: {
      period: string;
      payments: Array<{
        status: string;
        amount: number;
        createdAt?: string;
        date?: string;
        paymentDate?: string;
        created?: string;
        timestamp?: string;
      }>;
    };
  };
}

const Tenants: React.FC = () => {
  const { data: tenantsData, isLoading, error } = useGetTenantsQuery({});
  const { data: housesData } = useGetHousesQuery({});
  const [createTenant] = useCreateTenantMutation();
  const [updateTenant] = useUpdateTenantMutation();
  const [deleteTenant] = useDeleteTenantMutation();
  const [deactivateTenant] = useDeactivateTenantMutation();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Partial<Tenant> | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const [tenantToDeactivate, setTenantToDeactivate] = useState<Tenant | null>(null);
  const [tenantToActivate, setTenantToActivate] = useState<Tenant | null>(null);

  const tenants = (tenantsData?.data || []) as Tenant[];
  const houses = (housesData?.data || []) as House[];

  // Get payment summary for the selected tenant when profile modal is open
  const { data: paymentSummaryData, isLoading: isPaymentSummaryLoading, error: paymentSummaryError } = 
    useGetTenantPaymentSummaryQuery(selectedTenant?._id || '', {
      skip: !selectedTenant, // Skip the query if no tenant is selected
    });

  const handleSubmit = async (data: Partial<Tenant>) => {
    try {
      if (editingTenant?._id) {
        await updateTenant({ id: editingTenant._id, data }).unwrap();
        toast.success('Tenant updated successfully');
      } else {
        await createTenant(data).unwrap();
        toast.success('Tenant created successfully');
      }
      setShowForm(false);
      setEditingTenant(null);
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.data?.message || 'Error saving tenant');
    }
  };

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    
    try {
      await deleteTenant({ id: tenantToDelete }).unwrap();
      toast.success('Tenant deleted successfully');
      setShowDeleteModal(false);
      setTenantToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.data?.message || 'Error deleting tenant');
    }
  };

  const handleDeactivate = async () => {
    if (!tenantToDeactivate) return;
    
    try {
      await deactivateTenant(tenantToDeactivate._id).unwrap();
      toast.success('Tenant deactivated successfully');
      setShowDeactivateModal(false);
      setTenantToDeactivate(null);
    } catch (err: any) {
      console.error('Deactivate error:', err);
      toast.error(err.data?.message || 'Error deactivating tenant');
    }
  };

  const handleActivate = async () => {
    if (!tenantToActivate) return;
    
    try {
      await updateTenant({ 
        id: tenantToActivate._id, 
        data: { status: 'active' } 
      }).unwrap();
      toast.success('Tenant activated successfully');
      setShowActivateModal(false);
      setTenantToActivate(null);
    } catch (err: any) {
      console.error('Activate error:', err);
      toast.error(err.data?.message || 'Error activating tenant');
    }
  };

  const openDeleteModal = (id: string) => {
    setTenantToDelete(id);
    setShowDeleteModal(true);
  };

  const openDeactivateModal = (tenant: Tenant) => {
    setTenantToDeactivate(tenant);
    setShowDeactivateModal(true);
  };

  const openActivateModal = (tenant: Tenant) => {
    setTenantToActivate(tenant);
    setShowActivateModal(true);
  };

  const openProfileModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowProfile(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount?.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTenant({});
            setShowForm(true);
          }}
          className="flex items-center"
        >
          <UserPlus size={20} className="mr-2" />
          Add Tenant
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <Card className="p-6 text-center">
          <p className="text-red-500">Error loading tenants</p>
        </Card>
      )}

      {!isLoading && !error && tenants.length === 0 && (
        <Card className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first tenant</p>
          <Button
            variant="primary"
            onClick={() => {
              setEditingTenant({});
              setShowForm(true);
            }}
          >
            Add Tenant
          </Button>
        </Card>
      )}

      {!isLoading && !error && tenants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-lg font-semibold text-blue-800">
                      {tenant.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openProfileModal(tenant)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="View Profile"
                  >
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTenant({...tenant}); // Spread all tenant properties including lease dates
                      setShowForm(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 p-1"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  {tenant.status === 'active' ? (
                    <button
                      onClick={() => openDeactivateModal(tenant)}
                      className="text-yellow-600 hover:text-yellow-800 p-1"
                      title="Deactivate"
                    >
                      <UserX size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => openActivateModal(tenant)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Activate"
                    >
                      <UserCheck size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteModal(tenant._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Mail size={16} className="mr-3 text-gray-500" /> 
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone size={16} className="mr-3 text-gray-500" /> 
                  <span>{tenant.phone}</span>
                </div>
                {tenant.emergencyContact && (
                  <div className="flex items-center text-gray-700">
                    <Phone size={16} className="mr-3 text-gray-500" /> 
                    <span>Emergency: {tenant.emergencyContact}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Home size={16} className="mr-3 text-gray-500" /> 
                  <span>{(tenant.property as any)?.name || 'Property not found'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar size={16} className="mr-3 text-gray-500" /> 
                  <span>
                    Lease: {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CreditCard size={16} className="mr-3 text-gray-500" /> 
                  <span>{formatCurrency(tenant.rentAmount)}/year</span>
                </div>
                {tenant.cautionFee && tenant.cautionFee > 0 && (
                  <div className="flex items-center text-gray-700">
                    <CreditCard size={16} className="mr-3 text-gray-500" /> 
                    <span>Caution: {formatCurrency(tenant.cautionFee)}</span>
                  </div>
                )}
                {tenant.serviceCharge && tenant.serviceCharge > 0 && (
                  <div className="flex items-center text-gray-700">
                    <CreditCard size={16} className="mr-3 text-gray-500" /> 
                    <span>Service: {formatCurrency(tenant.serviceCharge)}</span>
                  </div>
                )}
                {tenant.agencyFee && tenant.agencyFee > 0 && (
                  <div className="flex items-center text-gray-700">
                    <CreditCard size={16} className="mr-3 text-gray-500" /> 
                    <span>Agency: {formatCurrency(tenant.agencyFee)}</span>
                  </div>
                )}
                {tenant.legalFee && tenant.legalFee > 0 && (
                  <div className="flex items-center text-gray-700">
                    <CreditCard size={16} className="mr-3 text-gray-500" /> 
                    <span>Legal: {formatCurrency(tenant.legalFee)}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-700 font-semibold">
                  <CreditCard size={16} className="mr-3 text-gray-500" /> 
                  <span>Total: {formatCurrency(tenant.totalRent || tenant.rentAmount)}/year</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <TenantForm
          initial={editingTenant || {}}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTenant(null);
          }}
          houses={houses}
        />
      )}

      {showProfile && selectedTenant && (
        <TenantProfileModal
          tenant={selectedTenant}
          onClose={() => {
            setShowProfile(false);
            setSelectedTenant(null);
          }}
          paymentSummary={paymentSummaryData as PaymentSummary | null}
          isLoading={isPaymentSummaryLoading}
          error={paymentSummaryError}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTenantToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Tenant"
        message="Are you sure you want to delete this tenant? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setTenantToDeactivate(null);
        }}
        onConfirm={handleDeactivate}
        title="Deactivate Tenant"
        message="Are you sure you want to deactivate this tenant? They will no longer be able to access the system."
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="warning"
      />

      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => {
          setShowActivateModal(false);
          setTenantToActivate(null);
        }}
        onConfirm={handleActivate}
        title="Activate Tenant"
        message="Are you sure you want to activate this tenant? They will regain access to the system."
        confirmText="Activate"
        cancelText="Cancel"
        variant="primary"
      />
    </div>
  );
};

export default Tenants;