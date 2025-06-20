import { useState, useEffect } from 'react';
import { FiHardDrive, FiRefreshCw } from 'react-icons/fi';
import { Card, Button, Alert } from '../ui';

interface StorageData {
  quota: number;
  used: number;
  available: number;
  usage_percentage: number;
  quota_formatted: string;
  used_formatted: string;
  available_formatted: string;
}

interface StorageInfoProps {
  className?: string;
  showHeader?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

const StorageInfo = ({ 
  className = '', 
  showHeader = true,
  autoRefresh = false,
  refreshInterval = 30000 
}: StorageInfoProps) => {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorageInfo = async () => {
    try {
      setError(null);
      const accessToken = sessionStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/files/storage/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations de stockage');
      }

      const data = await response.json();
      setStorageData(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des informations de stockage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchStorageInfo();
  };

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchStorageInfo, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Chargement des informations de stockage...
          </span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
        <div className="text-center">
          <Button onClick={handleRefresh} variant="secondary" size="sm">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  if (!storageData) {
    return (
      <Card className={className}>
        <Alert type="error">
          Aucune donnée de stockage disponible
        </Alert>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <FiHardDrive className="w-5 h-5 mr-2" />
            Espace de stockage
          </h3>
          <Button onClick={handleRefresh} variant="ghost" size="sm">
            <FiRefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Usage Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Utilisation
            </span>
            <span className={`text-sm font-semibold ${getUsageTextColor(storageData.usage_percentage)}`}>
              {storageData.usage_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(storageData.usage_percentage)}`}
              style={{ width: `${Math.min(storageData.usage_percentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Storage Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Utilisé
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {storageData.used_formatted}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Disponible
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {storageData.available_formatted}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quota total
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {storageData.quota_formatted}
            </div>
          </div>
        </div>

        {/* Warning for high usage */}
        {storageData.usage_percentage >= 90 && (
          <Alert type="error">
            <strong>Attention :</strong> Votre espace de stockage est presque plein. 
            Supprimez des fichiers pour libérer de l'espace.
          </Alert>
        )}
        {storageData.usage_percentage >= 75 && storageData.usage_percentage < 90 && (
          <Alert type="warning">
            <strong>Avertissement :</strong> Vous utilisez plus de 75% de votre espace de stockage.
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default StorageInfo;
