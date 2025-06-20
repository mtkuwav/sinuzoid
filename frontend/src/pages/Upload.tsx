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
    
    // Force refresh of storage info with a slight delay
    setTimeout(() => {
      setRefreshStorage(prev => prev + 1);
    }, 1000); // 1 second delay to ensure server processing is complete
    
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
            Uploadez vos fichiers audio sur Sinuzoid. Formats supportés : MP3, WAV, FLAC, M4A, AAC. Vous pouvez aussi uploader des dossiers complets.
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

        {/* Main Upload Area - First */}
        <div className="mb-8">
          <FileUpload
            onUploadComplete={handleUploadComplete}
            maxFileSize={100}
            acceptedTypes={['.mp3', '.wav', '.flac', '.m4a', '.aac']}
            multiple={true}
            allowDirectories={true}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Upload Instructions */}
        <div className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-start">
              <FiInfo className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">
                  Instructions d'upload
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <li>• Glissez-déposez vos fichiers ou dossiers</li>
                    <li>• Cliquez pour sélectionner des fichiers</li>
                    <li>• Formats acceptés : MP3, WAV, FLAC, M4A, AAC</li>
                  </ul>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <li>• Taille maximale par fichier : 100 MB</li>
                    <li>• Upload multiple de fichiers supporté</li>
                    <li>• Upload de dossiers complets supporté</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Info - After instructions */}
        <div className="mb-8">
          <StorageInfo 
            refreshTrigger={refreshStorage} // Trigger refresh when this value changes
            showHeader={true}
            autoRefresh={false}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Upload Tips - Bottom section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
              💡 Conseils d'upload
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Qualité audio</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• FLAC : qualité maximale</li>
                  <li>• WAV : non compressé</li>
                  <li>• MP3 : bonne compatibilité</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Organisation</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Noms de fichiers descriptifs</li>
                  <li>• Organisez par dossiers d'album</li>
                  <li>• Métadonnées automatiquement extraites</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Vérifiez votre espace de stockage</li>
                  <li>• Upload par lots recommandé</li>
                  <li>• Connexion stable conseillée</li>
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
