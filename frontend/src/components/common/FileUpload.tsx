import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiMusic, FiAlertCircle } from 'react-icons/fi';
import { Card, Button } from '../ui';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadProps {
  onUploadComplete?: (files: File[]) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

const FileUpload = ({
  onUploadComplete,
  maxFileSize = 100, // 100 MB default
  acceptedTypes = ['.mp3', '.wav', '.flac', '.m4a', '.aac'],
  multiple = true,
  className = ''
}: FileUploadProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Le fichier dépasse la taille maximale de ${maxFileSize} MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Type de fichier non supporté. Types acceptés: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          id: generateId(),
          file,
          progress: 0,
          status: 'pending'
        });
      }
    });

    if (errors.length > 0) {
      // Show errors to user
      console.error('File validation errors:', errors);
    }

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles]);
    }
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);

    try {
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
      );

      const accessToken = sessionStorage.getItem('access_token');
      
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadFiles(prev => 
              prev.map(f => f.id === uploadFile.id ? { ...f, progress } : f)
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadFiles(prev => 
              prev.map(f => f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f)
            );
            resolve();
          } else {
            let errorMessage = 'Erreur lors de l\'upload';
            try {
              const response = JSON.parse(xhr.responseText);
              errorMessage = response.detail || response.message || errorMessage;
            } catch (e) {
              // If response is not JSON, use status text
              errorMessage = xhr.statusText || errorMessage;
            }
            setUploadFiles(prev => 
              prev.map(f => f.id === uploadFile.id ? { ...f, status: 'error', error: errorMessage } : f)
            );
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          const error = 'Erreur réseau lors de l\'upload';
          setUploadFiles(prev => 
            prev.map(f => f.id === uploadFile.id ? { ...f, status: 'error', error } : f)
          );
          reject(new Error(error));
        });

        xhr.open('POST', 'http://localhost:8000/files/upload/audio');
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.send(formData);
      });
    } catch (error: any) {
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: error.message || 'Erreur lors de l\'upload' 
        } : f)
      );
      throw error;
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of pendingFiles) {
        await uploadFile(file);
      }

      const successfulFiles = uploadFiles
        .filter(f => f.status === 'success')
        .map(f => f.file);

      if (onUploadComplete && successfulFiles.length > 0) {
        onUploadComplete(successfulFiles);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>;
      case 'error':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      default:
        return <FiMusic className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
        {/* Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FiUploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Glissez-déposez vos fichiers audio ici
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ou cliquez pour sélectionner des fichiers
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            className="mb-2"
          >
            Sélectionner des fichiers
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formats supportés: {acceptedTypes.join(', ')} • Taille max: {maxFileSize} MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                Fichiers ({uploadFiles.length})
              </h4>
              <div className="space-x-2">
                <Button
                  onClick={clearCompleted}
                  variant="ghost"
                  size="sm"
                  disabled={!uploadFiles.some(f => f.status === 'success')}
                >
                  Effacer terminés
                </Button>
                <Button
                  onClick={handleUploadAll}
                  variant="primary"
                  size="sm"
                  disabled={isUploading || !uploadFiles.some(f => f.status === 'pending')}
                >
                  {isUploading ? 'Upload en cours...' : 'Uploader tout'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(uploadFile.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                    
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {Math.round(uploadFile.progress)}%
                        </p>
                      </div>
                    )}
                    
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={uploadFile.status === 'uploading'}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUpload;
