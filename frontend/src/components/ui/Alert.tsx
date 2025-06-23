import { ReactNode } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle } from 'react-icons/fi';

interface AlertProps {
  children: ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  className?: string;
}

const Alert = ({ children, type = 'info', title, className = '' }: AlertProps) => {
  const baseClasses = 'p-4 rounded-md border';
  
  const typeConfig = {
    success: {
      classes: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      icon: <FiCheckCircle className="w-5 h-5 text-green-400 dark:text-green-500" />
    },
    error: {
      classes: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
      icon: <FiXCircle className="w-5 h-5 text-red-400 dark:text-red-500" />
    },
    warning: {
      classes: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
      icon: <FiAlertCircle className="w-5 h-5 text-yellow-400 dark:text-yellow-500" />
    },
    info: {
      classes: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      icon: <FiInfo className="w-5 h-5 text-blue-400 dark:text-blue-500" />
    }
  };
  
  const config = typeConfig[type];
  const classes = `${baseClasses} ${config.classes} ${className}`.trim();
  
  return (
    <div className={classes}>
      <div className="flex">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? '' : 'mt-0'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
