import React, { useEffect, useState } from 'react';
import { Check, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

type ToastProps = {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  // Configure toast appearance based on type
  const toastConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      icon: <Check className="w-5 h-5 text-green-500" />,
      progressColor: 'bg-green-500',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      progressColor: 'bg-red-500',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      progressColor: 'bg-yellow-500',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      progressColor: 'bg-blue-500',
    },
  };

  const config = toastConfig[type];

  // Entrance animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Progress bar effect
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 50); // 5000ms / 100 = 50ms per 1%

    return () => clearInterval(timer);
  }, []);

  // Close when progress reaches 0
  useEffect(() => {
    if (progress <= 0) {
      setIsVisible(false);
      setTimeout(onClose, 300); // Slight delay for exit animation
    }
  }, [progress, onClose]);

  return (
    <div
      className={`max-w-md w-full ${config.bgColor} border-l-4 ${
        config.borderColor
      } rounded-md shadow-md transition-all duration-300 ease-in-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{config.icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Slight delay for exit animation
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gray-200 rounded-b-md overflow-hidden">
        <div
          className={`h-full ${config.progressColor} transition-all ease-linear duration-50`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Toast;