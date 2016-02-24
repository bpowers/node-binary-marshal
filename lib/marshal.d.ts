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
    (dst: DataView, off: number, src: any): any;
}
export interface UnmarshalFn {
    (src: DataView, off: number): any;
}
export interface EnsureFn {
    (field: DataView): boolean;
}
export declare function Marshal(buf: DataView, off: number, obj: any, def: StructDef): any;
export declare function isZero(field: DataView): boolean;
