// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.
'use strict';
function typeLen(type) {
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
function fieldLen(field) {
    var len = typeLen(field.type);
    return len * (field.count ? field.count : 1);
}
var WRITE_FNS = {
    uint8: function (buf, off, field) {
        field = field | 0;
        buf[off] = field;
    },
    uint16: function (buf, off, field) {
        field = field | 0;
        buf[off + 0] = (field) >>> 0;
        buf[off + 1] = (field) >>> 8;
    },
    uint32: function (buf, off, field) {
        field = field | 0;
        buf[off + 0] = (field) >>> 0;
        buf[off + 1] = (field) >>> 8;
        buf[off + 2] = (field) >>> 16;
        buf[off + 3] = (field) >>> 24;
    },
    uint64: function (buf, off, field) {
        field = field | 0;
        buf[off + 0] = (field) >>> 0;
        buf[off + 1] = (field) >>> 8;
        buf[off + 2] = (field) >>> 16;
        buf[off + 3] = (field) >>> 24;
        buf[off + 4] = (field) >>> 32;
        buf[off + 5] = (field) >>> 40;
        buf[off + 6] = (field) >>> 48;
        buf[off + 7] = (field) >>> 56;
    },
    int8: function (buf, off, field) {
        field = field | 0;
        buf[off] = field;
    },
    int16: function (buf, off, field) {
        field = field | 0;
        buf[off + 0] = (field) >> 0;
        buf[off + 1] = (field) >> 8;
    },
    int32: function (buf, off, field) {
        field = field | 0;
        buf[off + 0] = (field) >> 0;
        buf[off + 1] = (field) >> 8;
        buf[off + 2] = (field) >> 16;
        buf[off + 3] = (field) >> 24;
    },
    int64: function (buf, off, field) {
        field = field | 0;
        buf[off + 0] = (field) >> 0;
        buf[off + 1] = (field) >> 8;
        buf[off + 2] = (field) >> 16;
        buf[off + 3] = (field) >> 24;
        buf[off + 4] = (field) >> 32;
        buf[off + 5] = (field) >> 40;
        buf[off + 6] = (field) >> 48;
        buf[off + 7] = (field) >> 56;
    },
};
function Marshal(buf, obj, def) {
    if (!buf || !obj || !def)
        return 'missing required inputs';
    var write = WRITE_FNS;
    var off = 0;
    for (var i = 0; i < def.fields.length; i++) {
        var field = def.fields[i];
        var err = void 0;
        if (field.marshal)
            err = field.marshal(buf, off, obj[field.name]);
        else
            err = write[field.type](buf, off, obj[field.name]);
        if (err)
            throw new Error(err);
        var len = fieldLen(field);
        off += len;
    }
}
exports.Marshal = Marshal;
function isZero(field) {
    for (var i = 0; i < field.length; i++) {
        if (field[i] !== 0)
            return false;
    }
    return true;
}
exports.isZero = isZero;