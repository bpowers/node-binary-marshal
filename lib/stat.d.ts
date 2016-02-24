export interface Timespec {
    sec: number;
    nsec: number;
}
export declare const TimespecDef: {
    fields: {
        name: string;
        type: string;
    }[];
    alignment: string;
    length: number;
};
export interface Timeval {
    sec: number;
    nsec: number;
}
export declare const TimevalDef: {
    fields: {
        name: string;
        type: string;
    }[];
    alignment: string;
    length: number;
};
export interface Stat {
    family: number;
    port: number;
    addr: string;
}
export declare const StatDef: {
    fields: ({
        name: string;
        type: string;
    } | {
        name: string;
        type: string;
        marshal: (dst: DataView, off: number, src: any) => any;
        omit: boolean;
    } | {
        name: string;
        type: string;
        count: number;
        marshal: (dst: DataView, off: number, src: any) => any;
    } | {
        name: string;
        type: string;
        count: number;
        marshal: (dst: DataView, off: number, src: any) => any;
        omit: boolean;
    })[];
    alignment: string;
    length: number;
};
