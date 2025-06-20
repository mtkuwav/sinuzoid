import { useState } from 'react';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';
import { Card, Alert } from '../components/ui';
import { FileUpload, StorageInfo } from '../components/common';

const UploadPage = () => {
  const [uploadCompleteMessage, setUploadCompleteMessage] = useState<string | null>(null);

  const handleUploadComplete = (files: File[]) => {
    setUploadCompleteMessage(
      `${files.length} fichier${files.length > 1 ? 's' : ''} uploadé${files.length > 1 ? 's' : ''} avec succès !`
    );
    
    // Clear the message after 5 seconds
    setTimeout(() => {
      setUploadCompleteMessage(null);
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-3">
          <FiUploadCloud className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Upload de fichiers
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Ajoutez vos fichiers audio à votre bibliothèque
            </p>
          </div>
        </div>

        {/* Success Message */}
        {uploadCompleteMessage && (
          <Alert type="success" className="flex items-center space-x-2">
            <FiCheck className="w-4 h-4" />
            <span>{uploadCompleteMessage}</span>
          </Alert>
        )}

        {/* Storage Info */}
        <StorageInfo 
          className="mb-6"
          showHeader={true}
          autoRefresh={true}
          refreshInterval={30000}
        />

        {/* File Upload */}
        <FileUpload
          onUploadComplete={handleUploadComplete}
          maxFileSize={100} // 100 MB
          acceptedTypes={['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg']}
          multiple={true}
          className="min-h-96"
        />

        {/* Help Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">
              Conseils d'upload
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-medium mb-2">Formats supportés :</h4>
                <ul className="space-y-1">
                  <li>• MP3 (recommandé pour la compatibilité)</li>
                  <li>• FLAC (qualité audio maximale)</li>
                  <li>• WAV (non compressé)</li>
                  <li>• M4A/AAC (bonne qualité/taille)</li>
                  <li>• OGG (open source)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Bonnes pratiques :</h4>
                <ul className="space-y-1">
                  <li>• Taille maximale : 100 MB par fichier</li>
                  <li>• Ajoutez des métadonnées (titre, artiste, album)</li>
                  <li>• Utilisez des noms de fichiers descriptifs</li>
                  <li>• Vérifiez votre espace de stockage disponible</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;
