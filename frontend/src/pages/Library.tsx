import React, { useState, useMemo, useEffect } from 'react';
import { FiAlertCircle, FiLoader, FiRefreshCw, FiMusic } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router';
import { Track } from '../hooks/useTracks';
import { Playlist } from '../types/playlist';
import { useMusicData, useMusicUtils } from '../hooks/useMusicStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useImagePreloader, useImageCleanup } from '../hooks/useImagePreloader';
import { usePlaylistData } from '../hooks/usePlaylist';
import { 
  AlbumCard, 
  TrackList, 
  LibraryControls, 
  LibraryStats 
} from '../components/library';
import { PlaylistCard } from '../components/playlists';
import { Alert } from '../components/ui';
import { DownloadIconButton } from '../components/DownloadButton';
import LogoIcon from '../assets/logos/logo_sinuzoid-cyan.svg?react';

const Library: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    tracks,
    albums,
    isLoading,
    error,
    refetch
  } = useMusicData();
  
  const {
    playlists,
    isLoading: playlistsLoading
  } = usePlaylistData();
  
  const { formatFileSize } = useMusicUtils();
  const { toggleTrack, playAlbum, playPlaylist } = useAudioPlayer();
  
  // Préchargement intelligent des images et cleanup automatique
  useImagePreloader();
  useImageCleanup();

  // Handlers pour les playlists
  const handlePlaylistPlay = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      playPlaylist(playlist, 0);
    }
  };

  const [viewMode, setViewMode] = useState<'albums' | 'tracks'>('albums');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('album');

  // Initialize state from navigation params if present
  useEffect(() => {
    if (location.state) {
      const { searchQuery: navSearchQuery, viewMode: navViewMode } = location.state as any;
      if (navSearchQuery) {
        setSearchQuery(navSearchQuery);
      }
      if (navViewMode) {
        setViewMode(navViewMode);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    const search = params.get('search');
    const sort = params.get('sort');

    if (view === 'tracks' || view === 'albums') {
      setViewMode(view);
    }

    if (search) {
      setSearchQuery(search);
    }

    if (sort === 'artist' || sort === 'year' || sort === 'recent' || sort === 'name' || sort === 'album') {
      setSortBy(sort);
    }
  }, [location.search]);

  const filteredAndSortedData = useMemo(() => {
    let filteredTracks = tracks;
    let filteredAlbums = albums;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      filteredTracks = tracks.filter(track => 
        track.original_filename.toLowerCase().includes(query) ||
        track.metadata?.title?.toLowerCase().includes(query) ||
        track.metadata?.artist?.toLowerCase().includes(query) ||
        track.metadata?.album?.toLowerCase().includes(query) ||
        track.metadata?.genre?.toLowerCase().includes(query)
      );

      filteredAlbums = albums.map(album => ({
        ...album,
        tracks: album.tracks.filter(track => 
          track.original_filename.toLowerCase().includes(query) ||
          track.metadata?.title?.toLowerCase().includes(query) ||
          track.metadata?.artist?.toLowerCase().includes(query) ||
          album.name.toLowerCase().includes(query) ||
          album.artist?.toLowerCase().includes(query)
        )
      })).filter(album => album.tracks.length > 0);
    }

    switch (sortBy) {
      case 'artist':
        filteredTracks.sort((a, b) => 
          (a.metadata?.artist || '').localeCompare(b.metadata?.artist || '')
        );
        filteredAlbums.sort((a, b) => 
          (a.artist || '').localeCompare(b.artist || '')
        );
        break;
      
      case 'year':
        filteredTracks.sort((a, b) => 
          (b.metadata?.year || 0) - (a.metadata?.year || 0)
        );
        filteredAlbums.sort((a, b) => 
          (b.year || 0) - (a.year || 0)
        );
        break;
      
      case 'recent':
        filteredTracks.sort((a, b) => 
          new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
        );
        filteredAlbums.sort((a, b) => {
          const maxDateA = Math.max(...a.tracks.map(t => new Date(t.upload_date).getTime()));
          const maxDateB = Math.max(...b.tracks.map(t => new Date(t.upload_date).getTime()));
          return maxDateB - maxDateA;
        });
        break;
      
      case 'name':
        filteredTracks.sort((a, b) => 
          (a.metadata?.title || a.original_filename).localeCompare(
            b.metadata?.title || b.original_filename
          )
        );
        filteredAlbums.sort((a, b) => a.name.localeCompare(b.name));
        break;
      
      default: // 'album'
        filteredTracks.sort((a, b) => {
          const albumA = a.metadata?.album || '';
          const albumB = b.metadata?.album || '';
          if (albumA === albumB) {
            return (a.metadata?.track_number || 999) - (b.metadata?.track_number || 999);
          }
          return albumA.localeCompare(albumB);
        });
        // Albums are already sorted by default
        break;
    }

    return { tracks: filteredTracks, albums: filteredAlbums };
  }, [tracks, albums, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const totalDurationSeconds = tracks.reduce((total, track) => {
      // Handle both ISO 8601 (PT3M45S) and standard (MM:SS) formats
      if (track.duration.startsWith('PT') || track.duration.startsWith('P')) {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
        const match = track.duration.match(regex);
        
        if (match) {
          const hours = parseInt(match[1] || '0');
          const minutes = parseInt(match[2] || '0');
          const seconds = Math.floor(parseFloat(match[3] || '0'));
          return total + (hours * 3600) + (minutes * 60) + seconds;
        }
      } else {
        const parts = track.duration.split(':');
        let seconds = 0;
        if (parts.length === 3) {
          seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
          seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return total + seconds;
      }
      return total;
    }, 0);

    const totalSizeBytes = tracks.reduce((total, track) => total + track.file_size, 0);

    const formatTotalDuration = (totalSeconds: number) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      } else {
        return `${minutes}min`;
      }
    };

    return {
      totalTracks: tracks.length,
      totalAlbums: albums.filter(album => album.name !== 'Singles and miscellaneous tracks').length,
      totalDuration: formatTotalDuration(totalDurationSeconds),
      totalSize: formatFileSize(totalSizeBytes)
    };
  }, [tracks, albums, formatFileSize]);

  const handleTrackPlay = (track: Track) => {
    toggleTrack(track);
  };

  const handleAlbumPlay = (album: { tracks: Track[] }) => {
    playAlbum(album, 0);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert type="error" className="mb-6">
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Erreur lors du chargement</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Alert>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Ma Bibliothèque
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez et explorez votre collection musicale personnelle
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <DownloadIconButton
            variant="all"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <LibraryStats
        totalTracks={stats.totalTracks}
        totalAlbums={stats.totalAlbums}
        totalDuration={stats.totalDuration}
        totalSize={stats.totalSize}
        isLoading={isLoading}
      />

      {/* Controls */}
      <LibraryControls
        viewMode={viewMode}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
      />

      {/* Playlists Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Mes Playlists
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/playlists')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200"
          >
            Voir tout
          </button>
        </div>

        {playlistsLoading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {playlists.slice(0, 5).map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onPlay={handlePlaylistPlay}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <FiMusic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucune playlist créée
              </p>
              <button
                onClick={() => navigate('/playlists')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mt-1"
              >
                Créer votre première playlist
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FiLoader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chargement de votre bibliothèque...
            </p>
          </div>
        </div>
      ) : (
        <div>
          {viewMode === 'albums' ? (
            // Vue Albums
            <div className="pb-20">
              {filteredAndSortedData.albums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredAndSortedData.albums.map((album, index) => (
                    <AlbumCard
                      key={`${album.name}-${album.artist}`}
                      album={album}
                      formatFileSize={formatFileSize}
                      onTrackPlay={handleTrackPlay}
                      onAlbumPlay={handleAlbumPlay}
                      index={index}
                      columnsCount={6}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <LogoIcon className="w-16 h-16 fill-gray-500 dark:fill-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Aucun album trouvé
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery 
                      ? 'Aucun album ne correspond à votre recherche.'
                      : 'Commencez par télécharger de la musique pour créer votre bibliothèque.'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Vue Titres
            <div>
              {filteredAndSortedData.tracks.length > 0 ? (              <TrackList
                tracks={filteredAndSortedData.tracks}
                onTrackPlay={handleTrackPlay}
              />
              ) : (
                <div className="text-center py-16">
                  <LogoIcon className="w-16 h-16 fill-gray-500 dark:fill-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Aucun titre trouvé
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery 
                      ? 'Aucun titre ne correspond à votre recherche.'
                      : 'Commencez par télécharger de la musique pour créer votre bibliothèque.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;