import React, { useState, useMemo } from 'react';
import { FiMusic, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useTracks, Track } from '../hooks/useTracks';
import { 
  AlbumCard, 
  TrackList, 
  LibraryControls, 
  LibraryStats 
} from '../components/library';
import { Alert } from '../components/ui';

const Library: React.FC = () => {
  const {
    tracks,
    albums,
    isLoading,
    error,
    getThumbnailUrl,
    formatDuration,
    formatFileSize,
    refetch
  } = useTracks();

  const [viewMode, setViewMode] = useState<'albums' | 'tracks'>('albums');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('album');

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
      totalAlbums: albums.filter(album => album.name !== 'Singles et morceaux divers').length,
      totalDuration: formatTotalDuration(totalDurationSeconds),
      totalSize: formatFileSize(totalSizeBytes)
    };
  }, [tracks, albums, formatFileSize]);

  const handleTrackPlay = (track: Track) => {
    console.log('Playing track:', track);
    // TODO: Implement track playing functionality
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Ma Bibliothèque
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gérez et explorez votre collection musicale personnelle
        </p>
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
            <div>
              {filteredAndSortedData.albums.length > 0 ? (
                <div className="space-y-6">
                  {filteredAndSortedData.albums.map((album) => (
                    <AlbumCard
                      key={`${album.name}-${album.artist}`}
                      album={album}
                      getThumbnailUrl={getThumbnailUrl}
                      formatDuration={formatDuration}
                      formatFileSize={formatFileSize}
                      onTrackPlay={handleTrackPlay}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FiMusic className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
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
              {filteredAndSortedData.tracks.length > 0 ? (
                <TrackList
                  tracks={filteredAndSortedData.tracks}
                  getThumbnailUrl={getThumbnailUrl}
                  formatDuration={formatDuration}
                  onTrackPlay={handleTrackPlay}
                />
              ) : (
                <div className="text-center py-16">
                  <FiMusic className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
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