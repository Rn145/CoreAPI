
const EN = {
  NONPENDING_WARN: () => `response is received to a non-pending method. perhaps the method was canceled prematurely.`,

  METHOD_EXECUTE_ERROR: (methodName: string, error: unknown) => `method '${methodName}': ${error}.`,
  NO_ERROR: () => `no error`,
  WINDOW_UNKNOWN: () => `inside error of window detection`,
  METHOD_UNKNOWN: () => `method is not exist`,
  METHOD_ERROR: (error: unknown) => `method error: ${error}`,
  TO_JSON_ERROR: () => `returned object cantn't convert ot JSON`,
  NOT_SYNC_ERROR: () => `method is only async`,

  CALL_UNKNOWN_EVENT: (eventName: unknown) => `event ${eventName}: calling a non-existent event.`,
  CALL_UNKNOWN_WINDOW: (eventName: unknown) => `event ${eventName}: window not registered the listener on this event.`,
  SUBSCRIBE_FAIL: (eventName: unknown, error: unknown) => `event ${eventName}: subscribe fail: ${error}.`,
  UNSUBSCRIBE_FAIL: (eventName: unknown, error: unknown) => `event ${eventName}: unsubscribe fail: ${error}.`,
  UNSUBSCRIBE_EVENT_NO_LISTENERS: (eventName: unknown) => EN.UNSUBSCRIBE_FAIL(eventName, `the event does not contain a single listener`),
  UNSUBSCRIBE_EVENT_UNKNOWN_LISTENER: (eventName: unknown) => EN.UNSUBSCRIBE_FAIL(eventName, `there is no listener with this ID`),
  EVENT_UNKNOWN: () => `event is not exist`,
  EVENT_HAVENT_LISTENERS: (eventName: string) => `event ${eventName}: call fail, the event does not contain a single listener in client`,

  LOAD_FAIL: (script_path) => `error in library "${script_path}"`,
};

const RU = {
  NONPENDING_WARN: () => `пришёл ответ на неизвестный запрос выполнения метода. возможно выполнение метода было отменёно.`,

  METHOD_EXECUTE_ERROR: (methodName: string, error: unknown) => `метод '${methodName}': ${error}.`,
  NO_ERROR: () => `нет ошибок`,
  WINDOW_UNKNOWN: () => `внутренняя ошибка определения окна`,
  METHOD_UNKNOWN: () => `такого метода не существует`,
  METHOD_ERROR: (error: unknown) => `ошибка внутри метода: ${error}`,
  TO_JSON_ERROR: () => `полученный объект не удалось конвертировать в JSON`,
  NOT_SYNC_ERROR: () => `метод не является синхронным`,

  CALL_UNKNOWN_EVENT: (eventName: unknown) => `событие ${eventName}: вызов несуществующего события.`,
  CALL_UNKNOWN_WINDOW: (eventName: unknown) => `событие ${eventName}: окно не регистрировало прослушивание события.`,
  SUBSCRIBE_FAIL: (eventName: unknown, error: unknown) => `событие '${eventName}': не удалось зарегистрировать прослушивателя: ${error}.`,
  UNSUBSCRIBE_FAIL: (eventName: unknown, error: unknown) => `событие '${eventName}': не удалось снять регистрацию прослушивателя: ${error}.`,
  UNSUBSCRIBE_EVENT_NO_LISTENERS: (eventName: unknown) => RU.UNSUBSCRIBE_FAIL(eventName, `событие не имеет ни одного прослушивателя`),
  UNSUBSCRIBE_EVENT_UNKNOWN_LISTENER: (eventName: unknown) => RU.UNSUBSCRIBE_FAIL(eventName, `прослушивателя с таким ID не существует`),
  EVENT_UNKNOWN: () => `событие не существует`,
  EVENT_HAVENT_LISTENERS: (eventName: string) => `событие ${eventName}: не удалось инициировать, в renderer процессе нет прослушивателей этого события`,

  LOAD_FAIL: (script_path) => `ошибка в библиотеке "${script_path}"`,
};




export default EN;