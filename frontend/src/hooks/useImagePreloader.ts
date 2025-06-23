import { useEffect, useCallback } from 'react';
import { useMusicStore } from '../store/musicStore';
import { useMusicImages } from './useMusicStore';

/**
 * Hook pour précharger les images de manière intelligente
 */
export const useImagePreloader = () => {
  const { tracks, albums } = useMusicStore();
  const { getThumbnailUrl } = useMusicImages();

  // Précharge les thumbnails des albums visibles
  const preloadAlbumThumbnails = useCallback(async (albumsToPreload = albums.slice(0, 20)) => {
    const preloadPromises = albumsToPreload
      .filter(album => album.cover_thumbnail_path)
      .map(album => getThumbnailUrl(album.cover_thumbnail_path!));
    
    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Erreur lors du préchargement des thumbnails:', error);
    }
  }, [albums, getThumbnailUrl]);

  // Précharge les thumbnails des tracks récents
  const preloadRecentTrackThumbnails = useCallback(async () => {
    const recentTracks = tracks
      .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
      .slice(0, 50)
      .filter(track => track.cover_thumbnail_path);

    const preloadPromises = recentTracks.map(track => getThumbnailUrl(track.cover_thumbnail_path!));
    
    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Erreur lors du préchargement des thumbnails de tracks:', error);
    }
  }, [tracks, getThumbnailUrl]);

  // Précharge intelligemment en fonction du contexte
  useEffect(() => {
    if (albums.length > 0) {
      // Précharger avec un délai pour ne pas bloquer l'UI
      setTimeout(() => {
        preloadAlbumThumbnails();
      }, 500);
    }
  }, [albums, preloadAlbumThumbnails]);

  useEffect(() => {
    if (tracks.length > 0) {
      // Précharger les tracks récents avec un délai plus long
      setTimeout(() => {
        preloadRecentTrackThumbnails();
      }, 2000);
    }
  }, [tracks, preloadRecentTrackThumbnails]);

  return {
    preloadAlbumThumbnails,
    preloadRecentTrackThumbnails
  };
};

/**
 * Hook pour le cleanup automatique des blob URLs
 */
export const useImageCleanup = () => {
  const { thumbnailCache, coverCache } = useMusicStore();

  useEffect(() => {
    // Cleanup des URLs expirées toutes les 10 minutes
    const interval = setInterval(() => {
      const now = Date.now();
      const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

      // Cleanup des thumbnails expirés
      Object.entries(thumbnailCache).forEach(([, cache]) => {
        if (now - cache.timestamp > CACHE_DURATION) {
          URL.revokeObjectURL(cache.url);
        }
      });

      // Cleanup des covers expirés
      Object.entries(coverCache).forEach(([, cache]) => {
        if (now - cache.timestamp > CACHE_DURATION) {
          URL.revokeObjectURL(cache.url);
        }
      });
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(interval);
      
      // Cleanup de toutes les URLs au démontage du composant
      Object.values(thumbnailCache).forEach(cache => {
        try {
          URL.revokeObjectURL(cache.url);
        } catch (error) {
          // Ignore les erreurs de cleanup
        }
      });
      
      Object.values(coverCache).forEach(cache => {
        try {
          URL.revokeObjectURL(cache.url);
        } catch (error) {
          // Ignore les erreurs de cleanup
        }
      });
    };
  }, [thumbnailCache, coverCache]);
};
