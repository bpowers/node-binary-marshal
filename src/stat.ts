// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


import { MarshalFn, isZero } from './marshal';

export interface Timespec {
	sec:  number;
	nsec: number;
}

export const TimespecDef = {
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

let nullMarshal = (dst: DataView, off: number, src: any): any => {};

export interface Stat {
	family: number;
	port:   number;
	addr:   string;
}

export const StatDef = {
	fields: [
		{name: 'dev',     type: 'uint64'},
		{name: 'ino',     type: 'uint64'},
		{name: 'nlink',   type: 'uint64'},
		{name: 'mode',    type: 'uint32'},
		{name: 'uid',     type: 'uint32'},
		{name: 'gid',     type: 'uint32'},
		{name: 'X__pad0', type: 'int32', marshal: nullMarshal, omit: true},
		{name: 'rdev',    type: 'uint64'},
		{name: 'size',    type: 'int64'},
		{name: 'blksize', type: 'int64'},
		{name: 'blocks',  type: 'int64'},
		{name: 'atime',   type: 'int64', count: 2, marshal: nullMarshal},
		{name: 'mtime',   type: 'int64', count: 2, marshal: nullMarshal},
		{name: 'ctime',   type: 'int64', count: 2, marshal: nullMarshal},
		{name: 'X__unused', type: 'int64', count: 3, marshal: nullMarshal, omit: true},
	],
	alignment: 'natural', // 'packed'
	length: 144,
};
