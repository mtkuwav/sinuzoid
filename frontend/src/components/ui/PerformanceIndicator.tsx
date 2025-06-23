import React, { useEffect, useState, useRef } from 'react';
import { useMusicStore } from '../../store/musicStore';

/**
 * Composant qui affiche un indicateur de performance
 */
const PerformanceIndicator: React.FC = () => {
  const { tracks, albums, isLoading } = useMusicStore();
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const loadStartTime = useRef<number | null>(null);

  // Démarrer le chrono quand le loading commence
  useEffect(() => {
    if (isLoading) {
      loadStartTime.current = Date.now();
      setShowIndicator(false);
    }
  }, [isLoading]);

  // Calculer le temps quand le loading se termine
  useEffect(() => {
    if (!isLoading && tracks.length > 0 && loadStartTime.current) {
      const actualLoadTime = Date.now() - loadStartTime.current;
      setLoadTime(actualLoadTime);
      setIsFromCache(actualLoadTime < 200); // Probablement du cache si < 200ms
      setShowIndicator(true);
      loadStartTime.current = null;
      
      // Masquer l'indicateur après 3 secondes
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, tracks.length]);

  if (!showIndicator || loadTime === null) {
    return null;
  }

  const getPerformanceColor = () => {
    if (loadTime < 100) return 'bg-green-500';
    if (loadTime < 500) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceText = () => {
    if (loadTime < 100) return 'Excellent';
    if (loadTime < 500) return 'Bon';
    return 'Peut mieux faire';
  };

  const getLoadSource = () => {
    return isFromCache ? 'cache' : 'serveur';
  };

  return (
    <div className={`fixed top-20 right-4 ${getPerformanceColor()} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="text-sm font-medium">
          🚀 {getPerformanceText()} • {tracks.length} morceaux • {albums.length} albums
        </div>
      </div>
      <div className="text-xs opacity-90">
        Chargé depuis {getLoadSource()} en {loadTime}ms
      </div>
    </div>
  );
};

export default PerformanceIndicator;
