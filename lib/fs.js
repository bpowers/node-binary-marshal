'use strict';
var marshal_1 = require('./marshal');
var utf8 = require('./utf8');
exports.TimespecDef = {
    fields: [
        { name: 'sec', type: 'int64' },
        { name: 'nsec', type: 'int64' },
    ],
    alignment: 'natural',
    length: 16,
};
exports.TimevalDef = exports.TimespecDef;
function nullMarshal(dst, off, src) {
    return [undefined, null];
}
;
function nullUnmarshal(src, off) {
    return [null, undefined, null];
}
;
function timespecMarshal(dst, off, src) {
    var timestamp = src.getTime();
    var secs = Math.floor(timestamp / 1000);
    var timespec = {
        sec: secs,
        nsec: (timestamp - secs * 1000) * 1e6,
    };
    return marshal_1.Marshal(dst, off, timespec, exports.TimespecDef);
}
;
function timespecUnmarshal(src, off) {
    var timespec = {};
    var _a = marshal_1.Unmarshal(timespec, src, off, exports.TimespecDef), len = _a[0], err = _a[1];
    var sec = timespec.sec;
    var nsec = timespec.nsec;
    return [new Date(sec * 1e3 + nsec / 1e6), len, err];
}
;
exports.StatDef = {
    fields: [
        { name: 'dev', type: 'uint64' },
        { name: 'ino', type: 'uint64' },
        { name: 'nlink', type: 'uint64' },
        { name: 'mode', type: 'uint32' },
        { name: 'uid', type: 'uint32' },
        { name: 'gid', type: 'uint32' },
        { name: 'X__pad0', type: 'int32', marshal: nullMarshal, unmarshal: nullUnmarshal, omit: true },
        { name: 'rdev', type: 'uint64' },
        { name: 'size', type: 'int64' },
        { name: 'blksize', type: 'int64' },
        { name: 'blocks', type: 'int64' },
        { name: 'atime', type: 'Timespec', count: 2, marshal: timespecMarshal, unmarshal: timespecUnmarshal },
        { name: 'mtime', type: 'Timespec', count: 2, marshal: timespecMarshal, unmarshal: timespecUnmarshal },
        { name: 'ctime', type: 'Timespec', count: 2, marshal: timespecMarshal, unmarshal: timespecUnmarshal },
        { name: 'X__unused', type: 'int64', count: 3, marshal: nullMarshal, unmarshal: nullUnmarshal, omit: true },
    ],
    alignment: 'natural',
    length: 144,
};
(function (DT) {
    DT[DT["UNKNOWN"] = 0] = "UNKNOWN";
    DT[DT["FIFO"] = 1] = "FIFO";
    DT[DT["CHR"] = 2] = "CHR";
    DT[DT["DIR"] = 4] = "DIR";
    DT[DT["BLK"] = 6] = "BLK";
    DT[DT["REG"] = 8] = "REG";
    DT[DT["LNK"] = 10] = "LNK";
    DT[DT["SOCK"] = 12] = "SOCK";
    DT[DT["WHT"] = 14] = "WHT";
})(exports.DT || (exports.DT = {}));
var DT = exports.DT;
;
var Dirent = (function () {
    function Dirent(ino, type, name) {
        this.ino = ino;
        this.type = type;
        this.name = name;
    }
    Object.defineProperty(Dirent.prototype, "off", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dirent.prototype, "reclen", {
        get: function () {
            var slen = utf8.utf8ToBytes(this.name).length;
            var nZeros = nzeros(slen);
            return slen + nZeros + 1 + 2 + 8 + 8;
        },
        enumerable: true,
        configurable: true
    });
    return Dirent;
}());
exports.Dirent = Dirent;
function nzeros(nBytes) {
    return (8 - ((nBytes + 3) % 8));
}
function nameMarshal(dst, off, src) {
    if (typeof src !== 'string')
        return [undefined, new Error('src not a string: ' + src)];
    var bytes = utf8.utf8ToBytes(src);
    var nZeros = nzeros(bytes.length);
    if (off + bytes.length + nZeros > dst.byteLength)
        return [undefined, new Error('dst not big enough')];
    for (var i = 0; i < bytes.length; i++)
        dst.setUint8(off + i, bytes[i]);
    for (var i = 0; i < nZeros; i++)
        dst.setUint8(off + bytes.length + i, 0);
    return [bytes.length + nZeros, null];
}
;
function nameUnmarshal(src, off) {
    var len = 0;
    for (var i = off; i < src.byteLength && src.getUint8(i) !== 0; i++)
        len++;
    var str = utf8.utf8Slice(src, off, off + len);
    var nZeros = nzeros(len);
    return [str, len + nZeros, null];
}
;
exports.DirentDef = {
    fields: [
        { name: 'ino', type: 'uint64' },
        { name: 'off', type: 'int64' },
        { name: 'reclen', type: 'uint16' },
        { name: 'type', type: 'uint8' },
        { name: 'name', type: 'string', marshal: nameMarshal, unmarshal: nameUnmarshal },
    ],
    alignment: 'natural',
};
