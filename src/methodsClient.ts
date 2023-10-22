import Electron from 'electron';
import CoreAPIError from './error';
import { createID } from './simpleSymbol';

import Errors from './errorMessages';
import CHANNELS from './ipcChannels';

import { MethodName, MethodReturn, MethodsList, MethodID, SimpleObject, TupleToSimpleObject } from './types';
type MethodsPromisesMap<T> = Map<MethodID, PromiseData<T>>;
type PromiseData<T> = {
  resolve: (value?: SimpleObject<T>) => void;
  reject: (value?: SimpleObject<T> | Error) => void;
  methodName: MethodName;
}

const newID = createID;

export default class CoreAPIMethodsClient {

  private methodsPromises: MethodsPromisesMap<any> = new Map();

  constructor() {
    this.execute = this.execute.bind(this);
    this.getMethods = this.getMethods.bind(this);
    this.executeSync = this.executeSync.bind(this);
    this.getMethodsSync = this.getMethodsSync.bind(this);

    this._executeHandler = this._executeHandler.bind(this);

    Electron.ipcRenderer.on(CHANNELS.EXECUTE, this._executeHandler);
  }

  execute<T extends any[]>(methodName: MethodName, ...args: TupleToSimpleObject<T>): Promise<SimpleObject<any>> {
    return new Promise((resolve, reject) => {

      const id: MethodID = newID();
      const data: PromiseData<any> = { resolve, reject, methodName };

      this.methodsPromises.set(id, data);

      Electron.ipcRenderer.send(CHANNELS.EXECUTE, methodName, id, ...args)
    });
  }
  _executeHandler(event: Electron.IpcRendererEvent, id: MethodID, answer: MethodReturn): void {

    const promise = this.methodsPromises.get(id);
    if (promise === undefined)
      return console.warn(Errors.NONPENDING_WARN());

    if (answer.isSuccess === false)
      return promise.reject(new CoreAPIError(Errors.METHOD_EXECUTE_ERROR(promise.methodName, answer.data)));

    if (answer.isObject)
      answer.data = JSON.parse(answer.data);

    promise.resolve(answer.data);
  }

  executeSync<T extends any[]>(methodName: MethodName, ...args: TupleToSimpleObject<T>): SimpleObject<any> {
    const answer: MethodReturn = Electron.ipcRenderer.sendSync(CHANNELS.EXECUTE_SYNC, methodName, ...args);

    if (answer.isSuccess === false)
      throw new CoreAPIError(Errors.METHOD_EXECUTE_ERROR(methodName, answer.data));

    if (answer.isObject)
      answer.data = JSON.parse(answer.data);

    return answer.data;
  }

  async getMethods(): Promise<MethodsList> {
    return JSON.parse(await Electron.ipcRenderer.invoke(CHANNELS.GET_METHODS));
  }
  getMethodsSync(): MethodsList {
    return JSON.parse(Electron.ipcRenderer.sendSync(CHANNELS.GET_METHODS));
  }
}