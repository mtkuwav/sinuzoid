/**
 * Hook de compatibilité pour maintenir l'interface de l'ancien useTracks
 * Permet une migration progressive vers le nouveau store Zustand
 */

import { useMusicData, useMusicImages, useMusicUtils } from './useMusicStore';

export const useTracks = () => {
  const musicData = useMusicData();
  const musicImages = useMusicImages();
  const musicUtils = useMusicUtils();

  return {
    ...musicData,
    ...musicImages,
    ...musicUtils
  };
};

// Réexport des types pour la compatibilité
export type { Track, Album, TracksState } from './useTracks';
