import React, { useEffect } from 'react';
import { useAudioPlayerStore } from '../../store/audioPlayerStore';
import { PlayerControls } from './PlayerControls';
import { PlayerProgress } from './PlayerProgress';
import { PlayerInfo } from './PlayerInfo';

interface AudioPlayerProps {
  variant?: 'header' | 'mini' | 'full' | 'headerCompact' | 'mobile';
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  variant = 'headerCompact',
  className = '' 
}) => {
  const { currentTrack } = useAudioPlayerStore();

  // Démarrer l'élément audio
  useEffect(() => {
    // L'audio element est géré par le hook useAudioElement dans le contexte
  }, []);

  if (!currentTrack && (variant === 'mini' || variant === 'headerCompact' || variant === 'mobile')) {
    return null;
  }

  if (variant === 'mini') {
    return (
      <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 ${className}`}>
        <div className="flex items-center justify-between">
          <PlayerInfo variant="compact" className="flex-1 min-w-0" />
          <PlayerControls variant="compact" className="ml-4" />
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Info de la piste */}
            <div className="flex-1 min-w-0">
              <PlayerInfo variant="compact" />
            </div>

            {/* Contrôles centraux */}
            <div className="flex-1 max-w-md mx-4">
              <div className="flex flex-col items-center space-y-2">
                <PlayerControls variant="compact" />
                <PlayerProgress className="w-full" />
              </div>
            </div>

            {/* Espace pour des contrôles additionnels (volume, etc.) */}
            <div className="flex-1 flex justify-end">
              {/* Peut être étendu avec volume, queue, etc. */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'headerCompact') {
    return (
      <div className={`flex flex-col items-center space-y-2 min-w-0 max-w-md ${className}`}>
        <div className="flex items-center space-x-4 w-full">
          <PlayerInfo variant="compact" className="flex-1 min-w-0" />
          <PlayerControls variant="compact" className="flex-shrink-0" />
        </div>
        <PlayerProgress className="w-full" />
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md ${className}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <PlayerInfo variant="compact" className="flex-1 min-w-0" />
            <PlayerControls variant="compact" className="flex-shrink-0 ml-4" />
          </div>
          <PlayerProgress className="w-full" />
        </div>
      </div>
    );
  }

  // Variant 'full' - pour une page dédiée du lecteur
  return (
    <div className={`bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <PlayerInfo variant="full" className="mb-8" />
          
          <div className="space-y-6">
            <PlayerProgress />
            <PlayerControls variant="full" />
          </div>
        </div>
      </div>
    </div>
  );
};
