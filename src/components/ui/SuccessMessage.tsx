import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
      <p className="text-green-800 font-medium">{message}</p>
    </div>
  );
};

export default SuccessMessage;