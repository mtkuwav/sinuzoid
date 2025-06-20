import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

const ThemeToggle = ({ className = '', size = 'md' }: ThemeToggleProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check for saved theme preference or use system preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDarkMode);
    applyTheme(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkModeState = !darkMode;
    setDarkMode(newDarkModeState);
    applyTheme(newDarkModeState);
    localStorage.setItem('darkMode', newDarkModeState.toString());
  };

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base'
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button 
      onClick={toggleDarkMode}
      className={`
        inline-flex items-center justify-center
        bg-gray-100 dark:bg-gray-800 
        hover:bg-gray-200 dark:hover:bg-gray-700 
        rounded-full transition-colors
        text-gray-600 dark:text-gray-300
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {darkMode ? 
        <FiSun className={`${iconSize} text-yellow-500`} /> : 
        <FiMoon className={`${iconSize} text-blue-500`} />
      }
    </button>
  );
};

export default ThemeToggle;
