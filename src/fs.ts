// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


import { StructDef, Marshal, Unmarshal, isZero } from './marshal';
import * as utf8 from './utf8';

export interface Timespec {
	sec:  number;
	nsec: number;
}

export const TimespecDef: StructDef = {
	fields: [
		{name: 'sec',  type: 'int64'},
		{name: 'nsec', type: 'int64'},
	],
	alignment: 'natural',
	length: 16,
};

export interface Timeval {
	sec:  number;
	nsec: number;
}

export const TimevalDef = TimespecDef;

function nullMarshal (dst: DataView, off: number, src: any): [number, Error] {
	return [undefined, null];
};

function nullUnmarshal (src: DataView, off: number): [any, number, Error] {
	return [null, undefined, null];
};

function timespecMarshal (dst: DataView, off: number, src: any): [number, Error] {
	let timestamp = Date.parse(src);
	let secs = Math.floor(timestamp/1000);
	let timespec = {
		sec: secs,
		nsec: (timestamp - secs*1000)*1e6,
	};
	return Marshal(dst, off, timespec, TimespecDef);
};

function timespecUnmarshal (src: DataView, off: number): [any, number, Error] {
	let timespec: any = {};
	let [len, err] = Unmarshal(timespec, src, off, TimespecDef);
	let sec = timespec.sec;
	let nsec = timespec.nsec;
	let timestr = new Date(sec*1e3 + nsec/1e6).toISOString();
	return [timestr, len, err];
};

export interface Stat {
	dev:     number;
	ino:     number;
	nlink:   number;
	mode:    number;
	uid:     number;
	gid:     number;
	rdev:    number;
	size:    number;
	blksize: number;
	blocks:  number;
	atime:   string;
	mtime:   string;
	ctime:   string;
}

export const StatDef: StructDef = {
	fields: [
		{name: 'dev',     type: 'uint64'},
		{name: 'ino',     type: 'uint64'},
		{name: 'nlink',   type: 'uint64'},
		{name: 'mode',    type: 'uint32'},
		{name: 'uid',     type: 'uint32'},
		{name: 'gid',     type: 'uint32'},
		{name: 'X__pad0', type: 'int32', marshal: nullMarshal, unmarshal: nullUnmarshal, omit: true},
		{name: 'rdev',    type: 'uint64'},
		{name: 'size',    type: 'int64'},
		{name: 'blksize', type: 'int64'},
		{name: 'blocks',  type: 'int64'},
		{name: 'atime',   type: 'Timespec', count: 2, marshal: timespecMarshal, unmarshal: timespecUnmarshal},
		{name: 'mtime',   type: 'Timespec', count: 2, marshal: timespecMarshal, unmarshal: timespecUnmarshal},
		{name: 'ctime',   type: 'Timespec', count: 2, marshal: timespecMarshal, unmarshal: timespecUnmarshal},
		{name: 'X__unused', type: 'int64', count: 3, marshal: nullMarshal, unmarshal: nullUnmarshal, omit: true},
	],
	alignment: 'natural', // 'packed'
	length: 144,
};

// corresponds to the DT_* constants
export enum DT {
	UNKNOWN = 0,
	FIFO    = 1,
	CHR     = 2,
	DIR     = 4,
	BLK     = 6,
	REG     = 8,
	LNK     = 10,
	SOCK    = 12,
	WHT     = 14,
};

export class Dirent {
	ino:    number;
	type:   DT;
	name:   string;

	constructor(ino: number, type: DT, name: string) {
		this.ino = ino;
		this.type = type;
		this.name = name;
	}

	get off(): number {
		return 0;
	}

	get reclen(): number {
		let slen = utf8.utf8ToBytes(this.name).length;
		let nZeros = nzeros(slen);
		return slen + nZeros + 1 + 2 + 8 + 8;
	}
}

/*
  This function matches the following pattern:
	0: 5
	1: 4
	2: 3
	3: 2
	4: 1
	5: 8
	6: 7
	7: 6
	8: 5
	9: 4

  Which is what we want for the size of trailing whitespace in
  dirents -- which needs to end up padding the structure to be
  8-byte aligned, and needs at least 1 trailing null so that the
  bytes can be seen as a null-terminated C string.
*/
function nzeros(nBytes: number): number {
	return (8 - ((nBytes+3) % 8))
}

function nameMarshal(dst: DataView, off: number, src: any): [number, Error] {
	if (typeof src !== 'string')
		return [undefined, new Error('src not a string: ' + src)];

	let bytes = utf8.utf8ToBytes(src);
	let nZeros = nzeros(bytes.length);

	if (off + bytes.length + nZeros > dst.byteLength)
		return [undefined, new Error('dst not big enough')];

	for (let i = 0; i < bytes.length; i++)
		dst.setUint8(off+i, bytes[i]);

	for (let i = 0; i < nZeros; i++)
		dst.setUint8(off+bytes.length+i, 0);

	return [bytes.length + nZeros, null];
};

function nameUnmarshal(src: DataView, off: number): [any, number, Error] {
	let len = 0;
	for (let i = off; i < src.byteLength && src.getUint8(i) !== 0; i++)
		len++;

	let str = utf8.utf8Slice(src, off, off+len);
	let nZeros = nzeros(len);

	return [str, len + nZeros, null];
};

export const DirentDef: StructDef = {
	fields: [
		{name: 'ino',    type: 'uint64'},
		{name: 'off',    type: 'int64'},
		{name: 'reclen', type: 'uint16'},
		{name: 'type',   type: 'uint8'},
		{name: 'name',   type: 'string', marshal: nameMarshal, unmarshal: nameUnmarshal},
	],
	alignment: 'natural', // 'packed'
};
