import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiPlay, FiShuffle, FiMoreHorizontal, FiClock, FiTrash2 } from 'react-icons/fi';
import { Track } from '../hooks/useTracks';
import { useMusicData, useMusicImages, useMusicUtils, useMusicDeletion } from '../hooks/useMusicStore';
import { Button } from '../components/ui';
import { TrackMenu, DeleteAlbumModal } from '../components/tracks';
import LogoIcon from '../assets/logos/logo_sinuzoid-cyan.svg?react';

const Album: React.FC = () => {
  const { albumName } = useParams<{ albumName: string }>();
  const navigate = useNavigate();
  const { albums, isLoading } = useMusicData();
  const { getThumbnailUrl, getCoverUrl } = useMusicImages();
  const { formatDuration } = useMusicUtils();
  const { handleAlbumDeleted } = useMusicDeletion();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showDeleteAlbumModal, setShowDeleteAlbumModal] = useState(false);

  const album = useMemo(() => {
    if (!albumName) return null;
    const decodedAlbumName = decodeURIComponent(albumName);
    return albums.find(a => a.name === decodedAlbumName) || null;
  }, [albums, albumName]);

  useEffect(() => {
    const loadCover = async () => {
      if (album?.cover_thumbnail_path) {
        // Try to get the original cover first, fallback to thumbnail
        const originalCover = album.tracks.find(t => t.cover_path)?.cover_path;
        if (originalCover) {
          const url = await getCoverUrl(originalCover);
          if (url) {
            setCoverUrl(url);
            return;
          }
        }
        // Fallback to thumbnail
        const url = await getThumbnailUrl(album.cover_thumbnail_path);
        setCoverUrl(url);
      }
    };
    loadCover();
  }, [album, getThumbnailUrl, getCoverUrl]);

  const getMainCodec = () => {
    if (!album) return '';
    
    // Get the most common file type in the album
    const codecCounts = album.tracks.reduce((acc, track) => {
      const codec = track.file_type.toUpperCase();
      acc[codec] = (acc[codec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(codecCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'UNKNOWN';
  };

  const albumStats = useMemo(() => {
    if (!album) return null;

    const totalDurationSeconds = album.tracks.reduce((total, track) => {
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

    const formatTotalDuration = (totalSeconds: number) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours} h ${minutes} min`;
      } else {
        return `${minutes} min`;
      }
    };

    return {
      trackCount: album.tracks.length,
      totalDuration: formatTotalDuration(totalDurationSeconds),
      year: album.year,
      mainCodec: getMainCodec()
    };
  }, [album]);

  const handleTrackPlay = (track: Track) => {
    console.log('Playing track:', track);
    // TODO: Implement track playing functionality
  };

  const handlePlayAll = () => {
    if (album?.tracks.length) {
      handleTrackPlay(album.tracks[0]);
    }
  };

  const handleShuffle = () => {
    if (album?.tracks.length) {
      const randomIndex = Math.floor(Math.random() * album.tracks.length);
      handleTrackPlay(album.tracks[randomIndex]);
    }
  };

  const handleDeleteAlbumSuccess = () => {
    if (album) {
      handleAlbumDeleted(album.name);
      navigate('/library');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-center py-8 sm:py-16">
            <div className="animate-pulse text-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 sm:mb-6 mx-auto"></div>
              <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded w-36 sm:w-48 mb-3 sm:mb-4 mx-auto"></div>
              <div className="h-4 sm:h-6 bg-gray-300 dark:bg-gray-700 rounded w-24 sm:w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/library')}
            className="mb-4 sm:mb-6 flex items-center text-gray-600 dark:text-gray-300"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Retour à la bibliothèque</span>
            <span className="sm:hidden">Retour</span>
          </Button>
          <div className="text-center py-8 sm:py-16 px-4">
            <LogoIcon className="w-12 h-12 sm:w-16 sm:h-16 fill-gray-500 dark:fill-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Album introuvable
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              L'album demandé n'existe pas ou a été supprimé.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/library')}
          className="mb-4 sm:mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Retour à la bibliothèque</span>
          <span className="sm:hidden">Retour</span>
        </Button>

        {/* Album header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Album cover */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto md:mx-0 relative group">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={`Couverture de ${album.name}`}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-lg flex items-center justify-center">
                  <LogoIcon className="w-12 h-12 sm:w-16 sm:h-16 fill-gray-500 dark:fill-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Album info */}
          <div className="flex-grow text-center md:text-left">
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Album
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight px-2 md:px-0">
              {album.name}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-1 sm:gap-2 md:gap-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6 px-2 md:px-0">
              <span className="font-medium text-base sm:text-lg">{album.artist}</span>
              {albumStats && (
                <>
                  {album.year && (
                    <span className="hidden md:block text-gray-400">•</span>
                  )}
                  {album.year && <span>{album.year}</span>}
                  <span className="hidden md:block text-gray-400">•</span>
                  <span>{albumStats.trackCount} titre{albumStats.trackCount > 1 ? 's' : ''}</span>
                  <span className="hidden md:block text-gray-400">•</span>
                  <span>{albumStats.totalDuration}</span>
                  <span className="hidden md:block text-gray-400">•</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs sm:text-sm font-medium inline-block">
                    {albumStats.mainCodec}
                  </span>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start px-4 sm:px-0">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlayAll}
                className="flex items-center justify-center px-6 sm:px-8 w-full sm:w-auto"
              >
                <FiPlay className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Lire
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShuffle}
                className="flex items-center justify-center px-4 sm:px-6 w-full sm:w-auto"
              >
                <FiShuffle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Lecture aléatoire</span>
                <span className="sm:hidden">Aléatoire</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="flex items-center justify-center px-4 w-full sm:w-auto"
              >
                <FiMoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              {album?.name !== 'Singles and miscellaneous tracks' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDeleteAlbumModal(true)}
                  className="flex items-center justify-center px-4 w-full sm:w-auto text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Supprimer l'album</span>
                  <span className="sm:hidden">Supprimer</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Track list */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-visible mb-20">
          {/* Header */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
            <div className="flex items-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <div className="w-6 sm:w-8 text-center">#</div>
              <div className="flex-1 ml-2 sm:ml-4">Titre</div>
              <div className="w-16 sm:w-32 text-center">
                <FiClock className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" />
              </div>
            </div>
          </div>

          {/* Tracks */}
          <div className="divide-y dark:divide-gray-700 overflow-visible relative">
            {album.tracks.map((track, index) => (
              <div
                key={track.id}
                className="px-3 sm:px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group relative"
                onClick={() => handleTrackPlay(track)}
              >
                <div className="flex items-center">
                  <div className="w-6 sm:w-8 text-center flex-shrink-0">
                    <span className="text-gray-500 dark:text-gray-400 group-hover:hidden text-xs sm:text-sm">
                      {track.metadata?.track_number || index + 1}
                    </span>
                    <FiPlay className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 hidden group-hover:block mx-auto" />
                  </div>
                  
                  <div className="flex-1 ml-2 sm:ml-4 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                      {track.metadata?.title || track.original_filename.replace(/\.[^/.]+$/, "")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {track.metadata?.artist || 'Artiste inconnu'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                      {track.file_type.toUpperCase()}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDuration(track.duration)}
                    </span>
                    <div className="flex items-center">
                      <TrackMenu track={track} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Album Modal */}
        <DeleteAlbumModal
          isOpen={showDeleteAlbumModal}
          onClose={() => setShowDeleteAlbumModal(false)}
          album={album}
          onSuccess={handleDeleteAlbumSuccess}
        />
      </div>
    </div>
  );
};

export default Album;
