import Electron from 'electron';

import { MethodName, EventName, SimpleObject, TupleToSimpleObject, Listener, ListenerID } from './types';

import CoreAPIMethodsClient from './methodsClient';
import CoreAPIListenersClient from './listenersClient';
import CHANNELS from './ipcChannels';

export default class CoreAPIClient {

  _methods = new CoreAPIMethodsClient();
  _listeners = new CoreAPIListenersClient();

  isDebug = false;
  isProduction = false;

  constructor() {
    this.exec = this.exec.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.remove = this.remove.bind(this);
    this.methods = this.methods.bind(this);
    this.events = this.events.bind(this);

    this.execSync = this.execSync.bind(this);
    this.onSync = this.onSync.bind(this);
    this.onceSync = this.onceSync.bind(this);
    this.removeSync = this.removeSync.bind(this);
    this.methodsSync = this.methodsSync.bind(this);
    this.eventsSync = this.eventsSync.bind(this);

    this.isDebug = Electron.ipcRenderer.sendSync(CHANNELS.GET_IS_DEBUG);
    this.isProduction = Electron.ipcRenderer.sendSync(CHANNELS.GET_IS_PRODUCTION);
  }

  async exec<T extends any[]>(methodName: MethodName, ...args: TupleToSimpleObject<T>): Promise<SimpleObject<any>> {
    return this._methods.execute(methodName, ...args);
  }
  async on(eventName: EventName, listener: Listener): Promise<ListenerID> {
    return this._listeners.on(eventName, listener);
  }
  async once(eventName: EventName, listener: Listener): Promise<ListenerID> {
    return this._listeners.once(eventName, listener);
  }
  async remove(eventName: EventName, listenerID: ListenerID): Promise<void> {
    return this._listeners.remove(eventName, listenerID);
  }

  execSync<T extends any[]>(methodName: MethodName, ...args: TupleToSimpleObject<T>): SimpleObject<any> {
    return this._methods.executeSync(methodName, ...args);
  }
  onSync(eventName: EventName, listener: Listener): ListenerID {
    return this._listeners.onSync(eventName, listener);
  }
  onceSync(eventName: EventName, listener: Listener): ListenerID {
    return this._listeners.onceSync(eventName, listener);
  }
  removeSync(eventName: EventName, listenerID: ListenerID): void {
    return this._listeners.removeSync(eventName, listenerID);
  }

  methods() {
    return this._methods.getMethods();
  }
  events() {
    return this._listeners.getEvents();
  }

  methodsSync() {
    return this._methods.getMethodsSync();
  }
  eventsSync() {
    return this._listeners.getEventsSync();
  }
}