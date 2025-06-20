import React, { useState } from 'react';
import { FiUpload, FiCheckCircle, FiInfo } from 'react-icons/fi';
import FileUpload from '../components/common/FileUpload';
import StorageInfo from '../components/common/StorageInfo';
import { Alert } from '../components/ui';

const Upload: React.FC = () => {
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [refreshStorage, setRefreshStorage] = useState(0);

  const handleUploadComplete = (files: File[]) => {
    const fileCount = files.length;
    const message = fileCount === 1 
      ? `Le fichier "${files[0].name}" a été uploadé avec succès !`
      : `${fileCount} fichiers ont été uploadés avec succès !`;
    
    setUploadSuccess(message);
    
    // Force refresh of storage info
    setRefreshStorage(prev => prev + 1);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setUploadSuccess(null);
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
            <FiUpload className="w-8 h-8 mr-3" />
            Upload de fichiers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Uploadez vos fichiers audio sur Sinuzoid. Formats supportés : MP3, WAV, FLAC, M4A, AAC.
          </p>
        </div>

        {/* Success Alert */}
        {uploadSuccess && (
          <div className="mb-6">
            <Alert type="success" className="flex items-center">
              <FiCheckCircle className="w-5 h-5 mr-2" />
              {uploadSuccess}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Upload Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Instructions d'upload
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Glissez-déposez vos fichiers ou cliquez pour les sélectionner</li>
                      <li>• Formats acceptés : MP3, WAV, FLAC, M4A, AAC</li>
                      <li>• Taille maximale par fichier : 100 MB</li>
                      <li>• Vous pouvez uploader plusieurs fichiers en même temps</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload Component */}
              <FileUpload
                onUploadComplete={handleUploadComplete}
                maxFileSize={100}
                acceptedTypes={['.mp3', '.wav', '.flac', '.m4a', '.aac']}
                multiple={true}
              />
            </div>
          </div>

          {/* Sidebar - Storage Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <StorageInfo 
                key={refreshStorage} // Force re-render when refreshStorage changes
                showHeader={true}
                autoRefresh={false}
                className="mb-6"
              />

              {/* Upload Tips */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">
                  💡 Conseils d'upload
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Utilisez des noms de fichiers descriptifs</li>
                  <li>• Les métadonnées (artiste, titre, album) seront automatiquement extraites</li>
                  <li>• Pour une meilleure qualité, privilégiez les formats FLAC ou WAV</li>
                  <li>• Vérifiez votre espace de stockage avant l'upload</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
