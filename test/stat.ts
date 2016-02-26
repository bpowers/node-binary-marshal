// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as chai from 'chai';
import * as fs from '../lib/fs';
import { Marshal, Unmarshal } from '../lib/marshal';

const expect = chai.expect;

interface RoundtripData {
	addr: string;
	binary?: number[];
}

const STAT_RT_TESTS: fs.Stat[] = [
	{
		"dev":     65024,
		"mode":    33188,
		"nlink":   1,
		"uid":     1000,
		"gid":     1000,
		"rdev":    0,
		"blksize": 4096,
		"ino":     5902877,
		"size":    526,
		"blocks":  8,
		"atime":   "2016-02-24T21:18:45.627Z",
		"mtime":   "2016-02-26T15:03:46.492Z",
		"ctime":   "2016-02-26T15:03:46.492Z",
	},
	{ // version with some numbers > 2^32
		"dev":     65024,
		"mode":    33188,
		"nlink":   1,
		"uid":     1000,
		"gid":     1000,
		"rdev":    0,
		"blksize": 4096,
		"ino":     Math.pow(2, 41) + 5,
		"size":    -(Math.pow(2, 40) + 3),
		"blocks":  8,
		"atime":   "2016-02-24T21:18:45.627Z",
		"mtime":   "2016-02-26T15:03:46.492Z",
		"ctime":   "2016-02-26T15:03:46.492Z",
	},
];

describe('stat roundtrip', () => {
	STAT_RT_TESTS.forEach((t: fs.Stat) => {
		it('should roundtrip stat for ino ' + t.ino, () => {
			let buf = new Uint8Array(fs.StatDef.length);
			let view = new DataView(buf.buffer, buf.byteOffset);
			let [len, err] = Marshal(view, 0, t, fs.StatDef);
			expect(err).to.not.be.ok;

			let out: any = {};
			[len, err] = Unmarshal(out, view, 0, fs.StatDef)
			expect(err).to.not.be.ok;
			expect(out).to.deep.equal(t);
		});
	});
});
