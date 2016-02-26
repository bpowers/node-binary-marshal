export interface StructDef {
    fields: FieldDef[];
    alignment: string;
    length?: number;
}
export interface FieldDef {
    name: string;
    type: string;
    count?: number;
    JSONType?: string;
    marshal?: MarshalFn;
    unmarshal?: UnmarshalFn;
    ensure?: EnsureFn;
    omit?: boolean;
}
export interface MarshalFn {
    (dst: DataView, off: number, src: any): [number, Error];
}
export interface UnmarshalFn {
    (src: DataView, off: number): [any, number, Error];
}
export interface EnsureFn {
    (field: DataView): boolean;
}
export declare function Marshal(buf: DataView, off: number, obj: any, def: StructDef): [number, Error];
export declare function Unmarshal(obj: any, buf: DataView, off: number, def: StructDef): [number, Error];
export declare function isZero(field: DataView): boolean;
