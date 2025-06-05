import React, { useState } from 'react';
import { 
  FiHome, 
  FiCompass, 
  FiBookOpen, 
  FiRadio, 
  FiList, 
  FiPlus, 
  FiHeart, 
  FiClock, 
  FiDownload,
  FiSearch,
  FiBell,
  FiUser
} from 'react-icons/fi';
import { IoMdMusicalNote } from 'react-icons/io';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false,  // Changement ici - défaut à false pour correspondre à l'état initial dans App.tsx
  onClose,
  className = "" 
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    playlists: true,
    recentlyAdded: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const mainNavItems = [
    { name: 'Accueil', icon: <FiHome />, path: '/' },
    { name: 'Découvrir', icon: <FiCompass />, path: '/discover' },
    { name: 'Bibliothèque', icon: <FiBookOpen />, path: '/library' },
    { name: 'Radio', icon: <FiRadio />, path: '/radio' }
  ];
  
  const libraryItems = [
    { name: 'Récemment ajoutés', icon: <FiClock />, path: '/recently-added' },
    { name: 'Morceaux favoris', icon: <FiHeart />, path: '/favorites' },
    { name: 'Téléchargements', icon: <FiDownload />, path: '/downloads' },
  ];

  const playlists = [
    { name: 'Mes favoris', path: '/playlist/favorites' },
    { name: 'Découvertes', path: '/playlist/discoveries' },
    { name: 'Rock classique', path: '/playlist/classic-rock' },
    { name: 'Jazz lounge', path: '/playlist/jazz' },
    { name: 'Pour méditer', path: '/playlist/meditation' }
  ];

  // Remplace la logique des classes conditionnelles
  const sidebarClasses = `
    fixed left-0 top-16 bottom-auto z-40
    bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
    transition-all duration-300 overflow-y-auto w-64
    max-h-[calc(100vh-16rem)]
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay pour mobile, visible uniquement si la sidebar est ouverte */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="p-4">
          {/* Logo mobile - visible uniquement sur petit écran */}
          <div className="flex items-center mb-6 lg:hidden">
            <IoMdMusicalNote className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Sinuzoid</span>
          </div>

          {/* Navigation principale */}
          <nav className="mb-6">
            <ul>
              {mainNavItems.map((item) => (
                <li key={item.path} className="mb-1">
                  <a 
                    href={item.path}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions rapides - Surtout utile sur mobile */}
          <div className="mb-6 md:hidden">
            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </h3>
            <div className="grid grid-cols-3 gap-2 px-2">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                <FiSearch className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs">Rechercher</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                <FiBell className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs">Notifications</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                <FiUser className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs">Profil</span>
              </button>
            </div>
          </div>

          {/* Ma Bibliothèque */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Ma Bibliothèque
            </h3>
            <ul>
              {libraryItems.map((item) => (
                <li key={item.path} className="mb-1">
                  <a 
                    href={item.path}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Playlists */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between px-3 mb-2 cursor-pointer"
              onClick={() => toggleSection('playlists')}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Playlists
              </h3>
              <span className={`transform transition-transform ${expandedSections.playlists ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>
            
            {expandedSections.playlists && (
              <>
                <a 
                  href="/playlists/create"
                  className="flex items-center px-3 py-2 mb-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiPlus className="mr-3" />
                  <span>Nouvelle playlist</span>
                </a>
                
                <ul className="max-h-60 overflow-y-auto scrollbar-thin">
                  {playlists.map((playlist, index) => (
                    <li key={index} className="mb-1">
                      <a 
                        href={playlist.path}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <FiList className="mr-3" />
                        <span className="truncate">{playlist.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

/*TODO:
- fix sidebar not opening on desktop
- fix sidebar layout on mobile
- fix sidebar height to match footer  */

export default Sidebar;