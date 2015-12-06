export declare function IPv4BytesToStr(src: Uint8Array, off: number): any;
export declare function IPv4StrToBytes(dst: Uint8Array, off: number, src: string): any;
export interface SockAddrIn {
    family: number;
    port: number;
    addr: string;
}
export declare const SockAddrInDef: {
    fields: ({
        name: string;
        type: string;
    } | {
        name: string;
        type: string;
        count: number;
        JSONType: string;
        marshal: (dst: Uint8Array, off: number, src: string) => any;
        unmarshal: (src: Uint8Array, off: number) => any;
    } | {
        name: string;
        type: string;
        count: number;
        ensure: (field: Uint8Array) => boolean;
        omit: boolean;
    })[];
    alignment: string;
    length: number;
};
