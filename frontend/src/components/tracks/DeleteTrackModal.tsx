import React, { useState } from 'react';
import { FiTrash2, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { Track } from '../../hooks/useTracks';
import { trackApi } from '../../services/trackApi';
import { Button } from '../ui';

interface DeleteTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onSuccess?: () => void;
}

const DeleteTrackModal: React.FC<DeleteTrackModalProps> = ({
  isOpen,
  onClose,
  track,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!track) return;

    setIsLoading(true);
    setError(null);

    try {
      const filename = trackApi.getTrackFilename(track);
      await trackApi.deleteTrack(filename);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting track:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
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

  if (!isOpen || !track) return null;

  const trackTitle = track.metadata?.title || track.original_filename.replace(/\.[^/.]+$/, "");
  const trackArtist = track.metadata?.artist || 'Artiste inconnu';

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
                Supprimer le morceau
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Êtes-vous sûr de vouloir supprimer le morceau{' '}
              <strong className="text-gray-900 dark:text-white">"{trackTitle}"</strong>
              {trackArtist !== 'Artiste inconnu' && (
                <span> de <strong className="text-gray-900 dark:text-white">{trackArtist}</strong></span>
              )} ?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Cette action est irréversible. Le fichier audio sera supprimé définitivement de vos fichiers.
            </p>
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

export default DeleteTrackModal;
