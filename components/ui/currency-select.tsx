import React from 'react';
import { getCurrencyOptions } from '@/lib/currencies';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencySelectProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'touch' | 'touch-sm';
}

export function CurrencySelect({
  id = 'currency',
  name = 'currency',
  value,
  defaultValue = 'USD',
  onChange,
  onBlur,
  required = false,
  disabled = false,
  className = '',
  label = 'Currency',
  helperText = 'Select your preferred currency',
  showIcon = true,
  size = 'md',
}: CurrencySelectProps) {
  const currencyOptions = getCurrencyOptions();
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
    'touch': 'px-4 py-3 text-base min-h-[48px]',
    'touch-sm': 'px-3 py-2.5 text-sm min-h-[44px]',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    'touch': 'w-4 h-4',
    'touch-sm': 'w-4 h-4',
  };

  const iconPositions = {
    sm: 'left-2.5',
    md: 'left-3',
    lg: 'left-3',
    'touch': 'left-3',
    'touch-sm': 'left-3',
  };

  const paddingWithIcon = {
    sm: 'pl-8',
    md: 'pl-10',
    lg: 'pl-11',
    'touch': 'pl-10',
    'touch-sm': 'pl-10',
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {showIcon && (
          <Coins
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
              iconSizes[size],
              iconPositions[size]
            )}
          />
        )}
        
        <select
          id={id}
          name={name}
          value={value}
          defaultValue={!value ? defaultValue : undefined}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={cn(
            'block w-full rounded-xl border border-input bg-background ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            sizeClasses[size],
            showIcon ? paddingWithIcon[size] : '',
            disabled ? 'bg-gray-50 text-gray-500' : '',
            className
          )}
        >
          {currencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {helperText && (
        <p className="text-sm text-gray-600 mt-1">{helperText}</p>
      )}
    </div>
  );
}

export default CurrencySelect;
