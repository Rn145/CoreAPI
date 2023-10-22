
import { ID } from './simpleSymbol';

type JSON =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSON }
  | Array<JSON>;

type JSONInterface<ArgType> = { [key in keyof ArgType]: JSON };

export type SimpleObject<ArgType> = JSON | JSONInterface<ArgType>;
export type TupleToSimpleObject<T extends any[]> = Array<SimpleObject<T[number]>>;

export type Window = Electron.BrowserWindow;
export type Windows = Window[];

export type MethodName = string;
export type MethodID = ID;
export type Method = <T>(window: Window, ...args: SimpleObject<T>[]) => SimpleObject<any>;
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
export type HasEventReturn = boolean;