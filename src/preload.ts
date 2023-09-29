import Electron from 'electron'
import CoreAPIClient from './client'

const FullAPI = new CoreAPIClient();

const api = {
  exec: FullAPI.exec,
  on: FullAPI.on,
  once: FullAPI.once,
  remove: FullAPI.remove,
  methods: FullAPI.methods,
  events: FullAPI.events,

  sync: {
    exec: FullAPI.execSync,
    on: FullAPI.onSync,
    once: FullAPI.onceSync,
    remove: FullAPI.removeSync,
    methods: FullAPI.methodsSync,
    events: FullAPI.eventsSync,
  },

  version: FullAPI.version
};

Electron.contextBridge.exposeInMainWorld('CoreAPI', api);

window.addEventListener("beforeunload", FullAPI._listeners._close);

declare global {
  const CoreAPI: typeof api;
}