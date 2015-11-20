// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


export function IPv4BytesToStr(src: Uint8Array): any {
	return '' + src[0] + '.' + src[1] + '.' + src[2] + '.' + src[3];
}

export function IPv4StrToBytes(dst: Uint8Array, src: string): any {
	if (!dst || dst.length < 4)
		return 'invalid dst';
	dst[0] = 0;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;

	let start = 0;
	let n = 0;
	for (let i = 0; i < src.length && n < 4; i++) {
		if (src[i] === '.') {
			n++;
			continue;
		}
		dst[n] = dst[n]*10 + parseInt(src[i], 10);
	}
	return undefined;
}

export function isZero(field: Uint8Array): boolean {
	for (let i = 0; i < field.length; i++) {
		if (field[i] !== 0)
			return false;
	}
	return true;
}

export interface SockAddrIn {
	family: number;
	port:   number;
	addr:   string;
}

export interface MarshalFn {
	(dst: Uint8Array, src: any): any;
}

export interface UnmarshalFn {
	(src: Uint8Array): any;
}

export interface EnsureFn {
	(field: Uint8Array): boolean;
}

export interface FieldDef {
	name:       string;
	type:       string; // 'u?int{8,16,32,64}'
	count?:     number;
	JSONType?:  string;
	marshal?:   MarshalFn;
	unmarshal?: UnmarshalFn;
	ensure?:    EnsureFn;
	omit?:      boolean;
}

export interface StructDef {
	fields:    FieldDef[];
	alignment: string;
}

export const defs: {[n: string]: StructDef} = {
	SockAddrIn: {
		fields: [
			{name: 'family', type: 'uint16'},
			{name: 'port',   type: 'uint16'},
			{
				name:      'addr',
				type:      'uint8',
				count:     4,
				JSONType:  'string',
				marshal:   IPv4StrToBytes,
				unmarshal: IPv4BytesToStr,
			},
			{
				name:   'zero',
				type:   'uint8',
				count:  8,
				ensure: isZero,
				omit:   true,
			},
		],
		alignment: 'natural', // 'packed'
	},
};
