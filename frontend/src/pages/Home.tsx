import React from 'react';
import SinuzoidLogo from '../assets/logos/logo_sinuzoid-cyan.svg?react';
import { AudioPlayerTest } from '../components/player';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <SinuzoidLogo className='fill-blue-600 dark:fill-blue-400 size-24 mx-auto mb-6 transition-colors duration-200' />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-200">
          Bienvenue sur Sinuzoid
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
          Votre plateforme musicale innovante
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Découvrir</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Explorez de nouveaux artistes et genres musicaux
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Bibliothèque</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organisez votre collection musicale
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Radio</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Écoutez des stations personnalisées
            </p>
          </div>
        </div>
        
        {/* Test du lecteur audio */}
        <div className="mt-12">
          <AudioPlayerTest />
        </div>
      </div>
    </div>
  );
};

export default Home;