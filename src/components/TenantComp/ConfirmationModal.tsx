import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: 'danger' | 'warning' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  variant = 'primary' 
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    primary: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-full ${variantClasses[variant]} mr-3`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'}
            onClick={onConfirm}
            className="px-4 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;