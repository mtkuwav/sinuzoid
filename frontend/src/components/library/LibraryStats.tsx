import React from 'react';
import { FiMusic, FiClock, FiHardDrive, FiDisc } from 'react-icons/fi';

interface LibraryStatsProps {
  totalTracks: number;
  totalAlbums: number;
  totalDuration: string;
  totalSize: string;
  isLoading: boolean;
}

const LibraryStats: React.FC<LibraryStatsProps> = ({
  totalTracks,
  totalAlbums,
  totalDuration,
  totalSize,
  isLoading
}) => {
  const stats = [
    {
      label: 'Titres',
      value: totalTracks,
      icon: FiMusic,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Albums',
      value: totalAlbums,
      icon: FiDisc,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Durée totale',
      value: totalDuration,
      icon: FiClock,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Taille',
      value: totalSize,
      icon: FiHardDrive,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color} mr-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LibraryStats;
