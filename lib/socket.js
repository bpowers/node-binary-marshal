'use strict';
var marshal_1 = require('./marshal');
function IPv4BytesToStr(src, off) {
    if (!off)
        off = 0;
    return [
        '' + src.getUint8(off + 0) +
            '.' + src.getUint8(off + 1) +
            '.' + src.getUint8(off + 2) +
            '.' + src.getUint8(off + 3),
        4,
        null
    ];
}
exports.IPv4BytesToStr = IPv4BytesToStr;
function IPv4StrToBytes(dst, off, src) {
    if (!dst || dst.byteLength < 4)
        return [undefined, new Error('invalid dst')];
    dst.setUint8(off + 0, 0);
    dst.setUint8(off + 1, 0);
    dst.setUint8(off + 2, 0);
    dst.setUint8(off + 3, 0);
    var start = 0;
    var n = off;
    for (var i = 0; i < src.length && n < off + 4; i++) {
        if (src[i] === '.') {
            n++;
            continue;
        }
        dst.setUint8(n, dst.getUint8(n) * 10 + parseInt(src[i], 10));
    }
    return [4, null];
}
exports.IPv4StrToBytes = IPv4StrToBytes;
exports.SockAddrInDef = {
    fields: [
        { name: 'family', type: 'uint16' },
        { name: 'port', type: 'uint16' },
        {
            name: 'addr',
            type: 'uint8',
            count: 4,
            JSONType: 'string',
            marshal: IPv4StrToBytes,
            unmarshal: IPv4BytesToStr,
        },
        {
            name: 'zero',
            type: 'uint8',
            count: 8,
            ensure: marshal_1.isZero,
            omit: true,
        },
    ],
    alignment: 'natural',
    length: 16,
};
