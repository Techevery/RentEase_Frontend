import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null, event?: React.SyntheticEvent<any> | undefined) => void;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholderText?: string;
  isClearable?: boolean;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  selectsStart,
  selectsEnd,
  startDate,
  endDate,
  minDate,
  maxDate,
  className = '',
  placeholderText,
  isClearable = false,
  disabled = false,
}) => {
  
  const getSafeDate = (date: Date | null | undefined): Date | undefined => {
    return date instanceof Date ? date : undefined;
  };

  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      selectsStart={selectsStart}
      selectsEnd={selectsEnd}
      startDate={getSafeDate(startDate)}
      endDate={getSafeDate(endDate)}
      minDate={minDate} 
      maxDate={maxDate} 
      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
      dateFormat="yyyy-MM-dd"
      placeholderText={placeholderText}
      isClearable={isClearable}
      disabled={disabled}
    />
  );
};

export default DatePicker;