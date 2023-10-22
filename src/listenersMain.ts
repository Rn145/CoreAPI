import Electron from 'electron';
import CoreAPIError from './error';
import EventsClass from 'events'

import Errors from './errorMessages';
import CHANNELS from './ipcChannels';

import { SubscribeReturn, EventName, TupleToSimpleObject, Window, HasEventReturn } from './types';
type Windows = Window[];
type Events = Map<EventName, Windows>;

export default class CoreAPIListenersMain extends EventsClass {

  events: Events = new Map();

  constructor() {
    super();

    this._subscribeSync = this._subscribeSync.bind(this);
    this._unsubscribeSync = this._unsubscribeSync.bind(this);
    this._getEventsSync = this._getEventsSync.bind(this);
    this._hasEventSync = this._hasEventSync.bind(this);
    this._subscribe = this._subscribe.bind(this);
    this._unsubscribe = this._unsubscribe.bind(this);
    this._getEvents = this._getEvents.bind(this);
    this._hasEvent = this._hasEvent.bind(this);

    Electron.ipcMain.on(CHANNELS.SUBSCRIBE, this._subscribeSync);
    Electron.ipcMain.handle(CHANNELS.SUBSCRIBE, this._subscribe);
    Electron.ipcMain.on(CHANNELS.UNSUBSCRIBE, this._unsubscribeSync);
    Electron.ipcMain.handle(CHANNELS.UNSUBSCRIBE, this._unsubscribe);
    Electron.ipcMain.on(CHANNELS.GET_EVENTS, this._getEventsSync);
    Electron.ipcMain.handle(CHANNELS.GET_EVENTS, this._getEvents);

    Electron.ipcMain.on(CHANNELS.HAS_EVENT, this._hasEventSync);
    Electron.ipcMain.handle(CHANNELS.HAS_EVENT, this._hasEvent);

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
      this.emit('subscribe', eventName, window);
      windows.push(window);
    }
    else {
      this.emit('unsubscribe', eventName, window);
      this.events.set(eventName, windows.filter((_window) => _window !== window));
    }

    subscribeReturn.isSuccess = true;
    return event.returnValue = subscribeReturn;
  }
  _subscribe(event: Electron.IpcMainInvokeEvent, eventName: EventName, isUnSub?: boolean): SubscribeReturn {
    //if (isUnSub)
    //  console.log(eventName)

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
      this.emit('subscribe', eventName, window);
      windows.push(window);
    }
    else {
      this.emit('unsubscribe', eventName, window);
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
  _hasEvent(event: Electron.IpcMainEvent, eventName: EventName): HasEventReturn {
    return this.has(eventName);
  }
  _hasEventSync(event: Electron.IpcMainEvent, eventName: EventName): HasEventReturn {
    return event.returnValue = this.has(eventName);
  }

  _getEventsSync(event: Electron.IpcMainEvent) {
    return event.returnValue = this.getNames();
  }
  _getEvents(event: Electron.IpcMainInvokeEvent) { // eslint-disable-line
    return this.getNames();
  }

  getNames(): EventName[] {
    return Array.from(this.events.keys());
  }
  add(eventName: EventName): boolean {
    if (this.events.has(eventName))
      return false;
    this.events.set(eventName, []);
    return true;
  }
  has(eventName: EventName): boolean {
    return this.events.has(eventName);
  }
  remove(eventName: EventName): boolean {
    return this.events.delete(eventName);
  }

  callEvent<T extends any[]>(eventName: EventName, ...args: TupleToSimpleObject<T>) {

    const windows = this.events.get(eventName);
    
    if (windows === undefined)
      return console.warn(Errors.CALL_UNKNOWN_EVENT(eventName));

    windows.forEach((window) => {
      window.webContents.send(CHANNELS.CALL_EVENT, eventName, args);
    });
  }
  callEventInWindow<T extends any[]>(eventName: EventName, window: Window, ...args: TupleToSimpleObject<T>) {

    const windows = this.events.get(eventName);
    if (windows === undefined)
      throw new CoreAPIError(Errors.CALL_UNKNOWN_EVENT(eventName));

    if (windows.includes(window) === false)
      return console.warn(Errors.CALL_UNKNOWN_WINDOW(eventName));

    window.webContents.send(CHANNELS.CALL_EVENT, eventName, args);
  }
}