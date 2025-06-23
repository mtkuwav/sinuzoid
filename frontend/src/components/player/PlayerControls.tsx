import React from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiShuffle, 
  FiRepeat,
  FiVolume2,
  FiVolumeX,
  FiLoader
} from 'react-icons/fi';
import { useAudioPlayerStore } from '../../store/audioPlayerStore';

interface PlayerControlsProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ 
  variant = 'full',
  className = '' 
}) => {
  const {
    isPlaying,
    isLoading,
    isShuffleOn,
    repeatMode,
    volume,
    isMuted,
    playlist,
    toggle,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    toggleMute
  } = useAudioPlayerStore();

  const hasPlaylist = playlist.length > 0;

  const getRepeatIcon = () => {
    if (repeatMode === 'track') {
      return <FiRepeat className="w-4 h-4" />;
    }
    return <FiRepeat className="w-4 h-4" />;
  };

  const getRepeatColor = () => {
    if (repeatMode === 'none') {
      return 'text-gray-400 dark:text-gray-500';
    }
    return 'text-blue-600 dark:text-blue-400';
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Previous */}
        <button
          onClick={previous}
          disabled={!hasPlaylist}
          className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSkipBack className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={toggle}
          disabled={!hasPlaylist || isLoading}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <FiPause className="w-4 h-4" />
          ) : (
            <FiPlay className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={next}
          disabled={!hasPlaylist}
          className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSkipForward className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`p-2 rounded-full transition-colors ${
          isShuffleOn 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' 
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <FiShuffle className="w-4 h-4" />
      </button>

      {/* Previous */}
      <button
        onClick={previous}
        disabled={!hasPlaylist}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiSkipBack className="w-5 h-5" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={toggle}
        disabled={!hasPlaylist || isLoading}
        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <FiLoader className="w-6 h-6 animate-spin" />
        ) : isPlaying ? (
          <FiPause className="w-6 h-6" />
        ) : (
          <FiPlay className="w-6 h-6 ml-1" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={next}
        disabled={!hasPlaylist}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiSkipForward className="w-5 h-5" />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={`p-2 rounded-full transition-colors ${getRepeatColor()}`}
      >
        {getRepeatIcon()}
        {repeatMode === 'track' && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
        )}
      </button>

      {/* Volume */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={toggleMute}
          className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {isMuted || volume === 0 ? (
            <FiVolumeX className="w-4 h-4" />
          ) : (
            <FiVolume2 className="w-4 h-4" />
          )}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
};
