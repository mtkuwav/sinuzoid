import React from 'react';

const Library: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-200">
        Ma Bibliothèque
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
        Gérez votre collection musicale personnelle.
      </p>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white transition-colors duration-200">Collections</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-800 dark:text-white">Morceaux favoris</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">42 titres</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-800 dark:text-white">Récemment ajoutés</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">18 titres</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-800 dark:text-white">Téléchargements</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">7 titres</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;