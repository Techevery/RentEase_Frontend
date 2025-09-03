import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = {
  label?: string;
  type?: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-md shadow-sm border ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${
            icon ? 'pl-10' : 'pl-3'
          } py-2 focus:ring-blue-500 focus:border-blue-500 ${
            isPasswordField ? 'pr-10' : 'pr-3'
          } ${
            disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
          }`}
        />
        {isPasswordField && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;