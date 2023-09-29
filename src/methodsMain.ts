import Electron from 'electron';

import Errors from './errorMessages';
import CHANNELS from './ipcChannels';

import { Window, Method, MethodName, MethodReturn, MethodID, MethodData, MethodsList, SimpleObject } from './types';
type MethodsDataMap = Map<MethodName, MethodData>;

export default class CoreAPIMethodsMain {

  methods: MethodsDataMap = new Map();

  constructor() {

    this._executeProcessor = this._executeProcessor.bind(this);
    this._executeProcessorSync = this._executeProcessorSync.bind(this);
    this._getMethods = this._getMethods.bind(this);
    this._getMethodsInvoke = this._getMethodsInvoke.bind(this);

    Electron.ipcMain.on(CHANNELS.EXECUTE, this._executeProcessor);
    Electron.ipcMain.on(CHANNELS.EXECUTE_SYNC, this._executeProcessorSync);

    Electron.ipcMain.on(CHANNELS.GET_METHODS, this._getMethods);
    Electron.ipcMain.handle(CHANNELS.GET_METHODS, this._getMethodsInvoke);
  }

  async _executeProcessor(event: Electron.IpcMainEvent, methodName: MethodName, id: MethodID, ...args: SimpleObject[]): Promise<void> {

    const methodReturn: MethodReturn = {
      isSuccess: false,
      isObject: false,
      data: Errors.NO_ERROR()
    };

    const methodData = this.methods.get(methodName);
    const webContents = event.sender;
    const window = Electron.BrowserWindow.fromWebContents(webContents);
    if (window === null)
      methodReturn.data = Errors.WINDOW_UNKNOWN(); // эта ошибка впринципе не должна происходить
    else if (methodData === undefined)
      methodReturn.data = Errors.METHOD_UNKNOWN();
    else
      try {
        methodReturn.data = await Promise.resolve(methodData.method(window, ...args));
        methodReturn.isSuccess = true;
      }
      catch (error) {
        methodReturn.data = Errors.METHOD_ERROR(error);
      }

    if (typeof (methodReturn.data) === 'object')
      try {
        methodReturn.data = JSON.stringify(methodReturn.data);
        methodReturn.isObject = true;
      }
      catch (error) {
        methodReturn.data = Errors.TO_JSON_ERROR();
      }


    event.reply(CHANNELS.EXECUTE, id, methodReturn);
  }

  _executeProcessorSync(event: Electron.IpcMainEvent, methodName: MethodName, ...args: SimpleObject[]): void {

    const methodReturn: MethodReturn = {
      isSuccess: false,
      isObject: false,
      data: Errors.NO_ERROR()
    };

    const methodData = this.methods.get(methodName);
    const webContents = event.sender;
    const window: Window = Electron.BrowserWindow.fromWebContents(webContents);
    if (window === null)
      methodReturn.data = Errors.WINDOW_UNKNOWN(); // эта ошибка впринципе не должна происходить
    else if (methodData === undefined)
      methodReturn.data = Errors.METHOD_UNKNOWN();
    else if (methodData.isSync === false)
      methodReturn.data = Errors.NOT_SYNC_ERROR();
    else
      try {
        methodReturn.data = methodData.method(window, ...args);
        methodReturn.isSuccess = true;
      }
      catch (error) {
        methodReturn.data = Errors.METHOD_ERROR(error);
      }

    if (typeof (methodReturn.data) === 'object')
      try {
        methodReturn.data = JSON.stringify(methodReturn.data);
        methodReturn.isObject = true;
      }
      catch (error) {
        methodReturn.data = Errors.TO_JSON_ERROR();
      }

    event.returnValue = methodReturn;
  }

  _getMethods(event: Electron.IpcMainEvent) {
    return event.returnValue = JSON.stringify(this.getNames());
  }
  _getMethodsInvoke(event: Electron.IpcMainInvokeEvent) {// eslint-disable-line
    return JSON.stringify(this.getNames());
  }

  get(methodName: MethodName): MethodData | undefined {
    return this.methods.get(methodName);
  }
  getNames(): MethodsList {
    const list: MethodsList = {
      async: [],
      sync: []
    }

    this.methods.forEach((methodData: MethodData, methodName: MethodName) => {
      if (methodData.isSync === true)
        list.sync.push(methodName);
      list.async.push(methodName);
    });

    return list;
  }
  add(methodName: MethodName, method: Method, isSync?: boolean): boolean {
    if (this.methods.has(methodName))
      return false;
    const methodData: MethodData = {
      method,
      isSync: isSync ?? false
    };
    this.methods.set(methodName, methodData);
    return true;
  }
  has(methodName: MethodName): boolean {
    return this.methods.has(methodName);
  }
  remove(methodName: MethodName): boolean {
    return this.methods.delete(methodName);
  }

}