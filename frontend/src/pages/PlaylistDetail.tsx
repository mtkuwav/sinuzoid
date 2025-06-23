import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  FiArrowLeft, 
  FiPlay, 
  FiShuffle, 
  FiMoreHorizontal, 
  FiEdit,
  FiTrash2,
  FiPlus,
  FiLoader
} from 'react-icons/fi';
import { usePlaylist, usePlaylistUtils, usePlaylistOperations } from '../hooks/usePlaylist';
import { useMusicUtils } from '../hooks/useMusicStore';
import { Track } from '../hooks/useTracks';
import { Button } from '../components/ui';
import { PlaylistModal, DeletePlaylistModal, AddTracksToPlaylistModal } from '../components/playlists';
import LogoIcon from '../assets/logos/logo_sinuzoid-cyan.svg?react';

const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { playlist, isLoading, refetch } = usePlaylist(playlistId);
  const { calculatePlaylistStats } = usePlaylistUtils();
  const { formatDuration } = useMusicUtils();
  const { removeTrackFromPlaylist } = usePlaylistOperations();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTracksModal, setShowAddTracksModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const stats = playlist ? calculatePlaylistStats(playlist) : null;

  const handleTrackPlay = (track: Track) => {
    console.log('Playing track:', track);
    // TODO: Implement track playing functionality
  };

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      handleTrackPlay(playlist.tracks[0]);
    }
  };

  const handleShuffle = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.tracks.length);
      handleTrackPlay(playlist.tracks[randomIndex]);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist) return;
    
    try {
      await removeTrackFromPlaylist(playlist.id, trackId);
      // Refresh the playlist after removing a track
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error('Error removing track from playlist:', error);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    // Refresh the playlist after editing
    if (refetch) {
      refetch();
    }
  };

  const handleTracksAdded = async () => {
    // Refresh the playlist after adding tracks
    if (refetch) {
      await refetch();
    }
  };

  const handleDeleteSuccess = () => {
    navigate('/playlists');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <FiLoader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Chargement de la playlist...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/playlists')}
            className="mb-6 flex items-center text-gray-600 dark:text-gray-300"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Retour aux playlists
          </Button>
          
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Playlist introuvable
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              La playlist demandée n'existe pas ou a été supprimée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/playlists')}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Retour aux playlists</span>
          <span className="sm:hidden">Retour</span>
        </Button>

        {/* Playlist header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
          {/* Playlist cover */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 dark:from-cyan-500 dark:via-blue-600 dark:to-purple-700 rounded-lg shadow-lg mx-auto md:mx-0 flex items-center justify-center overflow-hidden">
              <div className="text-center px-4">
                <LogoIcon className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 fill-white opacity-90 drop-shadow-md" />
                <div className="text-white opacity-90 text-lg md:text-xl font-medium tracking-wide line-clamp-3 leading-tight">
                  {playlist.name}
                </div>
              </div>
            </div>
          </div>

          {/* Playlist info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                {playlist.name}
              </h1>
              
              {/* Menu button */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiMoreHorizontal className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[140px]">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowEditModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                    >
                      <FiEdit className="w-3 h-3 mr-2" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                    >
                      <FiTrash2 className="w-3 h-3 mr-2" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {playlist.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                {playlist.description}
              </p>
            )}

            {stats && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 dark:text-gray-400 mb-6">
                <span>{stats.totalTracks} titre{stats.totalTracks !== 1 ? 's' : ''}</span>
                <span className="hidden md:block">•</span>
                <span>{stats.totalDuration}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlayAll}
                disabled={!playlist.tracks || playlist.tracks.length === 0}
                className="flex items-center justify-center px-8"
              >
                <FiPlay className="w-5 h-5 mr-2" />
                Lire
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShuffle}
                disabled={!playlist.tracks || playlist.tracks.length === 0}
                className="flex items-center justify-center px-8"
              >
                <FiShuffle className="w-5 h-5 mr-2" />
                Aléatoire
              </Button>
            </div>
          </div>
        </div>

        {/* Tracks section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Titres
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => setShowAddTracksModal(true)}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Ajouter des titres
            </Button>
          </div>

          {/* Tracks list */}
          {!playlist.tracks || playlist.tracks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <LogoIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 fill-current" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Aucun titre dans cette playlist
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ajoutez des titres pour commencer à écouter votre playlist
              </p>
              <Button 
                variant="primary" 
                className="flex items-center mx-auto"
                onClick={() => setShowAddTracksModal(true)}
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Ajouter des titres
              </Button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="w-8 text-center">#</div>
                  <div className="flex-1 ml-4">Titre</div>
                  <div className="w-32 text-center hidden sm:block">Durée</div>
                  <div className="w-8"></div>
                </div>
              </div>

              {/* Tracks */}
              <div className="divide-y dark:divide-gray-700">
                {playlist.tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-8 text-center flex-shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => handleTrackPlay(track)}
                          className="hidden group-hover:block p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <FiPlay className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {track.metadata?.title || track.original_filename}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {track.metadata?.artist || 'Artiste inconnu'}
                              {track.metadata?.album && (
                                <> • {track.metadata.album}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-32 text-center text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        {formatDuration(track.duration)}
                      </div>

                      <div className="w-8">
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <PlaylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={playlist}
        onSuccess={handleEditSuccess}
      />

      <DeletePlaylistModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        playlist={playlist}
        onSuccess={handleDeleteSuccess}
      />

      <AddTracksToPlaylistModal
        isOpen={showAddTracksModal}
        onClose={() => setShowAddTracksModal(false)}
        playlistId={playlist?.id || ''}
        existingTrackIds={playlist?.tracks?.map(track => track.id) || []}
        onTracksAdded={handleTracksAdded}
      />

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PlaylistDetail;
