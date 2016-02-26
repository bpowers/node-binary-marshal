// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';


export interface StructDef {
	fields:    FieldDef[];
	alignment: string;
	length?:   number;
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
	(dst: DataView, off: number, src: any): [number, Error];
}

export interface UnmarshalFn {
	(src: DataView, off: number): [any, number, Error];
}

export interface EnsureFn {
	(field: DataView): boolean;
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
	uint8: function(buf: DataView, off: number, field: number): [number, Error] {
		field = field >>> 0;
		buf.setUint8(off, field);
		return [1, null];
	},
	uint16: function(buf: DataView, off: number, field: number): [number, Error] {
		field = field >>> 0;
		buf.setUint16(off, field, true);
		return [2, null];
	},
	uint32: function(buf: DataView, off: number, field: number): [number, Error] {
		field = field >>> 0;
		buf.setUint32(off, field, true);
		return [4, null];
	},
	uint64: function(buf: DataView, off: number, field: number): [number, Error] {
		let lo = field >>> 0;
		let hi = 0;
		if (field > lo)
			hi = (field - (-1 >>> 0)) >>> 0;
		buf.setUint32(off, lo, true);
		buf.setUint32(off+4, hi, true);
		return [8, null];
	},
	int8: function(buf: DataView, off: number, field: number): [number, Error] {
		field = field|0;
		buf.setInt8(off, field);
		return [1, null];
	},
	int16: function(buf: DataView, off: number, field: number): [number, Error] {
		field = field|0;
		buf.setInt16(off, field, true);
		return [2, null];
	},
	int32: function(buf: DataView, off: number, field: number): [number, Error] {
		field = field|0;
		buf.setInt32(off, field, true);
		return [4, null];
	},
	int64: function(buf: DataView, off: number, field: number): [number, Error] {
		let lo = field|0;
		let hi = 0;
		if (field > lo)
			hi = (field - (-1 >>> 0))|0;
		buf.setInt32(off, lo, true);
		buf.setInt32(off+4, hi, true);
		return [8, null];
	},
};

export function Marshal(buf: DataView, off: number, obj: any, def: StructDef): any {
	if (!buf || !obj || !def)
		return 'missing required inputs';

	const write = WRITE_FNS;
	for (let i = 0; i < def.fields.length; i++) {
		let field: FieldDef = def.fields[i];

		let len: number;
		let err: Error;
		if (field.marshal)
			[len, err] = field.marshal(buf, off, obj[field.name]);
		else
			[len, err] = write[field.type](buf, off, obj[field.name]);
		if (err)
			throw err;

		if (len === undefined)
			len = fieldLen(field);
		off += len;
	}
}


export function isZero(field: DataView): boolean {
	for (let i = 0; i < field.byteLength; i++) {
		if (field.getUint8(i) !== 0)
			return false;
	}
	return true;
}
