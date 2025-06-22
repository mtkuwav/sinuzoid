import React, { useState } from 'react';
import { FiPlus, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { usePlaylistData } from '../hooks/usePlaylist';
import { Playlist } from '../types/playlist';
import { PlaylistCard, PlaylistModal, DeletePlaylistModal } from '../components/playlists';
import { Button, Alert } from '../components/ui';

const Playlists: React.FC = () => {
  const { playlists, isLoading, error, refetch } = usePlaylistData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(null);

  const handleCreateSuccess = () => {
    // Modal will close automatically, playlists will be updated via the store
  };

  const handleEditSuccess = () => {
    setEditingPlaylist(null);
  };

  const handleDeleteSuccess = () => {
    setDeletingPlaylist(null);
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    console.log('Playing playlist:', playlist);
    // TODO: Implement playlist playing functionality
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert type="error" className="mb-6">
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Erreur lors du chargement des playlists</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Alert>
          <Button
            onClick={refetch}
            className="flex items-center"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-200">
            Mes Playlists
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Organisez votre musique en playlists personnalisées
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={refetch}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="lg"
            className="flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Nouvelle playlist
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FiLoader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chargement de vos playlists...
            </p>
          </div>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <FiPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Aucune playlist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre première playlist pour organiser votre musique
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
              className="flex items-center mx-auto"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Créer ma première playlist
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
          </div>

          {/* Playlists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onEdit={setEditingPlaylist}
                onDelete={setDeletingPlaylist}
                onPlay={handlePlayPlaylist}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <PlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <PlaylistModal
        isOpen={!!editingPlaylist}
        onClose={() => setEditingPlaylist(null)}
        playlist={editingPlaylist || undefined}
        onSuccess={handleEditSuccess}
      />

      <DeletePlaylistModal
        isOpen={!!deletingPlaylist}
        onClose={() => setDeletingPlaylist(null)}
        playlist={deletingPlaylist}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default Playlists;