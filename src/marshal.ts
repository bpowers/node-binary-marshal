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
	(dst: DataView, off: number, src: any): any;
}

export interface UnmarshalFn {
	(src: DataView, off: number): any;
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
	uint8: function(buf: DataView, off: number, field: number): any {
		field = field >>> 0;
		buf.setUint8(off, field);
	},
	uint16: function(buf: DataView, off: number, field: number): any {
		field = field >>> 0;
		buf.setUint16(off, field, true);
	},
	uint32: function(buf: DataView, off: number, field: number): any {
		field = field >>> 0;
		buf.setUint32(off, field, true);
	},
	uint64: function(buf: DataView, off: number, field: number): any {
		let lo = field >>> 0;
		let hi = 0;
		if (field > lo)
			hi = (field - (-1 >>> 0)) >>> 0;
		buf.setUint32(off, lo, true);
		buf.setUint32(off+4, hi, true);
	},
	int8: function(buf: DataView, off: number, field: number): any {
		field = field|0;
		buf.setInt8(off, field);
	},
	int16: function(buf: DataView, off: number, field: number): any {
		field = field|0;
		buf.setInt16(off, field, true);
	},
	int32: function(buf: DataView, off: number, field: number): any {
		field = field|0;
		buf.setInt32(off, field, true);
	},
	int64: function(buf: DataView, off: number, field: number): any {
		let lo = field|0;
		let hi = 0;
		if (field > lo)
			hi = (field - (-1 >>> 0))|0;
		buf.setInt32(off, lo, true);
		buf.setInt32(off+4, hi, true);
	},
};

export function Marshal(buf: Uint8Array, obj: any, def: StructDef): any {
	if (!buf || !obj || !def)
		return 'missing required inputs';

	let view = new DataView(buf.buffer, buf.byteOffset);

	const write = WRITE_FNS;
	let off = 0;
	for (let i = 0; i < def.fields.length; i++) {
		let field: FieldDef = def.fields[i];

		let err: any;
		if (field.marshal)
			err = field.marshal(view, off, obj[field.name]);
		else
			err = write[field.type](view, off, obj[field.name]);
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
