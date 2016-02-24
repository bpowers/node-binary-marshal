// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


import { isZero } from './marshal';

export function IPv4BytesToStr(src: DataView, off: number): any {
	if (!off)
		off = 0;
	return '' + src.getUint8(off+0) +
		'.' + src.getUint8(off+1) +
		'.' + src.getUint8(off+2) +
		'.' + src.getUint8(off+3);
}

export function IPv4StrToBytes(dst: DataView, off: number, src: string): any {
	if (!dst || dst.byteLength < 4)
		return 'invalid dst';
	dst.setUint8(off+0, 0);
	dst.setUint8(off+1, 0);
	dst.setUint8(off+2, 0);
	dst.setUint8(off+3, 0);

	let start = 0;
	let n = off;
	for (let i = 0; i < src.length && n < off+4; i++) {
		if (src[i] === '.') {
			n++;
			continue;
		}
		dst.setUint8(n, dst.getUint8(n)*10 + parseInt(src[i], 10));
	}
	return undefined;
}

export interface SockAddrIn {
	family: number;
	port:   number;
	addr:   string;
}

export const SockAddrInDef = {
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
	length: 16,
};
