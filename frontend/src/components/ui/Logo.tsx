import { Link } from 'react-router';
import { IoMdMusicalNote } from 'react-icons/io';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const Logo = ({ size = 'md', showText = true, className = '', linkTo = '/' }: LogoProps) => {
  const sizeConfig = {
    sm: {
      icon: 'h-6 w-6',
      text: 'text-lg'
    },
    md: {
      icon: 'h-8 w-8',
      text: 'text-xl'
    },
    lg: {
      icon: 'h-12 w-12',
      text: 'text-3xl'
    }
  };
  
  const config = sizeConfig[size];
  
  const LogoContent = () => (
    <div className={`flex items-center ${className}`}>
      <IoMdMusicalNote className={`${config.icon} text-blue-600 dark:text-blue-400`} />
      {showText && (
        <span className={`ml-2 ${config.text} font-semibold text-gray-800 dark:text-white`}>
          Sinuzoid
        </span>
      )}
    </div>
  );
  
  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    );
  }
  
  return <LogoContent />;
};

export default Logo;
