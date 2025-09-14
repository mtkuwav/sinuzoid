import { app } from 'electron';
import { join } from 'path';

export const isDev = !app.isPackaged;

export const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = isDev
    ? join(__dirname, '../assets')
    : join(process.resourcesPath, 'assets');
  
  return join(RESOURCES_PATH, ...paths);
};
