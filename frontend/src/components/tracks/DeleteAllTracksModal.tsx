import React, { useState } from 'react';
import { FiTrash2, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { trackApi } from '../../services/trackApi';
import { Button } from '../ui';

interface DeleteAllTracksModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackCount: number;
  onSuccess?: (deletedCount: number) => void;
}

const DeleteAllTracksModal: React.FC<DeleteAllTracksModalProps> = ({
  isOpen,
  onClose,
  trackCount,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const CONFIRM_TEXT = 'SUPPRIMER TOUT';

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      setError('Veuillez taper exactement "SUPPRIMER TOUT" pour confirmer');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await trackApi.deleteAllTracks();
      
      if (onSuccess) {
        onSuccess(result.deleted_count);
      }
      onClose();
    } catch (error) {
      console.error('Error deleting all tracks:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setConfirmText('');
      onClose();
    }
  };

  const handleConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
    if (error && error.includes('SUPPRIMER TOUT')) {
      setError(null);
    }
  };

  if (!isOpen) return null;

  const isConfirmValid = confirmText === CONFIRM_TEXT;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          {/* Icon and title */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Supprimer toute votre bibliothèque
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ ATTENTION : Action irréversible !
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Vous êtes sur le point de supprimer{' '}
                <strong>{trackCount} morceau{trackCount !== 1 ? 's' : ''}</strong> de votre bibliothèque.
                Tous vos fichiers audio, métadonnées et statistiques seront définitivement perdus.
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Cette action supprimera :
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1 mb-4">
              <li>Tous vos fichiers audio ({trackCount} morceaux)</li>
              <li>Toutes les métadonnées associées</li>
              <li>Toutes les statistiques d'écoute</li>
              <li>Toutes les images de couverture</li>
            </ul>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Pour confirmer cette action, tapez exactement{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-red-600 dark:text-red-400 font-mono">
                {CONFIRM_TEXT}
              </code>{' '}
              dans le champ ci-dessous :
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={handleConfirmTextChange}
              placeholder={CONFIRM_TEXT}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
            />
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
              disabled={isLoading || !isConfirmValid}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white flex items-center"
            >
              {isLoading && <FiLoader className="w-4 h-4 mr-2 animate-spin" />}
              <FiTrash2 className="w-4 h-4 mr-2" />
              Supprimer tout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAllTracksModal;
