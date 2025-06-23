import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  FiHome, 
  FiBookOpen, 
  FiList, 
  FiPlus, 
  FiClock, 
  FiSearch,
  FiUser,
  FiUpload
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { usePlaylistData } from '../../hooks/usePlaylist';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    playlists: true,
    recentlyAdded: false
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playlists } = usePlaylistData();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose?.();
    }
  };

  const mainNavItems = [
    { name: 'Accueil', icon: <FiHome />, path: '/' },
    { name: 'Bibliothèque', icon: <FiBookOpen />, path: '/library' },
    { name: 'Récemment ajoutés', icon: <FiClock />, path: '/recently-added' },
    { name: 'Playlists', icon: <FiList />, path: '/playlists' },
    { name: 'Upload', icon: <FiUpload />, path: '/upload' }
  ];

  // Adaptative CSS class depending on the context (mobile or desktop)
  const sidebarClasses = `
    top-16 z-40 overflow-y-auto
    bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
    transition-all duration-300
    md:fixed md:left-0 md:bottom-0 md:w-64
    md:max-h-[calc(100vh-4rem)] md:block
    ${isOpen 
      ? 'fixed left-0 bottom-0 w-64 max-h-[calc(100vh-4rem)]' 
      : 'hidden'
    }
  `;

  return (
    <>
      {/* Overlay uniquement pour mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="p-4">
          {/* Section de recherche - Mobile uniquement */}
          <div className="mb-6 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Actions rapides - Surtout utile sur mobile */}
          <div className="mb-6 md:hidden">
            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 px-2">
              <button 
                onClick={() => {
                  // TODO: Implémenter la recherche
                  onClose?.();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FiSearch className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Rechercher</span>
              </button>
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    navigate('/profile');
                    onClose?.();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiUser className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Profil</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    navigate('/login');
                    onClose?.();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiUser className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Connexion</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="mb-6">
            <ul>
              {mainNavItems.map((item) => (
                <li key={item.path} className="mb-1">
                  <Link 
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Playlists */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between px-3 mb-2 cursor-pointer"
              onClick={() => toggleSection('playlists')}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Mes Playlists
              </h3>
              <span className={`transform transition-transform ${expandedSections.playlists ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>
            
            {expandedSections.playlists && (
              <>
                <button
                  onClick={() => {
                    onClose?.();
                    navigate('/playlists?create=true');
                  }}
                  className="w-full flex items-center px-3 py-2 mb-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiPlus className="mr-3" />
                  <span>Nouvelle playlist</span>
                </button>
                
                <ul className="max-h-60 overflow-y-auto scrollbar-thin">
                  {playlists.length > 0 ? (
                    playlists.slice(0, 10).map((playlist) => {
                      const playlistPath = `/playlists/${encodeURIComponent(playlist.id)}`;
                      return (
                        <li key={playlist.id} className="mb-1">
                          <Link 
                            to={playlistPath}
                            onClick={onClose}
                            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive(playlistPath)
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            <FiList className="mr-3 flex-shrink-0" />
                            <span className="truncate">{playlist.name}</span>
                          </Link>
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-3 py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aucune playlist
                      </p>
                    </li>
                  )}
                  
                  {playlists.length > 10 && (
                    <li className="mt-2">
                      <Link
                        to="/playlists"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 rounded-md text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Voir toutes les playlists ({playlists.length})
                      </Link>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;