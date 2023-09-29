
export type ExecuteData = {
    execute: Function;
    isOnce: boolean;
};
export type Id = symbol;
export type Executes = Map<Id, ExecuteData>;
export type ListenersList = Map<string, Executes>;

export default class Events {

    _listeners: ListenersList = new Map();

    constructor() {
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.addListener = this.addListener.bind(this);
        this.removeListener = this.removeListener.bind(this);
        this._callListeners = this._callListeners.bind(this);
    }

    on(eventName: string, callback: Function): Id {
        return this.addListener(eventName, callback);
    }
    once(eventName: string, callback: Function): Id {
        return this.addListener(eventName, callback, true);
    }

    addListener(eventName: string, callback: Function, isOnce?: boolean): Id {

        const executeData: ExecuteData = {
            execute: callback,
            isOnce: isOnce ?? false
        }

        let event = this._listeners.get(eventName);
        if (event === undefined) {
            event = new Map();
            this._listeners.set(eventName, event);
        }

        const id = Symbol();
        event.set(id, executeData);
        return id;
    }
    removeListener(eventName: string, id: Id): boolean {

        const event = this._listeners.get(eventName);
        if (event === undefined)
            return false;

        const result = event.delete(id);

        if (event.size === 0)
            this._listeners.delete(eventName);

        return result;
    }

    _callListeners(eventName: string, ...params: any[]): boolean {

        const event = this._listeners.get(eventName);
        if (event === undefined)
            return false;

        event.forEach((executeData, id) => {

            const t = async () => await executeData.execute(...params);
            t().catch(console.error);

            if (executeData.isOnce === true)
                event.delete(id);

        });

        return true;
    }

}