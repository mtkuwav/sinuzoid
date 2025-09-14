export const isElectron = (): boolean => {
  return !!(window as any).electronAPI?.isElectron;
};

export const isWeb = (): boolean => {
  return !isElectron();
};

// Configuration de l'API selon la plateforme
export const getApiBaseUrl = (): string => {
  // En Electron, toujours pointer vers localhost
  if (isElectron()) {
    return 'http://localhost:8000';
  }
  
  // En web, utiliser la variable d'environnement ou localhost par défaut
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};