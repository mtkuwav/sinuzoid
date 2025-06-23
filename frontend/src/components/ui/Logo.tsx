import { Link } from 'react-router';
import LogoIcon from '../../assets/logos/logo_sinuzoid-cyan.svg?react';
import LogoWithText from '../../assets/logos/logo_sinuzoid_text-cyan.svg?react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  linkTo?: string;
  variant?: 'icon' | 'text' | 'both';
}

const Logo = ({ size = 'md', showText = true, className = '', linkTo = '/', variant = 'both' }: LogoProps) => {
  const sizeConfig = {
    sm: {
      icon: 'h-8 w-auto',
      text: 'h-6 w-auto',
      both: 'h-7 w-auto',
      spacing: 'space-x-2'
    },
    md: {
      icon: 'h-10 w-auto',
      text: 'h-7 w-auto', 
      both: 'h-8 w-auto',
      spacing: 'space-x-3'
    },
    lg: {
      icon: 'h-14 w-auto',
      text: 'h-10 w-auto',
      both: 'h-12 w-auto',
      spacing: 'space-x-4'
    }
  };
  
  const config = sizeConfig[size];
  
  const LogoContent = () => {
    // Si variant est 'text', on utilise directement le logo avec texte
    if (variant === 'text') {
      return (
        <div className={`flex items-center ${className}`}>
          <LogoWithText 
            className={`${config.text} fill-blue-600 dark:fill-blue-400`}
          />
        </div>
      );
    }
    
    // Si variant est 'icon', on utilise seulement l'icône
    if (variant === 'icon') {
      return (
        <div className={`flex items-center ${className}`}>
          <LogoIcon 
            className={`${config.icon} fill-blue-600 dark:fill-blue-400`}
          />
        </div>
      );
    }
    
    // Si variant est 'both' (défaut), on utilise l'icône + texte SVG séparé
    return (
      <div className={`flex items-center ${config.spacing} ${className}`}>
        <LogoIcon 
          className={`${config.icon} fill-blue-600 dark:fill-blue-400`}
        />
        {showText && (
          <LogoWithText 
            className={`${config.text} fill-blue-600 dark:fill-blue-400`}
          />
        )}
      </div>
    );
  };
  
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
