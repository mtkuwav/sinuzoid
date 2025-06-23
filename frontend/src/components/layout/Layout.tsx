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
      
      {/* Lecteur audio intégré dans le header */}
      {currentTrack && (
        <div className="fixed top-16 left-0 right-0 z-[9998]">
          <AudioPlayer variant="header" />
        </div>
      )}
      
      <div className={`flex flex-grow transition-all duration-300 ${currentTrack ? 'pt-24' : 'pt-16'}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Contenu principal avec marge fixe sur desktop */}
        <main className="flex-grow transition-all duration-300 md:ml-64">
          <Outlet />
        </main>
      </div>
      
      {/* Footer avec marge fixe sur desktop correspondant à la sidebar */}
      <div className="md:ml-64 transition-all duration-300">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;