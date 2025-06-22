import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { Playlist, PlaylistCreate, PlaylistUpdate } from '../../types/playlist';
import { usePlaylistOperations } from '../../hooks/usePlaylist';
import { Button, Input } from '../ui';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist?: Playlist; // For editing
  onSuccess?: (playlist: Playlist) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  playlist,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createPlaylist, updatePlaylist } = usePlaylistOperations();

  const isEditing = !!playlist;

  // Reset form when modal opens/closes or playlist changes
  useEffect(() => {
    if (isOpen) {
      setName(playlist?.name || '');
      setDescription(playlist?.description || '');
      setError(null);
    }
  }, [isOpen, playlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom de la playlist est requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: Playlist;

      if (isEditing && playlist) {
        const updateData: PlaylistUpdate = {
          name: name.trim(),
          description: description.trim() || undefined
        };
        result = await updatePlaylist(playlist.id, updateData);
      } else {
        const createData: PlaylistCreate = {
          name: name.trim(),
          description: description.trim() || undefined
        };
        result = await createPlaylist(createData);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error('Error saving playlist:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Modifier la playlist' : 'Nouvelle playlist'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name field */}
            <div>
              <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la playlist *
              </label>
              <Input
                id="playlist-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez le nom de votre playlist"
                disabled={isLoading}
                className="w-full"
                maxLength={100}
              />
            </div>

            {/* Description field */}
            <div>
              <label htmlFor="playlist-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                id="playlist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre playlist..."
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description.length}/500 caractères
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !name.trim()}
              className="flex items-center"
            >
              {isLoading && <FiLoader className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;
