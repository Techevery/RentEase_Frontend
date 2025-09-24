import React from 'react';
import { Mail, Phone, Home, Calendar, CreditCard } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Tenant } from '../../types/index';

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

interface TenantProfileModalProps {
  tenant: Tenant;
  onClose: () => void;
  paymentSummary: PaymentSummary | null;
  isLoading: boolean;
  error: any;
}

const TenantProfileModal: React.FC<TenantProfileModalProps> = ({ 
  tenant, 
  onClose, 
  paymentSummary, 
  isLoading, 
  error 
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  // Helper function to get property name safely
  const getPropertyName = (property: Tenant['property']) => {
    if (typeof property === 'string') {
      return property || 'Property not found';
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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tenant Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tenant Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
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
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Fee Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Rent (Annual)</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(tenant.rentAmount)}
                  </p>
                </div>
                {(tenant.serviceCharge || 0) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Service Charge</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(tenant.serviceCharge)}
                    </p>
                  </div>
                )}
                {(tenant.cautionFee || 0) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Caution Fee (Refundable)</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(tenant.cautionFee)}
                    </p>
                  </div>
                )}
                {(tenant.agencyFee || 0) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Agency Fee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(tenant.agencyFee)}
                    </p>
                  </div>
                )}
                {(tenant.legalFee || 0) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Legal Fee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(tenant.legalFee)}
                    </p>
                  </div>
                )}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">Total (Annual)</p>
                  <p className="text-lg font-bold text-blue-800">
                    {formatCurrency(tenant.totalRent || tenant.rentAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenant.maritalStatus && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Marital Status:</span>
                    <span>{tenant.maritalStatus.charAt(0).toUpperCase() + tenant.maritalStatus.slice(1)}</span>
                  </div>
                )}
                {tenant.gender && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Gender:</span>
                    <span>{tenant.gender.charAt(0).toUpperCase() + tenant.gender.slice(1)}</span>
                  </div>
                )}
                {tenant.dateOfBirth && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Date of Birth:</span>
                    <span>{formatDate(tenant.dateOfBirth)}</span>
                  </div>
                )}
                {tenant.nationality && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Nationality:</span>
                    <span>{tenant.nationality}</span>
                  </div>
                )}
                {tenant.currentAddress && (
                  <div className="col-span-2 flex items-start text-gray-700">
                    <span className="font-medium mr-2 min-w-[140px]">Current Address:</span>
                    <span>{tenant.currentAddress}</span>
                  </div>
                )}
                {(tenant.yearsAtCurrentAddress || tenant.monthsAtCurrentAddress) && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Duration:</span>
                    <span>
                      {tenant.yearsAtCurrentAddress || 0} years, and  {tenant.monthsAtCurrentAddress || 0} months
                    </span>
                    
                  </div>
                )}
                {tenant.reasonForLeaving && (
                  <div className="col-span-2 flex items-start text-gray-700">
                    <span className="font-medium mr-2 min-w-[140px]">Reason for Leaving:</span>
                    <span>{tenant.reasonForLeaving}</span>
                  </div>
                )}
                {tenant.occupation && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Occupation:</span>
                    <span>{tenant.occupation}</span>
                  </div>
                )}
                {tenant.position && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Position:</span>
                    <span>{tenant.position}</span>
                  </div>
                )}
                {tenant.maritalStatus === 'married' && tenant.spouseName && (
                  <div className="col-span-2 flex items-center text-gray-700">
                    <span className="font-medium mr-2">Spouse's Name:</span>
                    <span>{tenant.spouseName}</span>
                  </div>
                )}
                {tenant.emergencyContactName && (
                  <div className="col-span-2 flex items-center text-gray-700">
                    <span className="font-medium mr-2">Emergency Contact:</span>
                    <span>{tenant.emergencyContactName}</span>
                  </div>
                )}
                {tenant.emergencyContactAddress && (
                  <div className="col-span-2 flex items-start text-gray-700">
                    <span className="font-medium mr-2 min-w-[140px]">Emergency Address:</span>
                    <span>{tenant.emergencyContactAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 sticky top-0">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Payment Information</h3>
              
              {isLoading && (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">Error loading payment information</p>
                </div>
              )}
              
              {paymentSummary && paymentSummary.success && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-600">Total Payments</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatCurrency(paymentSummary.data.summary.approved.amount)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-xl font-semibold text-green-600">
                          {formatCurrency(paymentSummary.data.summary.approved.amount)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-xl font-semibold text-yellow-600">
                          {formatCurrency(paymentSummary.data.summary.pending.amount)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-600">Rejected</p>
                        <p className="text-xl font-semibold text-red-600">
                          {formatCurrency(paymentSummary.data.summary.rejected.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Recent Activity</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {paymentSummary.data.recentActivity.payments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent payments</p>
                      ) : (
                        paymentSummary.data.recentActivity.payments.slice(0, 5).map((payment, index) => (
                          <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatCurrency(payment.amount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatPaymentDate(payment)}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenantProfileModal;