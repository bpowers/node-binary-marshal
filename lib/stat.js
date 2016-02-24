'use strict';
exports.TimespecDef = {
    fields: [
        { name: 'sec', type: 'int64' },
        { name: 'nsec', type: 'int64' },
    ],
    alignment: 'natural',
    length: 16,
};
exports.TimevalDef = exports.TimespecDef;
var nullMarshal = function (dst, off, src) { };
exports.StatDef = {
    fields: [
        { name: 'dev', type: 'uint64' },
        { name: 'ino', type: 'uint64' },
        { name: 'nlink', type: 'uint64' },
        { name: 'mode', type: 'uint32' },
        { name: 'uid', type: 'uint32' },
        { name: 'gid', type: 'uint32' },
        { name: 'X__pad0', type: 'int32', marshal: nullMarshal, omit: true },
        { name: 'rdev', type: 'uint64' },
        { name: 'size', type: 'int64' },
        { name: 'blksize', type: 'int64' },
        { name: 'blocks', type: 'int64' },
        { name: 'atime', type: 'int64', count: 2, marshal: nullMarshal },
        { name: 'mtime', type: 'int64', count: 2, marshal: nullMarshal },
        { name: 'ctime', type: 'int64', count: 2, marshal: nullMarshal },
        { name: 'X__unused', type: 'int64', count: 3, marshal: nullMarshal, omit: true },
    ],
    alignment: 'natural',
    length: 144,
};
