// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as chai from 'chai';
import * as fs from '../lib/fs';
import { Marshal, Unmarshal } from '../lib/marshal';

const expect = chai.expect;

const DIRENT_RT_TESTS: fs.Dirent[] = [
	{
		"ino":      65024,
		"off":      12,
		"reclen":   32,
		"type":     fs.DT.REG,
		"name":     ".",
	},
	{
		"ino":      65025,
		"off":      12,
		"reclen":   32,
		"type":     fs.DT.REG,
		"name":     "中文",
	},
];

describe('dir roundtrip', () => {
	DIRENT_RT_TESTS.forEach((t: fs.Dirent) => {
		it('should roundtrip dirent for ino ' + t.ino, () => {
			let buf = new Uint8Array(1024);
			let view = new DataView(buf.buffer, buf.byteOffset);
			let [len, err] = Marshal(view, 0, t, fs.DirentDef);
			expect(err).to.not.be.ok;

			let out: any = {};
			[len, err] = Unmarshal(out, view, 0, fs.DirentDef)
			expect(err).to.not.be.ok;
			expect(out).to.deep.equal(t);
		});
	});
});
