const { contextBridge, ipcRenderer } = require('electron');

// Exposer des APIs sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // API pour détecter qu'on est dans Electron
  isElectron: true,
  
  // API pour les notifications
  showNotification: (title, body) => 
    ipcRenderer.invoke('notification:show', title, body),
});

// Types pour TypeScript
declare global {
  interface Window {
    electronAPI: {
      isElectron: boolean;
      showNotification: (title: string, body: string) => Promise<void>;
    };
  }
}

export {};