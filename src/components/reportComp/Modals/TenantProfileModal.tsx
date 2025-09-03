import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { useGetTenantPaymentSummaryQuery } from '../../../redux/services/paymentApi';
import { format } from 'date-fns';

interface TenantProfileModalProps {
  tenantId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPayments: (tenantId: string) => void;
}

const TenantProfileModal: React.FC<TenantProfileModalProps> = ({
  tenantId,
  isOpen,
  onClose,
  onViewPayments
}) => {
  const { data: tenantData, isLoading } = useGetTenantPaymentSummaryQuery(tenantId || '', {
    skip: !tenantId
  });

  if (!tenantId) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Tenant Profile">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  const tenant = tenantData?.data?.tenant;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tenant Profile">
      {tenant ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent Amount</label>
              <p className="mt-1 text-sm text-gray-900">₦{tenant.rentAmount.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lease Period</label>
              <p className="mt-1 text-sm text-gray-900">
                {format(new Date(tenant.leaseStart), 'MMM dd, yyyy')} - {format(new Date(tenant.leaseEnd), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.status}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onViewPayments(tenantId)}>
              View Payment History
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Tenant not found</p>
      )}
    </Modal>
  );
};

export default TenantProfileModal;