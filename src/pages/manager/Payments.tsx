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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  success: boolean;
  data: BackendPayment[];
  count: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
    currentPage?: number;
    totalPages?: number;
  };
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
    } else if (name === 'receipt') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (file) {
        setForm(prev => ({ ...prev, receipt: file }));
        const url = URL.createObjectURL(file);
        setReceiptUrl(url);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentTypeChange = (type: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      paymentTypes: checked 
        ? [...prev.paymentTypes, type]
        : prev.paymentTypes.filter(t => t !== type)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('tenantId', form.tenantId);
    formData.append('flatId', form.flatId);
    formData.append('amount', form.amount);
    formData.append('paymentDate', form.paymentDate);
    formData.append('paymentMethod', form.paymentMethod);
    formData.append('description', form.description);
    formData.append('paymentTypes', JSON.stringify(form.paymentTypes));
    if (form.receipt) {
      formData.append('receipt', form.receipt);
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setForm({
      tenantId: '',
      flatId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      description: '',
      receipt: null,
      propertyId: '',
      paymentTypes: ['Rent'],
    });
    setReceiptUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Upload Payment Record</h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClose}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property *
                </label>
                <select
                  name="propertyId"
                  value={form.propertyId}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Property</option>
                  {houses.map((house: Property) => (
                    <option key={house._id} value={house._id}>
                      {house.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  name="flatId"
                  value={form.flatId}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={!form.propertyId}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit: Unit) => (
                    <option key={unit._id} value={unit._id}>
                      {unit.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant
              </label>
              <select
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant: Tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="POS">POS</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Payment description"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Types *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt (Optional)
              </label>
              <input
                type="file"
                name="receipt"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {receiptUrl && (
                <div className="mt-2">
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="max-w-full h-auto max-h-32 rounded border"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !form.tenantId || !form.amount || !form.paymentDate}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ManagerPayments: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch all payments by setting a large limit
  const { data, isLoading, isError, refetch } = useGetPaymentsQuery({ 
    page: 1, 
    limit: 1000 // Fetch a large number to get all payments
  }, {
    pollingInterval: 60000 
  });
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [displayedPayments, setDisplayedPayments] = useState<Payment[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination state for displayed results
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1
  });

  useEffect(() => {
    if (data) {
      const apiResponse = data as ApiResponse;
      const backendPayments = apiResponse?.data || [];
      const transformedPayments = backendPayments.map(transformPayment);
      
      setAllPayments(transformedPayments);
      setFilteredPayments(transformedPayments);
    }
  }, [data]);

  // Apply filters whenever search term, property, status, or payments change
  useEffect(() => {
    let result = [...allPayments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        payment.tenant.toLowerCase().includes(term) ||
        payment.property.toLowerCase().includes(term) ||
        payment.unit.toLowerCase().includes(term) ||
        payment.method.toLowerCase().includes(term) ||
        payment.amount.toString().includes(term)
      );
    }
    
    // Apply property filter
    if (selectedProperty !== 'all') {
      result = result.filter(payment => payment.property === selectedProperty);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(payment => payment.status === selectedStatus);
    }
    
    setFilteredPayments(result);
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / prev.itemsPerPage)
    }));
  }, [searchTerm, selectedProperty, selectedStatus, allPayments]);

  // Update displayed payments based on current pagination
  useEffect(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    setDisplayedPayments(filteredPayments.slice(startIndex, endIndex));
  }, [filteredPayments, pagination.currentPage, pagination.itemsPerPage]);

  const handleUploadPayment = async (formData: FormData) => {
    try {
      await createPayment(formData).unwrap();
      setUploadModalOpen(false);
      await refetch();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleExport = () => {
    const csvRows = [
      ['Tenant', 'Property', 'Unit', 'Amount', 'Date', 'Status', 'Method', 'Payment Types'].join(','),
      ...filteredPayments.map((p: Payment) =>
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextPage = () => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages)
    }));
  };

  const handlePrevPage = () => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1)
    }));
  };

  // Get unique properties and statuses for filter dropdowns
  const uniqueProperties = [...new Set(allPayments.map(p => p.property))].filter(Boolean);
  const statusOptions = ['pending', 'approved', 'rejected'];

  if (isLoading) {
    return <div className="p-8 text-center">Loading payments...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load payments.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage and track property payments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<Download size={20} />} onClick={handleExport}>
            Export
          </Button>
          <Button 
            variant="primary" 
            icon={<Upload size={20} />} 
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Payment
          </Button>
          <Button 
            variant="outline" 
            icon={<RefreshCw size={20} />} 
            onClick={() => {
              refetch();
            }}
            disabled={isLoading}
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
                placeholder="Search payments by tenant, property, unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex space-x-3">
              <select 
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="all">All Properties</option>
                {uniqueProperties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
              <select 
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
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
                    Payment Types
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedPayments.map((payment) => (
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
                      <div className="flex items-center">
                        <CreditCard size={16} className="mr-2" />
                        {payment.paymentTypes.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayedPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payments found matching your criteria.
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {displayedPayments.length} of {filteredPayments.length} payments
              {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.currentPage === pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <UploadPaymentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadPayment}
        loading={isCreating}
      />
    </div>
  );
};

export default ManagerPayments;