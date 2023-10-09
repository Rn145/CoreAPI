import Electron from 'electron';
import CoreAPIError from './error';
import { createID } from './simpleSymbol';

import Errors from './errorMessages';
import CHANNELS from './ipcChannels';

import { EventName, SubscribeReturn, HasEventReturn, Listener, ListenerID, SimpleObject } from './types';
type ListenersMap = Map<EventName, ListenersData>;
type ListenerData = {
  listener: Listener;
  isOnce: boolean;
  id: ListenerID;
};
type ListenersData = ListenerData[];

const WINDOW_CLOSE_EVENT_NAME = 'Window.close';
const newID = createID;

export default class CoreAPIListenersClient {

  listeners: ListenersMap = new Map();

  constructor() {
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.remove = this.remove.bind(this);
    this.getEvents = this.getEvents.bind(this);

    this.onSync = this.onSync.bind(this);
    this.onceSync = this.onceSync.bind(this);
    this.removeSync = this.removeSync.bind(this);
    this.getEventsSync = this.getEventsSync.bind(this);

    this._handler = this._handler.bind(this);
    this._close = this._close.bind(this);

    window.addEventListener("beforeunload", this._close);
    this.listeners.set(WINDOW_CLOSE_EVENT_NAME, []);

    Electron.ipcRenderer.on(CHANNELS.CALL_EVENT, this._handler);
  }

  async on(eventName: string, listener: Listener): Promise<ListenerID> {
    return this._subscribe(eventName, listener, false);
  }
  async once(eventName: string, listener: Listener): Promise<ListenerID> {
    return this._subscribe(eventName, listener, true);
  }

  async remove(eventName: string, id: ListenerID): Promise<void> {

    const listenersData = this.listeners.get(eventName);
    if (listenersData === undefined)
      throw new CoreAPIError(Errors.UNSUBSCRIBE_EVENT_NO_LISTENERS(eventName));

    const listenerDataIndex = listenersData.findIndex((_listenerData) => _listenerData.id === id);
    if (listenerDataIndex === -1)
      throw new CoreAPIError(Errors.UNSUBSCRIBE_EVENT_UNKNOWN_LISTENER(eventName));

    if (listenersData.length === 1) {

      this.listeners.delete(eventName);

      const unsubscribeReturn: SubscribeReturn = await Electron.ipcRenderer.invoke(CHANNELS.UNSUBSCRIBE, eventName);
      if (unsubscribeReturn.isSuccess === false)
        throw new CoreAPIError(Errors.UNSUBSCRIBE_FAIL(eventName, unsubscribeReturn.data));
    }
    else
      listenersData.splice(listenerDataIndex, 1);
  }

  async _subscribe(eventName: string, listener: Listener, isOnce: boolean): Promise<ListenerID> {

    const hasEventReturn: HasEventReturn = await Electron.ipcRenderer.invoke(CHANNELS.HAS_EVENT, eventName);
    if (!hasEventReturn)
      throw new CoreAPIError(Errors.SUBSCRIBE_FAIL(eventName, Errors.EVENT_UNKNOWN()));

    const listenerData: ListenerData = {
      listener,
      isOnce,
      id: newID()
    };

    let listenersdata = this.listeners.get(eventName);
    let subscribeFlag = listenersdata === undefined;

    if (subscribeFlag) {
      this.listeners.set(eventName, []);
      listenersdata = this.listeners.get(eventName);
    }

    listenersdata.push(listenerData);

    if (subscribeFlag) {
      const subscribeReturn: SubscribeReturn = await Electron.ipcRenderer.invoke(CHANNELS.SUBSCRIBE, eventName);
      if (subscribeReturn.isSuccess === false)
        throw new CoreAPIError(Errors.SUBSCRIBE_FAIL(eventName, subscribeReturn.data));
    }

    return listenerData.id;
  }

  onSync(eventName: string, listener: Listener): ListenerID {
    return this._subscribeSync(eventName, listener, false);
  }
  onceSync(eventName: string, listener: Listener): ListenerID {
    return this._subscribeSync(eventName, listener, true);
  }

  removeSync(eventName: string, id: ListenerID): void {

    const listenersData = this.listeners.get(eventName);
    if (listenersData === undefined)
      throw new CoreAPIError(Errors.UNSUBSCRIBE_EVENT_NO_LISTENERS(eventName));

    const listenerDataIndex = listenersData.findIndex((_listenerData) => _listenerData.id === id);
    if (listenerDataIndex === -1)
      throw new CoreAPIError(Errors.UNSUBSCRIBE_EVENT_UNKNOWN_LISTENER(eventName));

    if (listenersData.length === 1) {

      this.listeners.delete(eventName);

      const unsubscribeReturn: SubscribeReturn = Electron.ipcRenderer.sendSync(CHANNELS.UNSUBSCRIBE, eventName);
      if (unsubscribeReturn.isSuccess === false)
        throw new CoreAPIError(Errors.UNSUBSCRIBE_FAIL(eventName, unsubscribeReturn.data));
    }
    else
      listenersData.splice(listenerDataIndex, 1);

  }

  _subscribeSync(eventName: string, listener: Listener, isOnce: boolean): ListenerID {

    const subscribeReturn: SubscribeReturn = Electron.ipcRenderer.sendSync(CHANNELS.SUBSCRIBE, eventName);
    if (subscribeReturn.isSuccess === false)
      throw new CoreAPIError(Errors.SUBSCRIBE_FAIL(eventName, subscribeReturn.data));

    const listenerData: ListenerData = {
      listener,
      isOnce,
      id: newID()
    };

    let listenersdata = this.listeners.get(eventName);

    if (listenersdata === undefined) {
      listenersdata = [];
      this.listeners.set(eventName, listenersdata);
    }

    listenersdata.push(listenerData);
    
    return listenerData.id;
  }

  async getEvents() {
    return await Electron.ipcRenderer.invoke(CHANNELS.GET_EVENTS);
  }
  getEventsSync() {
    return Electron.ipcRenderer.sendSync(CHANNELS.GET_EVENTS);
  }

  async _handler(event: Electron.IpcRendererEvent, eventName: string, args: SimpleObject[]) {
    const listenersData = this.listeners.get(eventName);
    if (listenersData === undefined)
      return console.error(new CoreAPIError(Errors.EVENT_HAVENT_LISTENERS(eventName)));

    const filtedListenersData = listenersData.filter((listenerData) => {
      try {
        listenerData.listener(...args);
      }
      catch (error) {
        console.error(error);
      }

      return !listenerData.isOnce;
    });

    if (filtedListenersData.length === 0) {

      this.listeners.delete(eventName);

      const unsubscribeReturn: SubscribeReturn = await Electron.ipcRenderer.invoke(CHANNELS.UNSUBSCRIBE, eventName);
      if (unsubscribeReturn.isSuccess === false)
        console.error(new CoreAPIError(Errors.UNSUBSCRIBE_FAIL(eventName, unsubscribeReturn.data)));
    }
    else
      this.listeners.set(eventName, filtedListenersData);
  }

  async _close() {

    await this._handler(undefined, WINDOW_CLOSE_EVENT_NAME, []);

    this.listeners.forEach((listenersData, eventName) => {
      if (eventName === WINDOW_CLOSE_EVENT_NAME)
        return;

      const unsubscribeReturn: SubscribeReturn = Electron.ipcRenderer.sendSync(CHANNELS.UNSUBSCRIBE, eventName);
      if (unsubscribeReturn.isSuccess === false)
        throw new CoreAPIError(Errors.UNSUBSCRIBE_FAIL(eventName, unsubscribeReturn.data));

    });

  }

}

