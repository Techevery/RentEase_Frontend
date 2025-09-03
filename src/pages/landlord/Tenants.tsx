import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Home, Calendar, CreditCard, Edit2, Trash2, FileText, TrendingUp } from 'lucide-react';
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

const TenantForm: React.FC<{
  initial?: Partial<Tenant>;
  onSubmit: (data: Partial<Tenant>) => void;
  onClose: () => void;
}> = ({ initial = {}, onSubmit, onClose }) => {
  const [form, setForm] = useState<Partial<Tenant>>({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    property: initial.property?._id || initial.property || '',
    leaseStartDate: initial.leaseStartDate || '',
    leaseEndDate: initial.leaseEndDate || '',
    rentAmount: initial.rentAmount ?? 0,
    emergencyContact: initial.emergencyContact || '',
    // landlordId: initial.landlordId || '',
  });

  const { data: housesData } = useGetHousesQuery({});
  const houses = housesData?.data || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'rentAmount' ? Number(value) : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">{initial._id ? 'Edit' : 'Add'} Tenant</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4"
        >
          <input 
            name="name" 
            placeholder="Name" 
            value={form.name} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2" 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            type="email" 
            className="w-full border rounded px-3 py-2" 
            required 
          />
          <input 
            name="phone" 
            placeholder="Phone" 
            value={form.phone} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2" 
            required 
          />
          <input 
            name="emergencyContact" 
            placeholder="Emergency Contact" 
            value={form.emergencyContact} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2" 
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select 
              name="property" 
              value={form.property as string} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2" 
              required
            >
              <option value="">Select Property</option>
              {houses.map((house: { _id: string; name: string }) => (
                <option key={house._id} value={house._id}>{house.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
              <input 
                name="leaseStartDate" 
                type="date" 
                value={form.leaseStartDate as string} 
                onChange={handleDateChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
              <input 
                name="leaseEndDate" 
                type="date" 
                value={form.leaseEndDate as string} 
                onChange={handleDateChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount (per year)</label>
            <input 
              name="rentAmount" 
              type="number" 
              value={form.rentAmount} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              min={0} 
              required 
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initial._id ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TenantProfileModal: React.FC<{
  tenant: Tenant;
  onClose: () => void;
}> = ({ tenant, onClose }) => {
  const { data: paymentSummary, isLoading, error } = useGetTenantPaymentSummaryQuery(tenant._id);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount?.toLocaleString()}`;
  };

  // Helper function to get property name safely
  const getPropertyName = (property: Tenant['property']) => {
    if (typeof property === 'string') {
      return 'Property not found';
    }
    return property?.name || 'Property not found';
  };

  // Helper function to safely format payment date
  const formatPaymentDate = (payment: any) => {
    
    const dateFields = ['createdAt', 'date', 'paymentDate', 'created', 'timestamp'];
    
    for (const field of dateFields) {
      if (payment[field] && !isNaN(new Date(payment[field]).getTime())) {
        return new Date(payment[field]).toLocaleDateString();
      }
    }
    
    return 'Date not available';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg my-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Tenant Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tenant Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Tenant Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-2xl font-semibold text-blue-800">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{tenant.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Mail size={16} className="mr-3 text-gray-500" /> 
                  <span>{tenant.email}</span>
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
                  <span>{getPropertyName(tenant.property)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar size={16} className="mr-3 text-gray-500" /> 
                  <span>
                    Lease: {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CreditCard size={16} className="mr-3 text-gray-500" /> 
                  <span>Rent: {formatCurrency(tenant.rentAmount)}/year</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Payment Information</h3>
            
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                Failed to load payment information. Please try again.
              </div>
            )}
            
            {paymentSummary && paymentSummary.success && (
              <div className="space-y-6">
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <TrendingUp size={16} className="mr-2" />
                    Payment Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {paymentSummary.data.summary.totalPayments}
                      </div>
                      <div className="text-sm text-gray-600">Total Payments</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(paymentSummary.data.summary.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Status Breakdown</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-700">
                        {paymentSummary.data.summary.approved.count}
                      </div>
                      <div className="text-xs text-green-600">Approved</div>
                      <div className="text-xs text-green-500">
                        {formatCurrency(paymentSummary.data.summary.approved.amount)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-700">
                        {paymentSummary.data.summary.pending.count}
                      </div>
                      <div className="text-xs text-yellow-600">Pending</div>
                      <div className="text-xs text-yellow-500">
                        {formatCurrency(paymentSummary.data.summary.pending.amount)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-700">
                        {paymentSummary.data.summary.rejected.count}
                      </div>
                      <div className="text-xs text-red-600">Rejected</div>
                      <div className="text-xs text-red-500">
                        {formatCurrency(paymentSummary.data.summary.rejected.amount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {paymentSummary.data.recentActivity && paymentSummary.data.recentActivity.payments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Recent Activity ({paymentSummary.data.recentActivity.period})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {paymentSummary.data.recentActivity.payments.slice(0, 5).map((payment: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                          <span className="text-gray-700">
                            {formatPaymentDate(payment)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const LandlordTenants = () => {
  const { data, refetch } = useGetTenantsQuery({});
  const [createTenant] = useCreateTenantMutation();
  const [updateTenant] = useUpdateTenantMutation();
  const [deleteTenant] = useDeleteTenantMutation();
  const [deactivateTenant] = useDeactivateTenantMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [profileTenant, setProfileTenant] = useState<Tenant | null>(null);

  const tenants = data?.data || [];

  const handleFormSubmit = async (formData: Partial<Tenant>) => {
    try {
      if (editing?._id) {
        await updateTenant({ id: editing._id, ...formData }).unwrap();
        toast.success('Tenant updated successfully!');
      } else {
        await createTenant(formData).unwrap();
        toast.success('Tenant created successfully!');
      }
      refetch();
      setShowForm(false);
      setEditing(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to save tenant:', error);
      toast.error(error.data?.message || 'Invalid Information, please review and save again');
    }
  };

  const handleDelete = async (id: string, mode: 'delete' | 'deactivate' = 'delete') => {
    try {
      if (mode === 'deactivate') {
        await deactivateTenant(id).unwrap();
        toast.success('Tenant deactivated successfully!');
      } else {
        await deleteTenant({ id }).unwrap();
        toast.success('Tenant deleted successfully!');
      }
      refetch();
      setDeleteId(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`Failed to ${mode} tenant:`, error);
      toast.error(error.data?.message || `Failed to ${mode} tenant`);
    }
  };

  const toggleTenantStatus = async (tenant: Tenant) => {
    try {
      const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
      await updateTenant({ id: tenant._id, status: newStatus }).unwrap();
      refetch();
      toast.success(`Tenant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to update tenant status:', error);
      toast.error(error.data?.message || 'Failed to update tenant status');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get property name safely
  const getPropertyName = (property: Tenant['property']) => {
    if (typeof property === 'string') {
      return 'Property not found';
    }
    return property?.name || 'Property not found';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <Button 
          variant="primary" 
          icon={<UserPlus size={20} />} 
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          Add Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {tenants.map((tenant: Tenant) => (
          <Card key={tenant._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-800">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={tenant.status === 'active' ? 'outline' : 'secondary'} 
                  size="sm" 
                  onClick={() => toggleTenantStatus(tenant)}
                >
                  {tenant.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditing(tenant);
                    setShowForm(true);
                  }}
                >
                  <Edit2 size={16} />
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => setDeleteId(tenant._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" /> 
                <span className="text-sm">{tenant.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone size={16} className="mr-2" /> 
                <span className="text-sm">{tenant.phone}</span>
              </div>
              {tenant.emergencyContact && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" /> 
                  <span className="text-sm">Emergency: {tenant.emergencyContact}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Home size={16} className="mr-2" /> 
                <span className="text-sm">{getPropertyName(tenant.property)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" /> 
                <span className="text-sm">
                  Lease: {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <CreditCard size={16} className="mr-2" /> 
                <span className="text-sm">₦{tenant.rentAmount?.toLocaleString()}/yr</span>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <Button 
                variant="primary" 
                size="sm" 
                fullWidth 
                onClick={() => setProfileTenant(tenant)}
               
              >
                View Profile & Payments
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <TenantForm
          initial={editing || undefined}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">Manage Tenant</h2>
            <p className="mb-6 text-center text-gray-700">
              Choose how to handle this tenant:
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                variant="danger" 
                onClick={() => handleDelete(deleteId)}
                className="w-full"
              >
               Delete
              </Button>
            
              <Button 
                variant="secondary" 
                onClick={() => setDeleteId(null)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {profileTenant && (
        <TenantProfileModal
          tenant={profileTenant}
          onClose={() => setProfileTenant(null)}
        />
      )}
    </div>
  );
};

export default LandlordTenants;