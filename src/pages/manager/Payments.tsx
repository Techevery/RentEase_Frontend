import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Search, Filter, Upload, Download, X, RefreshCw, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
} from '../../redux/services/paymentApi';
import {
  useGetManagedPropertiesQuery,
} from '../../redux/services/managerApi';

interface BackendPayment {
  _id: string;
  amount: number;
  paymentDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentMethod: string;
  paymentTypes: string[];
  receiptUrl?: string;
  tenantId: { name: string } | null;
  houseId: { name: string } | null;
  flatId: { number: string } | null;
}

interface Payment {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  date: string;
  status: string;
  method: string;
  paymentTypes: string[];
}

interface Tenant {
  _id: string;
  name: string;
}

interface Unit {
  _id: string;
  number: string;
  tenant?: Tenant;
}

interface Property {
  _id: string;
  name: string;
  units: Unit[];
}

const transformPayment = (payment: BackendPayment): Payment => ({
  id: payment._id,
  tenant: payment.tenantId?.name || 'Unknown Tenant',
  property: payment.houseId?.name || 'Unknown Property',
  unit: payment.flatId?.number || 'Unknown Unit',
  amount: payment.amount,
  date: payment.paymentDate,
  status: payment.status.toLowerCase(), 
  method: payment.paymentMethod,
  paymentTypes: payment.paymentTypes || ['Rent'],
});

interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const PaymentTypeCheckbox: React.FC<{
  type: string;
  label: string;
  checked: boolean;
  onChange: (type: string, checked: boolean) => void;
}> = ({ type, label, checked, onChange }) => (
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(type, e.target.checked)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-sm">{label}</span>
  </label>
);

const UploadPaymentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, loading }) => {
  const { 
    data: propertiesData, 
    isLoading: isLoadingProperties, 
    isError: isPropertiesError,
  } = useGetManagedPropertiesQuery(undefined, { 
    refetchOnMountOrArgChange: true, 
    refetchOnReconnect: true, 
    pollingInterval: 10000 
  });

  const houses = propertiesData?.data?.properties || [];
  
  const [form, setForm] = useState({
    tenantId: '',
    flatId: '',  
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    description: '',
    receipt: null as File | null,
    propertyId: '',
    paymentTypes: ['Rent'] as string[],
  });
  
  const [receiptUrl, setReceiptUrl] = useState('');

  // Payment type options
  const paymentTypeOptions = [
    { value: 'Rent', label: 'Rent' },
    { value: 'Service Charge', label: 'Service Charge' },
    { value: 'Caution', label: 'Caution' },
    { value: 'Agency', label: 'Agency' },
    { value: 'Legal', label: 'Legal (Agreement)' },
  ];

  // Get all units and tenants from the selected property
  const { units, tenants } = useMemo(() => {
    if (!form.propertyId || !propertiesData) {
      return { units: [], tenants: [] };
    }
    
    const house = propertiesData?.data?.properties.find(p => p._id === form.propertyId);
    if (!house) {
      return { units: [], tenants: [] };
    }
    
    const unitsWithTenants = house.flats || [];
    const tenantsList: Tenant[] = [];
    
    // Extract tenants from occupied flats
    unitsWithTenants.forEach((flat: { tenant: Tenant; }) => {
      if (flat.tenant) {
        tenantsList.push(flat.tenant);
      }
    });
    
    return {
      units: unitsWithTenants,
      tenants: tenantsList
    };
  }, [form.propertyId, propertiesData]);

  useEffect(() => {
    if (form.propertyId) {
      setForm(prev => ({
        ...prev,
        flatId: '',
        tenantId: ''
      }));
    }
  }, [form.propertyId]);

  useEffect(() => {
    if (form.flatId && form.propertyId) {
      // Find the tenant for the selected unit
      const selectedUnit = units.find((u: Unit) => u._id === form.flatId);
      if (selectedUnit?.tenant) {
        setForm(prev => ({
          ...prev,
          tenantId: selectedUnit.tenant._id
        }));
      }
    }
  }, [form.flatId, form.propertyId, units]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;

    if (name === 'propertyId') {
      setForm(prev => ({
        ...prev,
        propertyId: value,
        flatId: '',
        tenantId: '',
      }));
    }
    else if (name === 'flatId') {
      setForm(prev => ({
        ...prev,
        flatId: value,
      }));
    } else if (name === 'receipt' && target instanceof HTMLInputElement && target.files && target.files[0]) {
      const file = target.files[0];
      setForm((prev) => ({
        ...prev,
        receipt: file,
      }));
      setReceiptUrl(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePaymentTypeChange = (type: string, checked: boolean) => {
    setForm(prev => {
      if (checked) {
        // Add the payment type if checked
        return {
          ...prev,
          paymentTypes: [...prev.paymentTypes, type]
        };
      } else {
        // Remove the payment type if unchecked, but ensure at least one remains
        const filteredTypes = prev.paymentTypes.filter(t => t !== type);
        return {
          ...prev,
          paymentTypes: filteredTypes.length > 0 ? filteredTypes : ['Rent']
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    
    // Append all form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'receipt' && value instanceof File) {
          formData.append('receipt', value);
        } else if (key === 'paymentTypes' && Array.isArray(value)) {
          // Append each payment type as a separate field
          value.forEach(type => {
            formData.append('paymentTypes', type);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    onSubmit(formData);
    onClose();
  };

  if (!open) return null;
  
  const selectedTenant = tenants.find((t: Tenant) => t._id === form.tenantId);
  const selectedUnit = units.find((u: Unit) => u._id === form.flatId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center mt-4">Upload Payment</h2>
        <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm mb-1">Property</label>
              <select 
                name="propertyId" 
                value={form.propertyId} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required
                disabled={isLoadingProperties || isPropertiesError}
              >
                {isLoadingProperties ? (
                  <option value="">Loading Properties...</option>
                ) : isPropertiesError ? (
                  <option value="">Error loading properties</option>
                ) : houses.length === 0 ? (
                  <option value="">No properties available</option>
                ) : (
                  <>
                    <option value="">Select Property</option>
                    {houses.map((house) => (
                      <option key={house._id} value={house._id}>
                        {house.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Unit</label>
              <select 
                name="flatId" 
                value={form.flatId} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required
                disabled={!form.propertyId || isLoadingProperties}
              >
                {isLoadingProperties ? (
                  <option value="">Loading Units...</option>
                ) : (
                  <>
                    <option value="">Select Unit</option>
                    {units.map((unit: Unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.number} 
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Tenant</label>
              <input
                name="tenant"
                placeholder="Tenant"
                value={selectedTenant?.name || 'No tenant assigned to this unit'}
                className="w-full border rounded px-3 py-2 bg-gray-100"
                readOnly
              />
              <input
                type="hidden"
                name="tenantId"
                value={form.tenantId}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Amount</label>
              <input
                name="amount"
                placeholder="Amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Unit Number</label>
              <input
                name="unit"
                placeholder="Unit"
                value={selectedUnit?.number || ''}
                className="w-full border rounded px-3 py-2 bg-gray-100"
                readOnly
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Payment Date</label>
              <input
                name="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Due Date</label>
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Payment For</label>
            <div className="grid grid-cols-2 gap-2 p-2 border rounded">
              {paymentTypeOptions.map((option) => (
                <PaymentTypeCheckbox
                  key={option.value}
                  type={option.value}
                  label={option.label}
                  checked={form.paymentTypes.includes(option.value)}
                  onChange={handlePaymentTypeChange}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border rounded px-3 py-2"
              required
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Upload Receipt</label>
            <input
              name="receipt"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
              required={form.paymentMethod === 'Bank Transfer'}
            />
            {receiptUrl && (
              <img
                src={receiptUrl}
                alt="Receipt Preview"
                className="mt-2 w-full max-w-xs object-cover border rounded"
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || isLoadingProperties || !form.tenantId}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManagerPayments: React.FC = () => {
  const { 
    data: paymentsData, 
    isLoading, 
    isError, 
    refetch 
  } = useGetPaymentsQuery({}, {
    pollingInterval: 60000 
  });
  
  const [createPayment, { isLoading: isUploading }] = useCreatePaymentMutation();
  const [showUpload, setShowUpload] = useState(false);

  const handleExport = () => {
    if (!paymentsData) return;
    
    const payments = (paymentsData as any).data?.map(transformPayment) || [];
    
    const csvRows = [
      ['Tenant', 'Property', 'Unit', 'Amount', 'Date', 'Status', 'Method', 'Payment Types'].join(','),
      ...payments.map((p: Payment) =>
        [
          `"${p.tenant}"`,
          `"${p.property}"`,
          `"${p.unit}"`,
          p.amount,
          p.date,
          p.status,
          `"${p.method}"`,
          `"${p.paymentTypes.join(', ')}"`,
        ].join(',')
      ),
    ];
    
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'payments.csv');
    link.click();
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading payments...</div>;
  }
  
  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load payments.</div>;
  }

  const backendPayments = (paymentsData as any)?.data || [];
  const payments: Payment[] = backendPayments.map(transformPayment);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Upload and track tenant payments</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            icon={<Download size={20} />} 
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Upload size={20} />}
            onClick={() => setShowUpload(true)}
          >
            Upload Payment
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw size={20} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex-1">
              <Input
                id="search"
                name="search"
                type="text"
                placeholder="Search payments..."
                value=""
                onChange={() => {}}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" icon={<Filter size={18} />}>
                More Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment For
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.tenant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.property} - {payment.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CreditCard size={16} className="mr-2" />
                        {payment.method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentTypes.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {payments.length} payments
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <UploadPaymentModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={async (formData) => {
          await createPayment(formData);
        }}
        loading={isUploading}
      />
    </div>
  );
};

export default ManagerPayments;