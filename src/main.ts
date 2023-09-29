/* eslint-disable @typescript-eslint/camelcase */

import Electron from 'electron';
import path from 'path';
import fs from 'fs';
import CoreAPIError from './error';

import { SimpleObject } from './libs/simpleTypes';
import CoreAPIMethodsMain, { MethodsList, MethodName, MethodData, Method } from './methodsMain';
import CoreAPIListenersMain, { EventName, Window } from './listenersMain';
import Events from './libs/events'
import ImportScript from './libs/importScript';
import Errors from './errorMessages';

import { CHANNELS } from './client';


class CoreAPI extends Events {

  methods = new CoreAPIMethodsMain();

  listeners = new CoreAPIListenersMain();

  constructor() {
    super();

    const get_NODE_ENV = (event: Electron.IpcMainEvent) => event.returnValue = process.env.NODE_ENV ?? 'unknown';
    Electron.ipcMain.on(CHANNELS.GET_VERSION, get_NODE_ENV);
  }

  preloadPath() {
    return path.join(__dirname, 'preload.js');
  }

  getMethod(methodName: MethodName): MethodData | undefined {
    return this.methods.get(methodName);
  }

  getMethodsName(): MethodsList {
    return this.methods.getNames();
  }

  addMethod(methodName: MethodName, method: Method, isSync?: boolean): boolean {
    return this.methods.add(methodName, method, isSync ?? false);
  }

  hasMethod(methodName: MethodName): boolean {
    return this.methods.has(methodName);
  }

  removeMethod(methodName: MethodName): boolean {
    return this.methods.remove(methodName);
  }


  getEventsName(): EventName[] {
    return this.listeners.getNames();
  }

  addEvent(eventName: EventName): boolean {
    return this.listeners.add(eventName);
  }

  hasEvent(eventName: EventName): boolean {
    return this.listeners.has(eventName);
  }

  removeEvent(eventName: EventName): boolean {
    return this.listeners.remove(eventName);
  }

  emitEvent(eventName: EventName, ...args: SimpleObject[]) {
    this.listeners.callEvent(eventName, ...args);
  }

  emitEventInWindow(eventName: EventName, window: Window, ...args: SimpleObject[]) {
    this.listeners.callEventInWindow(eventName, window, ...args);
  }
}

export default new CoreAPI;