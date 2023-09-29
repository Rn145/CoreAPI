# Electron CoreAPI
Это инструмент для быстрой связи main процесса с renderer процессом в Electron.
Он основан на IPC инструментарии самого Electron, и создан дабы снизить сложность работы с IPC полностью абстагировав разработчика от него.

### Особенность
Благодаря CoreAPI вы можете прокинуть свои методы/функции из main процесса в renderer процессы всего за одну строку кода. Нужно лишь указать имя новоиспечёного метода и саму функцию.
Со стороны renderer процессов Использование так же легко. Нужно лишь вызвать CoreAPI.exec() указав имя вызываемого метода, и далее аргументы для этого метода.
И это всё что нужно сделать, ведь далее работа с CoreAPI со стороны renderer процессов не чем не отличается от обычной работы с функцией. Вы так же получаете данные и задаёте аргументы.

### Методы
CoreAPI поддерживает методы двух типов: "только синхронные" и "синхронные или асинхронные".
Вам не нужно переживать что проброс асинхронной функции вызовет проблеммы, точно так же как и не стоит переживать по поводу только синхронных функций.
Нужно лишь указать как вам нужно.

### События
События, которые спокойно можно инициировать со стороны main процесса и прослушивать со строны renderer процесса, спокойно позволяют реализовать множество асинхронных действий, инициатором которых не всегда может являться renderer процесс.
На основе событий можно реализовать потоки данных в сторону renderer процессов, а обратно уже через методы.

### Неудобство
Чтобы со старта приложения у вас были проброшены все методы, их надо регистрировать до загрузки окна.
При использовании webpack не рекомендуется использовать, идущий в комплекте CoreAPI, preload скрипт. Вы можете его скопировать в исходный код своего проекта.
Работает лишь между main и renderer процессами, не поддерживая передачу только между renderer процессами или только между main процессами.

## Быстрый старт
CoreAPI это два модуля: один работает со стороны main процесса, другой со стороны renderer процесса.
Эти модули по отдельности доступны в каждом из процессов.

Для подключения CoreAPI и начала работы с ним его нужно импортировать его в main процесс.
Инициализируем/регистрируем все ваши методы, и после этого можно создовать окно.
В CoreAPI уже есть готовый preload файл с подключением electron-core-api/client как window.CoreAPI;
Советуем изучить наш preload файл перед тем, как отказываться от него.

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
Для регистрации своего метода нужно воспользоваться addMethod(), передав в него имя новоиспечёного метода и функцию реализующую функционал этого метода.
Для возврата значения обратно в renderer процесс просто верните его через return;
Дабы избежать конфликтов с другими методами рекомендуем подразделять их по функционалу на "библиотеки/группы" по шаблону "имяГруппы.имяМетода".

Так же учтите что асинхронные методы можно вызвать только асинхронно, а синхронные методы можно вызывать как синхронно так и асинхронно.
Не забывайте указывать что метод является синхронным, ведь по умолчанию метод будет регистрироваться как асинхронный.

В функцию вашего метода будут поступать все аргументы которые ему были передавы из renderer процесса.
Однако, помимо аргументов из renderer процесса, первым аргументов будет вклиниваться Electron.BrowserWindow объект renderer процесса, инициировавший метод.

```ts
// initMethods

import CoreAPI from 'electron-core-api'
// или import CoreAPI from 'electron-core-api/main'

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

Конечное использование вашего метода в renderer процессе почти ничем не отличается от вызова обычной функции.
Однако если хотите, и если нужно указание типов в TypeScript, можете обвернуть вызов вашего метода в функцию.

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
Информация об отладке. Вводится вами вручную. Просто транслируется в renderer процессы. Притом, renderer процесс запрашивает это событие только при запуске.
```ts
CoreAPI.isDebug: boolean
```

### isProduction
Информация о версии приложения. Вводится вами вручную. Просто транслируется в renderer процессы. Притом, renderer процесс запрашивает это событие только при запуске.
```ts
CoreAPI.isProduction: boolean
```

### getPreloadPath()
Возвращает путь до готового preload файла с подключением CoreAPI как window.CoreAPI
```ts
CoreAPI.getPreloadPath(): string
```

### getMethod(methodName)
Возвращает, по имени метода, объект, с информацией об этом методе. Объект содержит функцию реализующую этот метод и свойство, указывающее что метод может быть, или является синхронным.
```ts
CoreAPI.getMethod(methodName: MethodName): MethodData | undefined
```

### getMethodsName()
Возвращает объект со списками только асинхронных и синхронноасинхронных методов.
```ts
CoreAPI.getMethodsName(): MethodsList
```

### addMethod(methodName, method, isSync?)
Регестрирует метод (method) под указанным именем (methodName).
Если isSync указан true то метод можно вызвать как синхронно так и асинхронно, иначе только асинхронно.
Возвращает true если успешно зарегестрирован.
```ts
CoreAPI.addMethod(methodName: MethodName, method: Method, isSync?: boolean): boolean
```

### hasMethod(methodName)
Возвращает true если метод под указанным именем (methodName) зарегестрирован
```ts
CoreAPI.hasMethod(methodName: MethodName): boolean
```

### removeMethod(methodName)
Удаляет метод под указанным именем (methodName).
Возвращает true если метод был найден и удалён.
```ts
CoreAPI.removeMethod(methodName: MethodName): boolean
```


### getEventsName()
Возвращает список событый, доступных для прослушивания.
```ts
CoreAPI.getEventsName(): EventName[]
```

### addEvent(eventName)
Регестрирует сыбытие, для прослушивания в renderer процессах.
Возвращает true если событие было успешно зарегестрировано.
```ts
CoreAPI.addEvent(eventName: EventName): boolean
```

### hasEvent(eventName)
Возвращает true если событие пот указанным именем (eventName) зарегестрировано.
```ts
CoreAPI.hasEvent(eventName: EventName): boolean
```

### removeEvent(eventName)
Удаляет событие под указанным именем (eventName).
Возвращает true если событие было найдено и удалено.
```ts
CoreAPI.removeEvent(eventName: EventName): boolean
```

### callEvent(eventName, ...args)
Инициирует событие под указанным именем (eventName) во всех renderer процессах передавая в них данные (...args)
```ts
CoreAPI.callEvent(eventName: EventName, ...args: SimpleObject[]): void
```

### callEventInWindow(eventName, window, ...args)
Инициирует событие под указанным именем (eventName) в указанном renderer процессе (window) передавая в них данные (...args)
```ts
CoreAPI.callEventInWindow(eventName: EventName, window: Window, ...args: SimpleObject[]): void
```


## API renderer process (electron-core-api/client)

### isDebug
Информация об отладке. Устанавливается в main процессе. Запрашивается при создании renderer процесса.
```ts
CoreAPI.isDebug: boolean
```

### isProduction
Информация о версии приложения. Устанавливается в main процессе. Запрашивается при создании renderer процесса.
```ts
CoreAPI.isProduction: boolean
```

### exec(methodName, ...args)
Инициирует вызов метода под указанным именем (methodName) предавая в него указанные аргументы (...args).
Возвращает результат работы метода.
Синхронная версия exec не может выполнить только асинхронный метод и выдаст ошибку.
```ts
CoreAPI.exec(methodName: EventName, ...args: SimpleObject[]): Promise<SimpleObject>
CoreAPI.sync.exec(methodName: EventName, ...args: SimpleObject[]): SimpleObject
```

### on(eventName, listener)
Регестрирует указанного прослушивателя (listener) на зарегистрированное событие (eventName)
Возвращает уникальный идентификатор созданного прослушивателя.
```ts
CoreAPI.on(eventName: EventName, listener: Listener): Promise<ListenerID>
CoreAPI.sync.on(eventName: EventName, listener: Listener): ListenerID
```

### once(eventName, listener)
Регестрирует указанного прослушивателя (listener) на зарегистрированное событие (eventName) для одноразового прослушивания, после чего прослушиватель удаляется.
Возвращает уникальный идентификатор созданного прослушивателя.
```ts
CoreAPI.once(eventName: EventName, listener: Listener): Promise<ListenerID>
CoreAPI.sync.once(eventName: EventName, listener: Listener): ListenerID
```

### remove(eventName, listenerID)
Удаляет прослушивателя по индивидуальному идентификатору (listenerID).
```ts
CoreAPI.remove(eventName: EventName, listenerID: ListenerID): Promise<void>
CoreAPI.sync.remove(eventName: EventName, listenerID: ListenerID): void
```

### methods()
Возвращает объект со списками всех зарегистрированных методов.
```ts
CoreAPI.methodsSync(): Promise<MethodsList>
CoreAPI.sync.methodsSync(): MethodsList
```

### events()
Возвращает список всех зарегистрированных событий.
```ts
CoreAPI.eventsSync(): Promise<EventName[]>
CoreAPI.sync.eventsSync(): EventName[]
```

