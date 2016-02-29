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
            console.log(type);
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
        return [1, null];
    },
    uint16: function (buf, off, field) {
        field = field >>> 0;
        buf.setUint16(off, field, true);
        return [2, null];
    },
    uint32: function (buf, off, field) {
        field = field >>> 0;
        buf.setUint32(off, field, true);
        return [4, null];
    },
    uint64: function (buf, off, field) {
        var lo = field >>> 0;
        var hi = (field / ((-1 >>> 0) + 1)) >>> 0;
        buf.setUint32(off, lo, true);
        buf.setUint32(off + 4, hi, true);
        return [8, null];
    },
    int8: function (buf, off, field) {
        field = field | 0;
        buf.setInt8(off, field);
        return [1, null];
    },
    int16: function (buf, off, field) {
        field = field | 0;
        buf.setInt16(off, field, true);
        return [2, null];
    },
    int32: function (buf, off, field) {
        field = field | 0;
        buf.setInt32(off, field, true);
        return [4, null];
    },
    int64: function (buf, off, field) {
        var lo = field | 0;
        var hi = (field / ((-1 >>> 0) + 1)) | 0;
        buf.setInt32(off, lo, true);
        buf.setInt32(off + 4, hi, true);
        return [8, null];
    },
};
var READ_FNS = {
    uint8: function (buf, off) {
        var field = buf.getUint8(off) >>> 0;
        return [field, 1, null];
    },
    uint16: function (buf, off) {
        var field = buf.getUint16(off, true) >>> 0;
        return [field, 2, null];
    },
    uint32: function (buf, off) {
        var field = buf.getUint32(off, true) >>> 0;
        return [field, 4, null];
    },
    uint64: function (buf, off) {
        var lo = buf.getUint32(off, true);
        var hi = buf.getUint32(off + 4, true);
        if (hi !== 0)
            hi *= ((-1 >>> 0) + 1);
        return [lo + hi, 8, null];
    },
    int8: function (buf, off) {
        var field = buf.getInt8(off) | 0;
        return [field, 1, null];
    },
    int16: function (buf, off) {
        var field = buf.getInt16(off, true) | 0;
        return [field, 2, null];
    },
    int32: function (buf, off) {
        var field = buf.getInt32(off, true) | 0;
        return [field, 4, null];
    },
    int64: function (buf, off) {
        var lo = buf.getInt32(off, true);
        var hi = buf.getInt32(off + 4, true);
        if (hi !== 0)
            hi *= ((-1 >>> 0) + 1);
        return [lo + hi, 8, null];
    },
};
function Marshal(buf, off, obj, def) {
    if (!buf || !obj || !def)
        return [0, new Error('missing required inputs')];
    var start = off;
    var write = WRITE_FNS;
    for (var i = 0; i < def.fields.length; i++) {
        var field = def.fields[i];
        var val = obj[field.name];
        var len = void 0;
        var err = void 0;
        if (field.marshal)
            _a = field.marshal(buf, off, val), len = _a[0], err = _a[1];
        else
            _b = write[field.type](buf, off, val), len = _b[0], err = _b[1];
        if (err)
            return [off - start, err];
        if (len === undefined)
            len = fieldLen(field);
        off += len;
    }
    return [off - start, null];
    var _a, _b;
}
exports.Marshal = Marshal;
function Unmarshal(obj, buf, off, def) {
    if (!buf || !def)
        return [0, new Error('missing required inputs')];
    var start = off;
    var read = READ_FNS;
    for (var i = 0; i < def.fields.length; i++) {
        var field = def.fields[i];
        var val = void 0;
        var len = void 0;
        var err = void 0;
        if (field.unmarshal)
            _a = field.unmarshal(buf, off), val = _a[0], len = _a[1], err = _a[2];
        else
            _b = read[field.type](buf, off), val = _b[0], len = _b[1], err = _b[2];
        if (err)
            return [off - start, err];
        if (!field.omit)
            obj[field.name] = val;
        if (len === undefined)
            len = fieldLen(field);
        off += len;
    }
    return [off - start, null];
    var _a, _b;
}
exports.Unmarshal = Unmarshal;
function isZero(field) {
    for (var i = 0; i < field.byteLength; i++) {
        if (field.getUint8(i) !== 0)
            return false;
    }
    return true;
}
exports.isZero = isZero;
