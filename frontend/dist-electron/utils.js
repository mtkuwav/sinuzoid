"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetPath = exports.isDev = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
exports.isDev = !electron_1.app.isPackaged;
const getAssetPath = (...paths) => {
    const RESOURCES_PATH = exports.isDev
        ? (0, path_1.join)(__dirname, '../assets')
        : (0, path_1.join)(process.resourcesPath, 'assets');
    return (0, path_1.join)(RESOURCES_PATH, ...paths);
};
exports.getAssetPath = getAssetPath;
