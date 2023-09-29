import CoreAPI from "@CoreAPI";

const preloadPath = CoreAPI.preloadPath();

console.log(preloadPath);
/*
import Electron from 'electron';

const app = Electron.app;

const createWindow = () => {
    const win = new Electron.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js');
        }
    })

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (Electron.BrowserWindow.getAllWindows().length === 0) createWindow();
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
*/