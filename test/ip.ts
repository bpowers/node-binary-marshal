// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as chai from 'chai';
import * as socket from '../lib/socket';
import { Marshal } from '../lib/marshal';

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
			let err = socket.IPv4StrToBytes(buf, 0, t.addr);
			expect(err).to.not.be.ok;
			if (t.binary) {
				// TODO: test
			}
			let out = socket.IPv4BytesToStr(buf, 0);
			expect(out).to.equal(t.addr);
		});
	});
});

describe('ipv4 error', () => {
	IPv4_ERR_TESTS.forEach((t: RoundtripData) => {
		it('should error ' + t.addr, () => {
			let buf = new Uint8Array(4);
			let err = socket.IPv4StrToBytes(buf, 0, t.addr);
			expect(err).to.be.ok;
		});
	});
});


describe('ip marshal', () => {
	let t  = {
		family: 1,
		port: 2,
		addr: '127.0.0.1',
	};
	it('should marshal ' + t.addr, () => {
		let buf = new Uint8Array(16);
		let err = Marshal(buf, t, socket.SockAddrInDef);
		expect(err).to.not.be.ok;
	});
});
