export interface StructDef {
    fields: FieldDef[];
    alignment: string;
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
    (dst: Uint8Array, off: number, src: any): any;
}
export interface UnmarshalFn {
    (src: Uint8Array, off: number): any;
}
export interface EnsureFn {
    (field: Uint8Array): boolean;
}
export declare function Marshal(buf: Uint8Array, obj: any, def: StructDef): any;
export declare function isZero(field: Uint8Array): boolean;
