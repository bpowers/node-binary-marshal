// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.
'use strict';
var marshal_1 = require('./marshal');
function IPv4BytesToStr(src, off) {
    if (!off)
        off = 0;
    return '' + src[off + 0] + '.' + src[off + 1] + '.' + src[off + 2] + '.' + src[off + 3];
}
exports.IPv4BytesToStr = IPv4BytesToStr;
function IPv4StrToBytes(dst, off, src) {
    if (!dst || dst.length < 4)
        return 'invalid dst';
    dst[off + 0] = 0;
    dst[off + 1] = 0;
    dst[off + 2] = 0;
    dst[off + 3] = 0;
    var start = 0;
    var n = off;
    for (var i = 0; i < src.length && n < off + 4; i++) {
        if (src[i] === '.') {
            n++;
            continue;
        }
        dst[n] = dst[n] * 10 + parseInt(src[i], 10);
    }
    return undefined;
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
