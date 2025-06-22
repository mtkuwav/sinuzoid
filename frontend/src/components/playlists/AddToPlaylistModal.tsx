import React, { useState } from 'react';
import { FiX, FiPlus, FiMusic, FiCheck } from 'react-icons/fi';
import { Track } from '../../hooks/useTracks';
import { usePlaylistData, usePlaylistOperations } from '../../hooks/usePlaylist';
import { Playlist } from '../../types/playlist';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track
}) => {
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [creatingNewPlaylist, setCreatingNewPlaylist] = useState(false);

  const {
    playlists,
    isLoading: playlistsLoading
  } = usePlaylistData();

  const {
    createPlaylist,
    addTrackToPlaylist
  } = usePlaylistOperations();

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!track) return;

    try {
      setAddingToPlaylist(playlist.id);
      await addTrackToPlaylist(playlist.id, track.id);
      
      // Show success feedback briefly
      setTimeout(() => {
        setAddingToPlaylist(null);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      setAddingToPlaylist(null);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!track || !newPlaylistName.trim()) return;

    try {
      setCreatingNewPlaylist(true);
      const newPlaylist = await createPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDescription.trim() || undefined
      });
      
      await addTrackToPlaylist(newPlaylist.id, track.id);
      
      // Reset form
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowNewPlaylistForm(false);
      
      // Show success and close
      setTimeout(() => {
        setCreatingNewPlaylist(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error creating playlist and adding track:', error);
      setCreatingNewPlaylist(false);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Ajouter à une playlist
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {track.metadata?.title || track.original_filename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Create new playlist button */}
          <button
            onClick={() => setShowNewPlaylistForm(!showNewPlaylistForm)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 mb-4"
          >
            <FiPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Créer une nouvelle playlist
            </span>
          </button>

          {/* New playlist form */}
          {showNewPlaylistForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de la playlist
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    placeholder="Nom de la playlist"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                    rows={2}
                    placeholder="Description de la playlist"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newPlaylistName.trim() || creatingNewPlaylist}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {creatingNewPlaylist ? 'Création...' : 'Créer et ajouter'}
                  </button>
                  <button
                    onClick={() => setShowNewPlaylistForm(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing playlists */}
          {playlistsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Chargement des playlists...</p>
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Playlists existantes
              </h3>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist)}
                  disabled={addingToPlaylist === playlist.id}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {addingToPlaylist === playlist.id ? (
                      <FiCheck className="w-5 h-5 text-white" />
                    ) : (
                      <FiMusic className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">
                      {playlist.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {playlist.tracks?.length || 0} titre{(playlist.tracks?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {addingToPlaylist === playlist.id && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Ajouté !
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune playlist trouvée
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Créez votre première playlist ci-dessus
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
