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
		console.log(type)
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
		let hi = (field/((-1 >>> 0)+1)) >>> 0;
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
		let hi = (field/((-1 >>> 0)+1))|0;
		buf.setInt32(off, lo, true);
		buf.setInt32(off+4, hi, true);
		return [8, null];
	},
};

const READ_FNS: {[n: string]: UnmarshalFn} = {
	uint8: function(buf: DataView, off: number): [number, number, Error] {
		let field = buf.getUint8(off) >>> 0;
		return [field, 1, null];
	},
	uint16: function(buf: DataView, off: number): [number, number, Error] {
		let field = buf.getUint16(off, true) >>> 0;
		return [field, 2, null];
	},
	uint32: function(buf: DataView, off: number): [number, number, Error] {
		let field = buf.getUint32(off, true) >>> 0;
		return [field, 4, null];
	},
	uint64: function(buf: DataView, off: number): [number, number, Error] {

		let lo = buf.getUint32(off, true);
		let hi = buf.getUint32(off+4, true);
		if (hi !== 0)
			hi *= ((-1 >>> 0)+1);
		return [lo + hi, 8, null];
	},
	int8: function(buf: DataView, off: number): [number, number, Error] {
		let field = buf.getInt8(off)|0;
		return [field, 1, null];
	},
	int16: function(buf: DataView, off: number): [number, number, Error] {
		let field = buf.getInt16(off, true)|0;
		return [field, 2, null];
	},
	int32: function(buf: DataView, off: number): [number, number, Error] {
		let field = buf.getInt32(off, true)|0;
		return [field, 4, null];
	},
	int64: function(buf: DataView, off: number): [number, number, Error] {
		let lo = buf.getInt32(off, true);
		let hi = buf.getInt32(off+4, true);
		if (hi !== 0)
			hi *= ((-1 >>> 0)+1);
		return [lo + hi, 8, null];
	},
};

// object is defined as 'any', as we're using index notation to read
// the fields defined in `def` from `obj`.  I don't know of a
// type-safe way to do this.  Suggestions welcome.
export function Marshal(buf: DataView, off: number, obj: any, def: StructDef): [number, Error] {
	if (!buf || !obj || !def)
		return [0, new Error('missing required inputs')];

	let start = off;

	const write = WRITE_FNS;
	for (let i = 0; i < def.fields.length; i++) {
		let field: FieldDef = def.fields[i];

		let val = obj[field.name];
		let len: number;
		let err: Error;
		if (field.marshal)
                        [len, err] = field.marshal(buf, off, val);
		else
			[len, err] = write[field.type](buf, off, val);
		if (err)
			return [off - start, err];

		if (len === undefined)
			len = fieldLen(field);
		off += len;
	}

	return [off - start, null];
}

export function Unmarshal(obj: any, buf: DataView, off: number, def: StructDef): [number, Error] {
	if (!buf || !def)
		return [0, new Error('missing required inputs')];

	let start = off;

	const read = READ_FNS;
	for (let i = 0; i < def.fields.length; i++) {
		let field: FieldDef = def.fields[i];

		let val: any;
		let len: number;
		let err: Error;

		if (field.unmarshal)
			[val, len, err] = field.unmarshal(buf, off);
		else
			[val, len, err] = read[field.type](buf, off);
		if (err)
			return [off - start, err];

		if (!field.omit)
			obj[field.name] = val;

		if (len === undefined)
			len = fieldLen(field);
		off += len;
	}

	return [off - start, null];
}


export function isZero(field: DataView): boolean {
	for (let i = 0; i < field.byteLength; i++) {
		if (field.getUint8(i) !== 0)
			return false;
	}
	return true;
}
