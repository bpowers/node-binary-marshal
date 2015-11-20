// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


export interface StructDef {
	fields:    FieldDef[];
	alignment: string;
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

export interface MarshalFn {
	(dst: Uint8Array, off: number, src: any): any;
}

export interface UnmarshalFn {
	(src: Uint8Array, off: number): any;
}

export interface EnsureFn {
	(field: Uint8Array): boolean;
}

function typeLen(type: string): number {
	switch (type) {
	case 'uint8':
	case 'int8':
		return 1;
	case 'uint16':
	case 'int16':
		return 2;
	case 'uint32':
	case 'int32':
		return 4;
	case 'uint64':
	case 'int64':
		return 8;
	case 'float32':
		return 4;
	case 'float64':
		return 8;
	default:
		console.log('unknown type');
		debugger;
		return undefined;
	}
}

function fieldLen(field: FieldDef): number {
	let len = typeLen(field.type);
	return len * (field.count ? field.count : 1)
}

const WRITE_FNS: {[n: string]: MarshalFn} = {
	uint8: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off] = field;
	},
	uint16: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off+0] = (field) >>> 0;
		buf[off+1] = (field) >>> 8;
	},
	uint32: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off+0] = (field) >>> 0;
		buf[off+1] = (field) >>> 8;
		buf[off+2] = (field) >>> 16;
		buf[off+3] = (field) >>> 24;
	},
	uint64: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off+0] = (field) >>> 0;
		buf[off+1] = (field) >>> 8;
		buf[off+2] = (field) >>> 16;
		buf[off+3] = (field) >>> 24;
		buf[off+4] = (field) >>> 32;
		buf[off+5] = (field) >>> 40;
		buf[off+6] = (field) >>> 48;
		buf[off+7] = (field) >>> 56;
	},
	int8: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off] = field;
	},
	int16: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off+0] = (field) >> 0;
		buf[off+1] = (field) >> 8;
	},
	int32: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off+0] = (field) >> 0;
		buf[off+1] = (field) >> 8;
		buf[off+2] = (field) >> 16;
		buf[off+3] = (field) >> 24;
	},
	int64: function(buf: Uint8Array, off: number, field: number): any {
		field = field|0;
		buf[off+0] = (field) >> 0;
		buf[off+1] = (field) >> 8;
		buf[off+2] = (field) >> 16;
		buf[off+3] = (field) >> 24;
		buf[off+4] = (field) >> 32;
		buf[off+5] = (field) >> 40;
		buf[off+6] = (field) >> 48;
		buf[off+7] = (field) >> 56;
	},
};

export function Marshal(buf: Uint8Array, obj: any, def: StructDef): any {
	if (!buf || !obj || !def)
		return 'missing required inputs';

	const write = WRITE_FNS;
	let off = 0;
	for (let i = 0; i < def.fields.length; i++) {
		let field: FieldDef = def.fields[i];

		let err: any;
		if (field.marshal)
			err = field.marshal(buf, off, obj[field.name]);
		else
			err = write[field.type](buf, off, obj[field.name]);
		if (err)
			throw new Error(err);

		let len = fieldLen(field);
		off += len;
	}
}


export function isZero(field: Uint8Array): boolean {
	for (let i = 0; i < field.length; i++) {
		if (field[i] !== 0)
			return false;
	}
	return true;
}
