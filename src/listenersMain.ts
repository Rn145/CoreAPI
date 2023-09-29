import Electron from 'electron';
import CoreAPIError from './error';
import EventsClass from './libs/events'

import Errors from './errorMessages';
import { SimpleObject } from './libs/simpleTypes';

export type EventName = string;
export type SubscribeReturn = {
  isSuccess: boolean;
  data: string;
}

export type Window = Electron.BrowserWindow;
export type Windows = Window[];
type Events = Map<EventName, Windows>;



export const CHANNELS = {
  CALL_EVENT: 'CoreAPI: call_event_channel',
  SUBSCRIBE: 'CoreAPI: subscribe_channel',
  UNSUBSCRIBE: 'CoreAPI: unsubscribe_channel',
  GET_EVENTS: 'CoreAPI: get_events_channel',
}

export default class CoreAPIListenersMain extends EventsClass {

  events: Events = new Map();

  constructor() {
    super();

    this._subscribeSync = this._subscribeSync.bind(this);
    this._unsubscribeSync = this._unsubscribeSync.bind(this);
    this._getEventsSync = this._getEventsSync.bind(this);
    this._subscribe = this._subscribe.bind(this);
    this._unsubscribe = this._unsubscribe.bind(this);
    this._getEvents = this._getEvents.bind(this);

    Electron.ipcMain.on(CHANNELS.SUBSCRIBE, this._subscribeSync);
    Electron.ipcMain.handle(CHANNELS.SUBSCRIBE, this._subscribe);
    Electron.ipcMain.on(CHANNELS.UNSUBSCRIBE, this._unsubscribeSync);
    Electron.ipcMain.handle(CHANNELS.UNSUBSCRIBE, this._unsubscribe);
    Electron.ipcMain.on(CHANNELS.GET_EVENTS, this._getEventsSync);
    Electron.ipcMain.handle(CHANNELS.GET_EVENTS, this._getEvents);
  }

  _subscribeSync(event: Electron.IpcMainEvent, eventName: EventName, isUnSub?: boolean): SubscribeReturn {
    isUnSub = isUnSub ?? false;

    const subscribeReturn: SubscribeReturn = {
      isSuccess: false,
      data: Errors.NO_ERROR()
    }

    const webContents = event.sender;
    const window = Electron.BrowserWindow.fromWebContents(webContents);
    if (window === null) {
      subscribeReturn.data = Errors.WINDOW_UNKNOWN(); // эта ошибка впринципе не должна происходить
      return event.returnValue = subscribeReturn;
    }

    const windows = this.events.get(eventName);
    if (windows === undefined) {
      subscribeReturn.data = Errors.EVENT_UNKNOWN();
      return event.returnValue = subscribeReturn;
    }

    if (isUnSub === false) {
      this._callListeners('subscribe', eventName, window);
      windows.push(window);
    }
    else {
      this._callListeners('unsubscribe', eventName, window);
      this.events.set(eventName, windows.filter((_window) => _window !== window));
    }

    subscribeReturn.isSuccess = true;
    return event.returnValue = subscribeReturn;
  }
  _subscribe(event: Electron.IpcMainInvokeEvent, eventName: EventName, isUnSub?: boolean): SubscribeReturn {
    if (isUnSub)
      console.log(eventName)

    isUnSub = isUnSub ?? false;

    const subscribeReturn: SubscribeReturn = {
      isSuccess: false,
      data: Errors.NO_ERROR()
    }

    const webContents = event.sender;
    const window = Electron.BrowserWindow.fromWebContents(webContents);
    if (window === null) {
      subscribeReturn.data = Errors.WINDOW_UNKNOWN(); // эта ошибка впринципе не должна происходить
      return subscribeReturn;
    }

    const windows = this.events.get(eventName);
    if (windows === undefined) {
      subscribeReturn.data = Errors.EVENT_UNKNOWN();
      return subscribeReturn;
    }

    if (isUnSub === false) {
      this._callListeners('subscribe', eventName, window);
      windows.push(window);
    }
    else {
      this._callListeners('unsubscribe', eventName, window);
      this.events.set(eventName, windows.filter((_window) => _window !== window));
    }

    subscribeReturn.isSuccess = true;
    return subscribeReturn;
  }
  _unsubscribeSync(event: Electron.IpcMainEvent, eventName: EventName): SubscribeReturn {
    return event.returnValue = this._subscribeSync(event, eventName, true);
  }
  _unsubscribe(event: Electron.IpcMainInvokeEvent, eventName: EventName): SubscribeReturn {
    return this._subscribe(event, eventName, true);
  }

  _getEventsSync(event: Electron.IpcMainEvent) {
    return event.returnValue = this.getNames();
  }
  _getEvents(event: Electron.IpcMainInvokeEvent) {
    return this.getNames();
  }

  getNames(): EventName[] {
    return Array.from(this.events.keys());
  }
  add(methodName: EventName): boolean {
    if (this.events.has(methodName))
      return false;
    this.events.set(methodName, []);
    return true;
  }
  has(methodName: EventName): boolean {
    return this.events.has(methodName);
  }
  remove(methodName: EventName): boolean {
    return this.events.delete(methodName);
  }

  callEvent(eventName: EventName, ...args: SimpleObject[]) {

    const windows = this.events.get(eventName);
    //console.log(windows)
    if (windows === undefined)
      return console.warn(Errors.CALL_UNKNOWN_EVENT(eventName));

    windows.forEach((window) => {
      window.webContents.send(CHANNELS.CALL_EVENT, eventName, args);
    });
  }
  callEventInWindow(eventName: EventName, window: Window, ...args: SimpleObject[]) {

    const windows = this.events.get(eventName);
    if (windows === undefined)
      throw new CoreAPIError(Errors.CALL_UNKNOWN_EVENT(eventName));

    if (windows.includes(window) === false)
      return console.warn(Errors.CALL_UNKNOWN_WINDOW(eventName));

    window.webContents.send(CHANNELS.CALL_EVENT, eventName, args);
  }
}