
import { ID } from './simpleSymbol';

type SimpleType = string | number | boolean | null | undefined;
export type SimpleObject = SimpleType | SimpleObject[] | { [index: string]: SimpleObject };

export type Window = Electron.BrowserWindow;
export type Windows = Window[];

export type MethodName = string;
export type MethodID = ID;
export type Method = (window: Window, ...args: SimpleObject[]) => SimpleObject;
export type MethodReturn = {
  isSuccess: boolean;
  isObject: boolean;
  data: any;
}
export type MethodData = {
  method: Method;
  isSync: boolean;
}
export type MethodsList = {
  async: MethodName[];
  sync: MethodName[];
}


export type EventName = string;
export type ListenerID = ID;
export type Listener = Function;
export type SubscribeReturn = {
  isSuccess: boolean;
  data: string;
}