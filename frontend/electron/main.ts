import { app, BrowserWindow, Menu, shell } from 'electron';
import { join } from 'path';

// Détection de l'environnement de développement
const isDev = !app.isPackaged;

// Désactiver le menu par défaut en production
if (!isDev) {
  Menu.setApplicationMenu(null);
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // enableRemoteModule: false,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false, // Ne pas montrer immédiatement
  });

  // URL de développement ou fichier de production
  const url = isDev 
    ? 'http://localhost:5173' 
    : `file://${join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(url);

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Ouvrir les liens externes dans le navigateur
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // DevTools en développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

// Cette méthode sera appelée quand Electron aura fini son initialisation
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Sur macOS, recréer une fenêtre quand l'icône du dock est cliquée
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  // Sur macOS, garder l'app active même quand toutes les fenêtres sont fermées
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Sécurité : empêcher la navigation vers des domaines externes
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});