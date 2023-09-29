import Electron from 'electron';
import CoreAPIError from './error';

import { SimpleObject } from './libs/simpleTypes';
import { CHANNELS, MethodID, MethodName, MethodReturn, MethodsList, newID } from './methodsMain';
import Errors from './errorMessages';

export type PromiseData = {
  resolve: (value?: SimpleObject) => void;
  reject: (value?: SimpleObject | Error) => void;
  methodName: MethodName;
}
export type MethodsPromisesMap = Map<MethodID, PromiseData>;

// Проверку существования запрашиваемой функции стало возможным произвести сразу здесь, нежели производить проверку в API/index.js
// Но в API/index.js готова полноценная обработка ошибок, а здесь их приём. Изменять проверку запрашиваемых функций не рекомендуется.

export default class CoreAPIMethodsClient {

  methodsPromises: MethodsPromisesMap = new Map();

  constructor() {
    this.execute = this.execute.bind(this);
    this.getMethods = this.getMethods.bind(this);
    this.executeSync = this.executeSync.bind(this);
    this.getMethodsSync = this.getMethodsSync.bind(this);

    this._executeHandler = this._executeHandler.bind(this);

    Electron.ipcRenderer.on(CHANNELS.EXECUTE, this._executeHandler);
  }

  execute(methodName: MethodName, ...args: SimpleObject[]): Promise<SimpleObject> {
    return new Promise((resolve, reject) => {

      const id: MethodID = newID();
      const data: PromiseData = { resolve, reject, methodName };

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

  executeSync(methodName: MethodName, ...args: SimpleObject[]): SimpleObject {
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