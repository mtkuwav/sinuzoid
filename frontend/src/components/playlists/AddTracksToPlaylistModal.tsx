import React, { useState } from 'react';
import { FiX, FiSearch, FiPlus, FiLoader, FiCheck } from 'react-icons/fi';
// import { Track } from '../../hooks/useTracks';
import { useMusicData } from '../../hooks/useMusicStore';
import { usePlaylistOperations } from '../../hooks/usePlaylist';
import LogoIcon from '../../assets/logos/logo_sinuzoid-cyan.svg?react';

interface AddTracksToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  existingTrackIds: string[];
  onTracksAdded?: () => void;
}

const AddTracksToPlaylistModal: React.FC<AddTracksToPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlistId,
  existingTrackIds,
  onTracksAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [addingTracks, setAddingTracks] = useState(false);
  
  const { tracks, isLoading: tracksLoading } = useMusicData();
  const { addTrackToPlaylist } = usePlaylistOperations();

  // Filter tracks that are not already in the playlist
  const availableTracks = tracks.filter(track => !existingTrackIds.includes(track.id));

  // Filter tracks based on search query
  const filteredTracks = availableTracks.filter(track => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      track.original_filename.toLowerCase().includes(query) ||
      track.metadata?.title?.toLowerCase().includes(query) ||
      track.metadata?.artist?.toLowerCase().includes(query) ||
      track.metadata?.album?.toLowerCase().includes(query)
    );
  });

  const handleTrackToggle = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSelection = prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      
      return newSelection;
    });
  };

  const handleAddTracks = async () => {
    if (selectedTracks.length === 0) {
      return;
    }

    try {
      setAddingTracks(true);
      
      // Add tracks one by one to avoid overwhelming the API
      for (const trackId of selectedTracks) {
        try {
          await addTrackToPlaylist(playlistId, trackId);
        } catch (error) {
          console.error(`Error adding track ${trackId} to playlist:`, error);
          // Continue with other tracks even if one fails
        }
      }
      
      // Reset and close
      setSelectedTracks([]);
      setSearchQuery('');
      
      // Call the callback to refresh the playlist
      if (onTracksAdded) {
        onTracksAdded();
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      alert('Une erreur est survenue lors de l\'ajout des titres à la playlist.');
    } finally {
      setAddingTracks(false);
    }
  };

  const formatDuration = (duration: string) => {
    // Handle both ISO 8601 (PT3M45S) and standard (MM:SS) formats
    if (duration.startsWith('PT') || duration.startsWith('P')) {
      const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
      const match = duration.match(regex);
      
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = Math.floor(parseFloat(match[3] || '0'));
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    
    return duration;
  };

  if (!isOpen || !playlistId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full overflow-hidden" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Ajouter des titres à la playlist
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Sélectionnez les titres que vous souhaitez ajouter
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher des titres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tracksLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FiLoader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Chargement des titres...
                </p>
              </div>
            </div>
          ) : filteredTracks.length > 0 ? (
            <div className="p-6">
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedTracks.includes(track.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleTrackToggle(track.id)}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mr-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        selectedTracks.includes(track.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedTracks.includes(track.id) && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {track.metadata?.title || track.original_filename.replace(/\.[^/.]+$/, "")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {track.metadata?.artist || 'Artiste inconnu'}
                            {track.metadata?.album && ` • ${track.metadata.album}`}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                          {formatDuration(track.duration)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LogoIcon className="w-12 h-12 fill-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  {searchQuery ? 'Aucun résultat' : 'Aucun titre disponible'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'Aucun titre ne correspond à votre recherche.'
                    : 'Tous vos titres sont déjà dans cette playlist.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {selectedTracks.length} titre{selectedTracks.length !== 1 ? 's' : ''} sélectionné{selectedTracks.length !== 1 ? 's' : ''}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleAddTracks}
              disabled={selectedTracks.length === 0 || addingTracks}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {addingTracks ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Ajouter {selectedTracks.length > 0 && `(${selectedTracks.length})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTracksToPlaylistModal;
