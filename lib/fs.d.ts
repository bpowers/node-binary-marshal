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
    atime: Date;
    mtime: Date;
    ctime: Date;
}
export declare const StatDef: StructDef;
export declare enum DT {
    UNKNOWN = 0,
    FIFO = 1,
    CHR = 2,
    DIR = 4,
    BLK = 6,
    REG = 8,
    LNK = 10,
    SOCK = 12,
    WHT = 14,
}
export declare class Dirent {
    ino: number;
    type: DT;
    name: string;
    constructor(ino: number, type: DT, name: string);
    off: number;
    reclen: number;
}
export declare const DirentDef: StructDef;
