
export type SimpleType = any;// string | number | boolean | null;
export type SimpleObject = SimpleType | SimpleObject[] | { [index: string]: SimpleObject };