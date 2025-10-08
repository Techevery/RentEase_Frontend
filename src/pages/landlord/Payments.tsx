import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Download, Image as ImageIcon, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  useGetPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
} from '../../redux/services/paymentApi';

interface BackendPayment {
  _id: string;
  amount: number;
  paymentDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentMethod: string;
  paymentTypes: string[];
  receiptUrl?: string;
  tenantId: { name: string; _id: string } | null;
  houseId: { name: string; _id: string } | null;
  flatId: { number: string; _id: string } | null;
}

interface Payment {
  id: string;
  tenant: string;
  tenantId: string;
  property: string;
  propertyId: string;
  unit: string;
  unitId: string;
  amount: number;
  date: string;
  status: string;
  method: string;
  paymentTypes: string[];
  reference: string;
  receiptUrl?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
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
  tenantId: payment.tenantId?._id || '',
  property: payment.houseId?.name || 'Unknown Property',
  propertyId: payment.houseId?._id || '',
  unit: payment.flatId?.number || 'Unknown Unit',
  unitId: payment.flatId?._id || '',
  amount: payment.amount,
  date: payment.paymentDate,
  status: payment.status.toLowerCase(),
  method: payment.paymentMethod,
  paymentTypes: payment.paymentTypes || ['Rent'],
  reference: payment._id,
  receiptUrl: payment.receiptUrl,
  approvalStatus: payment.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
});

// New component to show all payments for a specific tenant and property
const TenantPropertyPaymentsModal: React.FC<{
  payments: Payment[];
  tenantName: string;
  propertyName: string;
  onClose: () => void;
}> = ({ payments, tenantName, propertyName, onClose }) => {
  const filteredPayments = payments.filter(p => 
    p.tenant === tenantName && p.property === propertyName
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Payment History for {tenantName} - {propertyName}
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {filteredPayments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No payments found for this tenant and property.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Types
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.approvalStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : payment.approvalStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentTypes.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentDetailsModal: React.FC<{
  payment: Payment | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
  onViewAllPayments?: (tenant: string, property: string) => void;
}> = ({ payment, onClose, onApprove, onReject, loading, onViewAllPayments }) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tenant</label>
                <p className="mt-1 text-sm text-gray-900">{payment.tenant}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Property</label>
                <p className="mt-1 text-sm text-gray-900">{payment.property}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Unit</label>
                <p className="mt-1 text-sm text-gray-900">{payment.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Amount</label>
                <p className="mt-1 text-sm text-gray-900">₦{payment.amount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(payment.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    payment.approvalStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : payment.approvalStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Payment Method</label>
              <p className="mt-1 text-sm text-gray-900">{payment.method}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Reference ID</label>
              <p className="mt-1 text-sm text-gray-900">{payment.reference}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Payment Types</label>
              <p className="mt-1 text-sm text-gray-900">{payment.paymentTypes.join(', ')}</p>
            </div>

            {payment.receiptUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Receipt</label>
                <div className="mt-2 border rounded-md p-2">
                  <img
                    src={payment.receiptUrl}
                    alt="Payment receipt"
                    className="max-w-full h-auto max-h-64 mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                    <ImageIcon className="mr-1" size={16} />
                    <span>Receipt Image</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                icon={<Eye size={16} />}
                onClick={() => onViewAllPayments?.(payment.tenant, payment.property)}
              >
                View All Payments
              </Button>
              <div className="flex space-x-2">
                {payment.method === 'Bank Transfer' && payment.approvalStatus === 'pending' && (
                  <>
                    <Button 
                      variant="success" 
                      onClick={() => onApprove?.(payment.id)} 
                      disabled={loading}
                    >
                      {loading ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => onReject?.(payment.id)} 
                      disabled={loading}
                    >
                      {loading ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </>
                )}
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandlordPayments: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, refetch } = useGetPaymentsQuery({ page: currentPage, limit: 10 }, {
    pollingInterval: 60000 
  });
  const [approvePayment, { isLoading: isApproving }] = useApprovePaymentMutation();
  const [rejectPayment, { isLoading: isRejecting }] = useRejectPaymentMutation();

  const [detailsPayment, setDetailsPayment] = useState<Payment | null>(null);
  const [tenantPropertyPayments, setTenantPropertyPayments] = useState<{tenant: string; property: string} | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (data) {
      const apiResponse = data as ApiResponse;
      const backendPayments = apiResponse?.data || [];
      const transformedPayments = backendPayments.map(transformPayment);
      
      setPayments(transformedPayments);
      setFilteredPayments(transformedPayments);
      
      // Set pagination info
      if (apiResponse.pagination) {
        const paginationData = apiResponse.pagination;
        setPagination({
          currentPage: paginationData.currentPage || currentPage,
          totalPages: paginationData.totalPages || Math.ceil(apiResponse.count / 10),
          totalCount: apiResponse.count || 0,
          hasNext: !!paginationData.next,
          hasPrev: !!paginationData.prev
        });
      } else {
        // Fallback if pagination data is not available
        setPagination({
          currentPage: currentPage,
          totalPages: Math.ceil(apiResponse.count / 10),
          totalCount: apiResponse.count || 0,
          hasNext: (currentPage * 10) < (apiResponse.count || 0),
          hasPrev: currentPage > 1
        });
      }
    }
  }, [data, currentPage]);

  // Apply filters whenever search term, property, status, or payments change
  useEffect(() => {
    let result = [...payments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        payment.tenant.toLowerCase().includes(term) ||
        payment.property.toLowerCase().includes(term) ||
        payment.unit.toLowerCase().includes(term) ||
        payment.reference.toLowerCase().includes(term) ||
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
      result = result.filter(payment => payment.approvalStatus === selectedStatus);
    }
    
    setFilteredPayments(result);
  }, [searchTerm, selectedProperty, selectedStatus, payments]);

  const handleApprove = async (id: string) => {
    try {
      await approvePayment(id);
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === id 
            ? { ...p, approvalStatus: 'approved', status: 'approved' } 
            : p
        )
      );
      setDetailsPayment(null);
      await refetch();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPayment({ id });
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === id 
            ? { ...p, approvalStatus: 'rejected', status: 'rejected' } 
            : p
        )
      );
      setDetailsPayment(null);
      await refetch();
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const handleViewAllPayments = (tenant: string, property: string) => {
    setTenantPropertyPayments({ tenant, property });
    setDetailsPayment(null);
  };

  const handleExport = () => {
    const csvRows = [
      ['Reference', 'Tenant', 'Property', 'Unit', 'Amount', 'Date', 'Status', 'Method', 'Payment Types'].join(','),
      ...filteredPayments.map((p: Payment) =>
        [
          p.reference,
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
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Get unique properties and statuses for filter dropdowns
  const uniqueProperties = [...new Set(payments.map(p => p.property))].filter(Boolean);
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
          <p className="text-gray-600">Manage and track all property payments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<Download size={20} />} onClick={handleExport}>
            Export
          </Button>
          <Button 
            variant="outline" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>} 
            onClick={() => {
              setCurrentPage(1);
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
                placeholder="Search payments by tenant, property, unit, reference..."
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
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
                          payment.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : payment.approvalStatus === 'rejected'
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDetailsPayment(payment)}
                      >
                        View
                      </Button>
                      <span className="ml-2">
                        {payment.approvalStatus === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(payment.id)}
                              disabled={isApproving}
                            >
                              {isApproving ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(payment.id)}
                              className="ml-1"
                              disabled={isRejecting}
                            >
                              {isRejecting ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payments found matching your criteria.
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredPayments.length} of {pagination.totalCount} payments
              {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={!pagination.hasPrev || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextPage}
                disabled={!pagination.hasNext || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <PaymentDetailsModal
        payment={detailsPayment}
        onClose={() => setDetailsPayment(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={isApproving || isRejecting}
        onViewAllPayments={handleViewAllPayments}
      />

      {tenantPropertyPayments && (
        <TenantPropertyPaymentsModal
          payments={payments}
          tenantName={tenantPropertyPayments.tenant}
          propertyName={tenantPropertyPayments.property}
          onClose={() => setTenantPropertyPayments(null)}
        />
      )}
    </div>
  );
};

export default LandlordPayments;