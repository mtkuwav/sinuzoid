import React, { useState } from 'react';
import { FiTrash2, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { Playlist } from '../../types/playlist';
import { usePlaylistOperations } from '../../hooks/usePlaylist';
import { Button } from '../ui';

interface DeletePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist | null;
  onSuccess?: () => void;
}

const DeletePlaylistModal: React.FC<DeletePlaylistModalProps> = ({
  isOpen,
  onClose,
  playlist,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deletePlaylist } = usePlaylistOperations();

  const handleDelete = async () => {
    if (!playlist) return;

    setIsLoading(true);
    setError(null);

    try {
      await deletePlaylist(playlist.id);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Icon and title */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Supprimer la playlist
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Êtes-vous sûr de vouloir supprimer la playlist <strong className="text-gray-900 dark:text-white">"{playlist.name}"</strong> ?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cette action est irréversible. La playlist et toutes ses références seront supprimées définitivement.
            </p>
            {playlist.tracks && playlist.tracks.length > 0 && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                ⚠️ Cette playlist contient {playlist.tracks.length} titre{playlist.tracks.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center"
            >
              {isLoading && <FiLoader className="w-4 h-4 mr-2 animate-spin" />}
              <FiTrash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePlaylistModal;
