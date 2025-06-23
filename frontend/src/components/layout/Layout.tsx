import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Header from '../common/header';
import Sidebar from '../common/sidebar';
import Footer from '../common/footer';
import { AudioPlayer } from '../player';
import { useAudioPlayerStore } from '../../store/audioPlayerStore';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentTrack } = useAudioPlayerStore();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header onMenuClick={toggleSidebar} />
      
      <div className="flex flex-grow pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Contenu principal avec marge fixe sur desktop et marge en bas sur mobile pour le lecteur */}
        <main className={`flex-grow transition-all duration-300 md:ml-64 ${currentTrack ? 'pb-20 md:pb-0' : ''}`}>
          <Outlet />
        </main>
      </div>
      
      {/* Lecteur audio */}
      {currentTrack && (
        <>
          {/* Version mobile - en bas de l'écran */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <AudioPlayer variant="mobile" />
          </div>
        </>
      )}
      
      {/* Footer avec marge fixe sur desktop correspondant à la sidebar */}
      <div className="md:ml-64 transition-all duration-300">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;