import { StructDef } from './marshal';
export interface Timespec {
    sec: number;
    nsec: number;
}
export declare const TimespecDef: StructDef;
export interface Timeval {
    sec: number;
    nsec: number;
}
export declare const TimevalDef: StructDef;
export interface Stat {
    family: number;
    port: number;
    addr: string;
}
export declare const StatDef: StructDef;
