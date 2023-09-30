# Electron CoreAPI

[EN](https://github.com/Rn145/CoreAPI/tree/main#electron-coreapi "English")
[RU](https://github.com/Rn145/CoreAPI/blob/main/README_RU.md "Русский")

This is a tool for fast communication between the main process and the renderer process in Electron.
It is based on the IPC toolkit of Electron itself and is designed to simplify working with IPC by fully abstracting the developer from it.

### Feature
With CoreAPI, you can expose your methods/functions from the main process to the renderer processes with just one line of code.
You only need to specify the name of the newly created method and the function itself.
From the perspective of renderer processes, usage is equally easy.
You only need to call `CoreAPI.exec()` specifying the name of the method to be called and the arguments for that method.
And that's all you need to do because working with CoreAPI from renderer processes is no different from working with a regular function.
You can also getting returned data and set arguments in the same way.

### Methods
CoreAPI supports two types of methods: "sync-only" and "sync or async".
You don't have to worry that exposing an asynchronous function will cause problems, just as you don't have to worry about sync-only functions.
You just need to indicate what you need.

### Events
Events, which can be initiated from the main process and listened to from the renderer process, allow you to easily implement multiple asynchronous actions, where the initiator doesn't always have to be the renderer process.
Based on events, you can implement data streams towards the renderer processes, and then back through methods.

### Inconvenience
* To have all methods exposed from the start of the application, they need to be registered before the window is loaded.
* When using webpack, it is not recommended to use the bundled CoreAPI's preload script. You can copy it to your project's source code.
* It only works between main and renderer processes, not supporting communication solely between renderer processes or solely between main processes.

## Quick Start
CoreAPI consists of two modules: one works on the main process side, the other on the renderer process side.
These modules are separately available in each process.

To connect and start working with CoreAPI, it needs to be imported into the main process.
Initialize/register all your methods, and then you can create a window.
CoreAPI already has a ready-made preload file with the inclusion of electron-core-api/client as `window.CoreAPI`.
We recommend that you study our preload file before abandoning it.

```ts
// main
import CoreAPI from 'electron-core-api'
import initMethods from './initMethods'

initMethods();

const preloadPath: string = CoreAPI.getPreloadPath();
mainWindow = new BrowserWindow({
	// ...
	webPreferences: {
	  preload: preloadPath,
	}
});
```

To register your method, use `CoreAPI.addMethod()`, passing the name of the newly created method and the function implementing the functionality of this method.
To return a value back to the renderer process, simply return it using `return`.
To avoid conflicts with other methods, we recommend organizing them by functionality into "libraries/groups" following the template "groupName.methodName".

Also, keep in mind that asynchronous methods can only be called asynchronously, while synchronous methods can be called both synchronously and asynchronously.
Do not forget to specify that a method is synchronous, as by default the method will be registered as asynchronous.

Your method's function will receive all the arguments that were passed to it from the renderer process.
However, in addition to the arguments from the renderer process, the first argument will be an `Electron.BrowserWindow` object of the renderer process that initiated the method.

```ts
// initMethods

import CoreAPI from 'electron-core-api'
// or import CoreAPI from 'electron-core-api/main'

import Electron from 'electron'
type Window = Electron.BrowserWindow;

import fs from 'fs'

async function testAsync(window: Window, argA: string, argB: string){
	return await fs.promises.copyFile(argA, argB);
}

function testSync(window: Window, argA: string, argB: string){
	return fs.copyFileSync(argA, argB);
}

function setTitle(window: Window, title: string){
	window.setTitle(title);
}

export default ()=>{
	
	CoreAPI.addMethod(`testMethod.testAsync`, testAsync);
	CoreAPI.addMethod(`testMethod.testSync`, testSync, true);
	CoreAPI.addMethod(`testMethod.testTitle`, setTitle, true);
}
```

The final usage of your method in the renderer process is almost indistinguishable from calling a regular function.
However, if desired and if type annotations in TypeScript are required, you can wrap the call to your method in a function.

```ts
// renderer

CoreAPI.exec('testMethod.testAsync', 'file_src', 'file_trg').then(result=>{
	console.log('async testAsync', result);
});

CoreAPI.exec('testMethod.testSync', 'file_src', 'file_trg').then(result=>{
	console.log('async testSync', result);
});

const result = CoreAPI.sync.exec('testMethod.testSync', 'file_src', 'file_trg');
console.log('sync testSync', result);

function setTitle(title: string){
	CoreAPI.exec('testMethod.testTitle', title);
	console.log('title is changed');
}

setTitle('THE MOST TITLE');
```


## API types
```ts
type MethodName = string;

type EventName = string;

type Window = Electron.BrowserWindow;

type ListenerID = string;

type SimpleType = string | number | boolean | null | undefined;
type SimpleObject = SimpleType | SimpleObject[] | { [index: string]: SimpleObject };

type Method = (window: Window, ...args: SimpleObject[]) => SimpleObject;

type MethodData = {
  method: Method;
  isSync: boolean;
}

type MethodsList = {
  async: MethodName[];
  sync: MethodName[];
}

```



## API main process (electron-core-api/main)

### isDebug
Debug information.
Entered manually by you.
Simply transmitted to renderer processes.
The renderer process requests this property only on startup.
```ts
CoreAPI.isDebug: boolean
```

### isProduction
Application version information.
Entered manually by you.
Simply transmitted to renderer processes.
The renderer process requests this property only on startup.
```ts
CoreAPI.isProduction: boolean
```

### getPreloadPath()
Returns the path to the ready preload file with CoreAPI included as `window.CoreAPI`.
```ts
CoreAPI.getPreloadPath(): string
```

### getMethod(methodName)
Returns an object with information about the method.
The object contains a function that implements this method and a property indicating whether the method can be or is synchronous.
```ts
CoreAPI.getMethod(methodName: MethodName): MethodData | undefined
```

### getMethodsName()
Returns an object with lists of only asynchronous and synchronous-asynchronous methods.
```ts
CoreAPI.getMethodsName(): MethodsList
```

### addMethod(methodName, method, isSync?)
Registers a method under the specified name.
If isSync is set to true, the method can be called both synchronously and asynchronously, otherwise only asynchronously.
Returns true if successfully registered.
```ts
CoreAPI.addMethod(methodName: MethodName, method: Method, isSync?: boolean): boolean
```

### hasMethod(methodName)
Returns true if a method with the specified name is registered.
```ts
CoreAPI.hasMethod(methodName: MethodName): boolean
```

### removeMethod(methodName)
Removes the method with the specified name.
Returns true if the method was found and removed.
```ts
CoreAPI.removeMethod(methodName: MethodName): boolean
```


### getEventsName()
Returns a list of events available for listening.
```ts
CoreAPI.getEventsName(): EventName[]
```

### addEvent(eventName)
Registers an event for listening in renderer processes.
Returns true if the event was successfully registered.
```ts
CoreAPI.addEvent(eventName: EventName): boolean
```

### hasEvent(eventName)
Returns true if an event with the specified name is registered.
```ts
CoreAPI.hasEvent(eventName: EventName): boolean
```

### removeEvent(eventName)
Removes the event with the specified name.
Returns true if the event was found and removed.
```ts
CoreAPI.removeEvent(eventName: EventName): boolean
```

### callEvent(eventName, ...args)
Triggers the event with the specified name in all renderer processes, passing them data.
```ts
CoreAPI.callEvent(eventName: EventName, ...args: SimpleObject[]): void
```

### callEventInWindow(eventName, window, ...args)
Triggers the event with the specified name in the specified renderer process, passing them data.
```ts
CoreAPI.callEventInWindow(eventName: EventName, window: Window, ...args: SimpleObject[]): void
```


## API renderer process (electron-core-api/client)

### isDebug
Debug information.
Set in the main process.
Requested when creating a renderer process.
```ts
CoreAPI.isDebug: boolean
```

### isProduction
Application version information.
Set in the main process.
Requested when creating a renderer process.
```ts
CoreAPI.isProduction: boolean
```

### exec(methodName, ...args)
Initiates a call to the method with the specified name and passes the specified arguments to it.
Returns the result of the method's execution.
The synchronous version of exec cannot execute an asynchronous method and will throw an error.
```ts
CoreAPI.exec(methodName: EventName, ...args: SimpleObject[]): Promise<SimpleObject>
CoreAPI.sync.exec(methodName: EventName, ...args: SimpleObject[]): SimpleObject
```

### on(eventName, listener)
Registers the specified listener for the registered event.
Returns the unique identifier of the created listener.
```ts
CoreAPI.on(eventName: EventName, listener: Listener): Promise<ListenerID>
CoreAPI.sync.on(eventName: EventName, listener: Listener): ListenerID
```

### once(eventName, listener)
Registers the specified listener for the registered event for one-time listening, after which the listener is removed.
Returns the unique identifier of the created listener.
```ts
CoreAPI.once(eventName: EventName, listener: Listener): Promise<ListenerID>
CoreAPI.sync.once(eventName: EventName, listener: Listener): ListenerID
```

### remove(eventName, listenerID)
Removes a listener by its unique identifier.
```ts
CoreAPI.remove(eventName: EventName, listenerID: ListenerID): Promise<void>
CoreAPI.sync.remove(eventName: EventName, listenerID: ListenerID): void
```

### methods()
Returns an object with lists of all registered methods.
```ts
CoreAPI.methods(): Promise<MethodsList>
CoreAPI.sync.methods(): MethodsList
```

### events()
Returns a list of all registered events.
```ts
CoreAPI.events(): Promise<EventName[]>
CoreAPI.sync.events(): EventName[]
```

