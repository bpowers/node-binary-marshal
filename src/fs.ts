// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


import { StructDef, Marshal, Unmarshal, isZero } from './marshal';

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
