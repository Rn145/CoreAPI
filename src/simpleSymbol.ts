
export type ID = string;

export const createID = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default class SimpleSymbol {

    ids: Map<symbol, string> = new Map();
    symbols: Map<string, symbol> = new Map();

    hasAtID(id: ID): boolean {
        return this.symbols.has(id);
    }
    hasAtSymbol(symbol: symbol): boolean {
        return this.ids.has(symbol);
    }

    getAtID(id: ID): symbol | undefined {
        return this.symbols.get(id);
    }
    getAtSymbol(symbol: symbol): ID | undefined {
        return this.ids.get(symbol);
    }

    createAtID(id: ID): symbol | undefined {
        return this.symbols.get(id);
    }
    createAtSymbol(symbol: symbol): ID | undefined {
        return this.ids.get(symbol);
    }

    _create(): { symbol: symbol; id: ID; } {
        const symbol = Symbol();
        const id = createID();

        this.symbols.set(id, symbol);
        this.ids.set(symbol, id);

        return { symbol, id };
    }
    createSymbol(): symbol {
        return this._create().symbol;
    }
    createID(): ID {
        return this._create().id;
    }

    removeAtID(id: ID): boolean {
        return this.symbols.delete(id);
    }
    removeAtSymbol(symbol: symbol): boolean {
        return this.ids.delete(symbol);
    }


}