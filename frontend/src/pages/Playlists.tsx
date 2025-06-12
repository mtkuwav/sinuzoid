import React from 'react';

const Playlists: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-200">
        Mes Playlists
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
        Organisez votre musique en playlists personnalisées.
      </p>
      
      <button className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 mb-6 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        Créer une nouvelle playlist
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Mes favoris', 'Découvertes', 'Rock classique', 'Jazz lounge', 'Pour méditer'].map((playlist) => (
          <div key={playlist} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 group cursor-pointer">
            <div className="bg-gray-300 dark:bg-gray-600 h-32 rounded mb-3 group-hover:bg-gray-400 dark:group-hover:bg-gray-500 transition-colors duration-200"></div>
            <h3 className="font-semibold text-gray-800 dark:text-white transition-colors duration-200">{playlist}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Ma playlist</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;