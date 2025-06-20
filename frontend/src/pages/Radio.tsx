import React from 'react';
import { Button } from '../components/ui';

const Radio: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-200">
        Radio
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
        Découvrez des stations radio personnalisées.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['Jazz Lounge', 'Rock Classique', 'Pop Actuelle', 'Électro Chill'].map((station) => (
          <div key={station} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-200">{station}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Station personnalisée</p>
              </div>
              <Button variant="primary" size="md">
                Écouter
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Radio;