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
    dev: number;
    ino: number;
    nlink: number;
    mode: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: string;
    mtime: string;
    ctime: string;
}
export declare const StatDef: StructDef;
