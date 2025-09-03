
import { ReactNode } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  success: 'bg-green-50 text-green-800 border-green-100',
  error: 'bg-red-50 text-red-800 border-red-100',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-100',
  info: 'bg-blue-50 text-blue-800 border-blue-100',
};

const variantIcons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const Alert = ({
  variant = 'info',
  children,
  className = '',
  icon,
  dismissible = false,
  onDismiss,
}: AlertProps) => {
  const IconComponent = icon || variantIcons[variant];

  return (
    <div
      className={`${variantStyles[variant]} ${className} rounded-md border p-4 relative`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{IconComponent}</div>
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;