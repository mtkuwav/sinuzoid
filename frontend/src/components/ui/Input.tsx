import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'rounded' | 'underline';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'block w-full px-3 py-2 border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800';
  
  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500',
    rounded: 'border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500',
    underline: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 rounded-none focus:ring-0 focus:border-blue-500 bg-transparent dark:bg-transparent'
  };
  
  const errorClasses = error ? 'border-red-300 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : '';
  
  const inputClasses = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`.trim();
  
  const hasIcons = leftIcon || rightIcon;
  const paddingClasses = hasIcons ? (leftIcon ? 'pl-10' : '') + (rightIcon ? ' pr-10' : '') : '';
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${inputClasses} ${paddingClasses}`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
