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
        field = field >>> 0;
        buf.setUint8(off, field);
    },
    uint16: function (buf, off, field) {
        field = field >>> 0;
        buf.setUint16(off, field, true);
    },
    uint32: function (buf, off, field) {
        field = field >>> 0;
        buf.setUint32(off, field, true);
    },
    uint64: function (buf, off, field) {
        var lo = field >>> 0;
        var hi = 0;
        if (field > lo)
            hi = (field - (-1 >>> 0)) >>> 0;
        buf.setUint32(off, lo, true);
        buf.setUint32(off + 4, hi, true);
    },
    int8: function (buf, off, field) {
        field = field | 0;
        buf.setInt8(off, field);
    },
    int16: function (buf, off, field) {
        field = field | 0;
        buf.setInt16(off, field, true);
    },
    int32: function (buf, off, field) {
        field = field | 0;
        buf.setInt32(off, field, true);
    },
    int64: function (buf, off, field) {
        var lo = field | 0;
        var hi = 0;
        if (field > lo)
            hi = (field - (-1 >>> 0)) | 0;
        buf.setInt32(off, lo, true);
        buf.setInt32(off + 4, hi, true);
    },
};
function Marshal(buf, off, obj, def) {
    if (!buf || !obj || !def)
        return 'missing required inputs';
    var write = WRITE_FNS;
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
    for (var i = 0; i < field.byteLength; i++) {
        if (field.getUint8(i) !== 0)
            return false;
    }
    return true;
}
exports.isZero = isZero;
