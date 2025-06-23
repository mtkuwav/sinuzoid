import { useState, forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Input from './Input';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'rounded' | 'underline';
  showToggle?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  showToggle = true,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const rightIcon = showToggle ? (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
    >
      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
    </button>
  ) : undefined;
  
  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      label={label}
      error={error}
      helperText={helperText}
      variant={variant}
      rightIcon={rightIcon}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
