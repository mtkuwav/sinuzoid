import React from 'react';
import { useAudioPlayerStore } from '../../store/audioPlayerStore';
import { useAudioContext } from '../../contexts/AudioContext';
import { formatDuration } from '../../utils/formatters';

interface PlayerProgressProps {
  onSeek?: (time: number) => void;
  className?: string;
}

export const PlayerProgress: React.FC<PlayerProgressProps> = ({ 
  onSeek, 
  className = '' 
}) => {
  const { currentTime, duration } = useAudioPlayerStore();
  const { seekTo } = useAudioContext();
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    const clampedTime = Math.max(0, Math.min(duration, newTime));
    
    seekTo(clampedTime);
    onSeek?.(clampedTime);
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Temps actuel */}
      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono min-w-[35px]">
        {formatDuration(currentTime)}
      </span>
      
      {/* Barre de progression */}
      <div 
        className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-75 group-hover:bg-blue-700 dark:group-hover:bg-blue-400"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Durée totale */}
      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono min-w-[35px]">
        {formatDuration(duration)}
      </span>
    </div>
  );
};
