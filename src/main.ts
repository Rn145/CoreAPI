/* eslint-disable @typescript-eslint/camelcase */

import Electron from 'electron';
import path from 'path';

import CoreAPIMethodsMain from './methodsMain';
import CoreAPIListenersMain from './listenersMain';
import Events from 'events';
import CHANNELS from './ipcChannels';

import { MethodsList, MethodName, MethodData, Method, EventName, Window, SimpleObject } from './types';

class CoreAPI extends Events {

  private _methods = new CoreAPIMethodsMain();
  private _listeners = new CoreAPIListenersMain();

  isDebug = false;
  isProduction = false;

  constructor() {
    super();

    this._listeners.on('subscribe', (...args: any[]) => this.emit('subscribe', ...args));
    this._listeners.on('unsubscribe', (...args: any[]) => this.emit('unsubscribe', ...args));

    const get_debug = (event: Electron.IpcMainEvent) => event.returnValue = this.isDebug;
    Electron.ipcMain.on(CHANNELS.GET_IS_DEBUG, get_debug);

    const get_production = (event: Electron.IpcMainEvent) => event.returnValue = this.isProduction;
    Electron.ipcMain.on(CHANNELS.GET_IS_PRODUCTION, get_production);
  }

  preloadPath(): string {
    return path.join(__dirname, 'preload.js');
  }

  getMethod(methodName: MethodName): MethodData | undefined {
    return this._methods.get(methodName);
  }

  getMethodsName(): MethodsList {
    return this._methods.getNames();
  }

  addMethod(methodName: MethodName, method: Method, isSync?: boolean): boolean {
    return this._methods.add(methodName, method, isSync ?? false);
  }

  hasMethod(methodName: MethodName): boolean {
    return this._methods.has(methodName);
  }

  removeMethod(methodName: MethodName): boolean {
    return this._methods.remove(methodName);
  }


  getEventsName(): EventName[] {
    return this._listeners.getNames();
  }

  addEvent(eventName: EventName): boolean {
    return this._listeners.add(eventName);
  }

  hasEvent(eventName: EventName): boolean {
    return this._listeners.has(eventName);
  }

  removeEvent(eventName: EventName): boolean {
    return this._listeners.remove(eventName);
  }

  emitEvent(eventName: EventName, ...args: SimpleObject[]) {
    this._listeners.callEvent(eventName, ...args);
  }

  emitEventInWindow(eventName: EventName, window: Window, ...args: SimpleObject[]) {
    this._listeners.callEventInWindow(eventName, window, ...args);
  }
}

export default new CoreAPI;