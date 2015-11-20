// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as chai from 'chai';
import * as marshal from '../lib/marshal';

const expect = chai.expect;

interface RoundtripData {
	addr: string;
	binary?: number[];
}

const IPv4_RT_TESTS: RoundtripData[] = [
	{addr: '127.0.0.1'},
	{addr: '0.0.0.0'},
	{addr: '255.255.255.255'},
];

const IPv4_ERR_TESTS: RoundtripData[] = [
//	{addr: '127.0.0.'},
//	{addr: '.0.0.0.'},
//	{addr: '256.255.255.255'},
];

describe('ipv4 roundtrip', () => {
	IPv4_RT_TESTS.forEach((t: RoundtripData) => {
		it('should roundtrip ' + t.addr, () => {
			let buf = new Uint8Array(4);
			let err = marshal.IPv4StrToBytes(buf, t.addr);
			expect(err).to.not.be.ok;
			if (t.binary) {
				// TODO: test
			}
			let out = marshal.IPv4BytesToStr(buf);
			expect(out).to.equal(t.addr);
		});
	});
});

describe('ipv4 error', () => {
	IPv4_ERR_TESTS.forEach((t: RoundtripData) => {
		it('should error ' + t.addr, () => {
			let buf = new Uint8Array(4);
			let err = marshal.IPv4StrToBytes(buf, t.addr);
			expect(err).to.be.ok;
		});
	});
});
