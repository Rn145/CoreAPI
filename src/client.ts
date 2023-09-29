import Electron from 'electron';
import CoreAPIError from './error';

import { MethodName } from './methodsMain';
import { EventName } from './listenersMain';

import { } from '.';
import CoreAPIMethodsClient from './methodsClient';
import CoreAPIListenersClient, { Listener, ListenerID } from './listenersClient';
import { SimpleObject } from './libs/simpleTypes';

export const CHANNELS = {
  GET_VERSION: 'CoreAPI: get_version_channel',
}


export default class CoreAPIClient {

  _methods = new CoreAPIMethodsClient();
  _listeners = new CoreAPIListenersClient();

  version = 'development';

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

    this.version = Electron.ipcRenderer.sendSync(CHANNELS.GET_VERSION);
  }

  async exec(methodName: MethodName, ...args: SimpleObject[]): Promise<SimpleObject> {
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

  execSync(methodName: MethodName, ...args: SimpleObject[]): SimpleObject {
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