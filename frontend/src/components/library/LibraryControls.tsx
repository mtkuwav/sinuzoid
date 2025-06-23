import React from 'react';
import { FiGrid, FiList, FiSearch, FiFilter } from 'react-icons/fi';
import { Button, Input } from '../ui';

interface LibraryControlsProps {
  viewMode: 'albums' | 'tracks';
  searchQuery: string;
  sortBy: string;
  onViewModeChange: (mode: 'albums' | 'tracks') => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
}

const LibraryControls: React.FC<LibraryControlsProps> = ({
  viewMode,
  searchQuery,
  sortBy,
  onViewModeChange,
  onSearchChange,
  onSortChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher dans votre bibliothèque..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Mode d'affichage */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <Button
            variant={viewMode === 'albums' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('albums')}
            className="flex items-center space-x-1"
          >
            <FiGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Albums</span>
          </Button>
          <Button
            variant={viewMode === 'tracks' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('tracks')}
            className="flex items-center space-x-1"
          >
            <FiList className="w-4 h-4" />
            <span className="hidden sm:inline">Titres</span>
          </Button>
        </div>

        {/* Tri */}
        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="album">Par album</option>
            <option value="artist">Par artiste</option>
            <option value="year">Par année</option>
            <option value="recent">Plus récents</option>
            <option value="name">Par nom</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LibraryControls;
