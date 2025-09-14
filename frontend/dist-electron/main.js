"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
// Détection de l'environnement de développement
const isDev = !electron_1.app.isPackaged;
// Désactiver le menu par défaut en production
if (!isDev) {
    electron_1.Menu.setApplicationMenu(null);
}
let mainWindow = null;
const createWindow = () => {
    // Créer la fenêtre principale
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            // enableRemoteModule: false,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
        titleBarStyle: 'default',
        show: false, // Ne pas montrer immédiatement
    });
    // URL de développement ou fichier de production
    const url = isDev
        ? 'http://localhost:5173'
        : `file://${(0, path_1.join)(__dirname, '../dist/index.html')}`;
    mainWindow.loadURL(url);
    // Afficher la fenêtre quand elle est prête
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });
    // Ouvrir les liens externes dans le navigateur
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    // DevTools en développement
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
};
// Cette méthode sera appelée quand Electron aura fini son initialisation
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        // Sur macOS, recréer une fenêtre quand l'icône du dock est cliquée
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Quitter quand toutes les fenêtres sont fermées
electron_1.app.on('window-all-closed', () => {
    // Sur macOS, garder l'app active même quand toutes les fenêtres sont fermées
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Sécurité : empêcher la navigation vers des domaines externes
electron_1.app.on('web-contents-created', (_, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });
});
