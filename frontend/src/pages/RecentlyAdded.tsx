import React, { useMemo } from 'react';
import { FiClock, FiMusic, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useMusicData } from '../hooks/useMusicStore';
import { usePlaylistData } from '../hooks/usePlaylist';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AlbumCard } from '../components/library';
import { PlaylistCard } from '../components/playlists';
import { Alert } from '../components/ui';
import LogoIcon from '../assets/logos/logo_sinuzoid-cyan.svg?react';

const RecentlyAdded: React.FC = () => {
  const { albums, isLoading: albumsLoading, error: albumsError } = useMusicData();
  const { playlists, isLoading: playlistsLoading, error: playlistsError } = usePlaylistData();
  const { playTracks, playPlaylist } = useAudioPlayer();

  // Trier les albums par date de création (plus récents en premier)
  const recentAlbums = useMemo(() => {
    return [...albums]
      .filter(album => album.name !== 'Singles and miscellaneous tracks') // Exclure les singles
      .sort((a, b) => {
        // Utiliser la date du track le plus récent de l'album comme référence
        const getLatestTrackDate = (album: any) => {
          return Math.max(...album.tracks.map((track: any) => 
            new Date(track.upload_date).getTime()
          ));
        };
        
        const dateA = getLatestTrackDate(a);
        const dateB = getLatestTrackDate(b);
        
        return dateB - dateA; // Plus récent en premier
      })
      .slice(0, 12); // Limiter à 12 albums
  }, [albums]);

  // Trier les playlists par date de création (plus récentes en premier)
  const recentPlaylists = useMemo(() => {
    return [...playlists]
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Plus récent en premier
      })
      .slice(0, 8); // Limiter à 8 playlists
  }, [playlists]);

  const handleAlbumPlay = (album: { tracks: any[] }) => {
    if (album.tracks.length > 0) {
      playTracks(album.tracks, 0);
    }
  };

  const handlePlaylistPlay = (playlist: any) => {
    playPlaylist(playlist);
  };

  const isLoading = albumsLoading || playlistsLoading;
  const hasError = albumsError || playlistsError;

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" className="mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2" />
            <div>
              <h3 className="font-medium">Erreur de chargement</h3>
              <p className="text-sm mt-1">
                {albumsError || playlistsError}
              </p>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FiClock className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Récemment ajoutés
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Découvrez vos derniers albums et playlists créés
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FiLoader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chargement des contenus récents...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Albums récents */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FiMusic className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Albums récents
                </h2>
              </div>
              {recentAlbums.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {recentAlbums.length} album{recentAlbums.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {recentAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {recentAlbums.map((album, index) => (
                  <AlbumCard
                    key={`${album.name}-${album.artist}`}
                    album={album}
                    formatFileSize={(bytes) => {
                      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                      if (bytes === 0) return '0 Byte';
                      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
                      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
                    }}
                    onAlbumPlay={handleAlbumPlay}
                    index={index}
                    columnsCount={6}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <LogoIcon className="w-16 h-16 fill-gray-400 dark:fill-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aucun album récent
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Ajoutez de la musique pour voir vos albums apparaître ici
                </p>
              </div>
            )}
          </section>

          {/* Playlists récentes */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FiMusic className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Playlists récentes
                </h2>
              </div>
              {recentPlaylists.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {recentPlaylists.length} playlist{recentPlaylists.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {recentPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {recentPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onPlay={handlePlaylistPlay}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <LogoIcon className="w-16 h-16 fill-gray-400 dark:fill-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aucune playlist récente
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Créez vos premières playlists pour les voir apparaître ici
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default RecentlyAdded;
