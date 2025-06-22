// Hooks principaux pour la gestion de la musique avec Zustand
export { useMusicData, useMusicImages, useMusicUtils } from './useMusicStore';

// Hooks pour les playlists
export { 
  usePlaylistData, 
  usePlaylistOperations, 
  usePlaylist, 
  usePlaylistSearch, 
  usePlaylistUtils 
} from './usePlaylist';

// Hooks pour l'optimisation des performances
export { useImagePreloader, useImageCleanup } from './useImagePreloader';

// Hooks pour la synchronisation automatique
export { useBackgroundSync, useNetworkSync } from './useBackgroundSync';

// Hook de compatibilité (deprecated - utiliser useMusicData, useMusicImages, useMusicUtils)
export { useTracks } from './useTracksCompat';

// Types
export type { Track, Album, TracksState } from './useTracks';
export type { Playlist, PlaylistCreate, PlaylistUpdate } from '../types/playlist';

// Hook d'authentification
export { useAuth } from './useAuth';
