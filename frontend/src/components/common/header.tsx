import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { FiSearch, FiUser, FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { Logo, Button } from '../ui';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element)?.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Découvrir', path: '/discover' },
    { name: 'Bibliothèque', path: '/library' },
    { name: 'Radio', path: '/radio' },
    { name: 'Playlists', path: '/playlists' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" variant="both" linkTo="/" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Menu button - visible uniquement sur mobile */}
            <Button 
              variant="icon"
              size="md"
              className="md:hidden" 
              onClick={onMenuClick}
            >
              <FiMenu className="h-5 w-5" />
            </Button>
            
            {/* Icônes desktop uniquement */}
            <Button variant="icon" size="md" className="hidden md:block">
              <FiSearch className="h-5 w-5" />
            </Button>
            
            {isAuthenticated ? (
              <>
                {/* User dropdown - uniquement sur desktop */}
                <div className="relative user-menu hidden md:block">
                  <Button 
                    variant="icon"
                    size="md"
                    className="flex items-center space-x-2"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <FiUser className="h-5 w-5" />
                    <span className="hidden md:block text-sm font-medium">{user?.username}</span>
                  </Button>
                  
                  {userMenuOpen && (
                    <div className="fixed right-4 top-16 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-[9999]">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                          <div className="font-medium">{user?.username}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate('/profile');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-start"
                        >
                          Profil
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-start"
                        >
                          <FiLogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="nav" 
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Connexion
                </Button>
                <Button 
                  variant="nav" 
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  S'inscrire
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <div className="container mx-auto px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;