import React from 'react';

const Discover: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-200">
        Découvrir
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
        Explorez de nouveaux artistes et genres musicaux.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contenu temporaire pour la démonstration */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 group">
            <div className="bg-gray-300 dark:bg-gray-600 h-32 rounded mb-3 group-hover:bg-gray-400 dark:group-hover:bg-gray-500 transition-colors duration-200"></div>
            <h3 className="font-semibold text-gray-800 dark:text-white transition-colors duration-200">Album {item}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Artiste {item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;