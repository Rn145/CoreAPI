import Electron from 'electron';
//import CoreAPI from "electron-core-api";
import CoreAPI from "../src";


const app = Electron.app;

//------------------------------------------------------------------------------------------------
CoreAPI.addMethod('setTitle', (window: Electron.BrowserWindow, newTitle: string) => {
  window.setTitle(newTitle);
  return 'title changed to ' + newTitle;
}, true);

CoreAPI.addEvent('timer');
setInterval(() => {
  CoreAPI.emitEvent('timer', 'two seconds have passed');
}, 2000);
//------------------------------------------------------------------------------------------------

const createWindow = () => {
  const win = new Electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      sandbox: false, //it is recommended not to use with webpack
      preload: CoreAPI.preloadPath()
    }
  })

  win.loadFile('renderer.html');
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (Electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    process.exit();
  }
});
