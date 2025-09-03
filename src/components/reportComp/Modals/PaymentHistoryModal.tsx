import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useGetTenantPaymentSummaryQuery } from '../../../redux/services/paymentApi';
import { format } from 'date-fns';
import { Payment } from '../types';

interface PaymentHistoryModalProps {
  tenantId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  tenantId,
  isOpen,
  onClose
}) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { data: paymentData, isLoading } = useGetTenantPaymentSummaryQuery(tenantId || '', {
    skip: !tenantId
  });

  if (!tenantId) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Payment History">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  const payments = paymentData?.data?.allPayments || [];
  const summary = paymentData?.data?.summary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment History" size="lg">
      <div className="space-y-6">
        {/* Payment Summary */}
        {summary && (
          <Card>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-medium ml-2">{summary.totalPayments}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium ml-2">₦{summary.approved.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Approved:</span>
                  <span className="font-medium ml-2">
                    {summary.approved.count} (₦{summary.approved.amount.toLocaleString()})
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium ml-2">
                    {summary.pending.count} (₦{summary.pending.amount.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Payments List */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">All Payments</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')} • {payment.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600">{payment.description}</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  {payment.receiptUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      View Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Detail Modal */}
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="Payment Details"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">₦{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPayment.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedPayment.paymentDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedPayment.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Method</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.reference}</p>
                </div>
              </div>
              
              {selectedPayment.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.receiptUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt</label>
                  <div className="mt-2">
                    <img
                      src={selectedPayment.receiptUrl}
                      alt="Payment receipt"
                      className="max-w-full h-auto rounded-lg border"
                    />
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <p className="mt-1 text-sm text-red-600">{selectedPayment.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Modal>
  );
};

export default PaymentHistoryModal;