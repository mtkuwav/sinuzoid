import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const Footer: React.FC = () => {
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

  return (
    <footer className="left-0 right-0 w-full bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and brief description */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sinuzoid</h3>
            <p className="text-sm">Une plateforme innovante pour tous vos besoins musicaux.</p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-medium mb-4 text-gray-800 dark:text-white">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-blue-500 transition-colors">Accueil</a></li>
              <li><a href="/about" className="hover:text-blue-500 transition-colors">À propos</a></li>
              <li><a href="/services" className="hover:text-blue-500 transition-colors">Services</a></li>
              <li><a href="/contact" className="hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* GitHub Links */}
          <div className="col-span-1">
            <h4 className="font-medium mb-4 text-gray-800 dark:text-white">GitHub</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/mtkuwav" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors"
                >
                  Mon profil GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/mtkuwav/sinuzoid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors"
                >
                  Code source du projet
                </a>
              </li>
            </ul>
          </div>

          {/* Theme Toggle */}
          <div className="col-span-1">
            <h4 className="font-medium mb-4 text-gray-800 dark:text-white">Thème</h4>
            
            {/* Theme Toggle Button */}
            <div className="mt-2">
              <button 
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? 
                  <><FiSun className="text-yellow-500" /> <span>Mode clair</span></> : 
                  <><FiMoon className="text-blue-500" /> <span>Mode sombre</span></>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>Créé par <a href="https://github.com/mtkuwav" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors">mtkuwav</a> • Sous licence GPLv3 • {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;