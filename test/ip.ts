// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as chai from 'chai';
import * as socket from '../lib/socket';
import { Marshal, Unmarshal } from '../lib/marshal';

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
			let view = new DataView(buf.buffer, buf.byteOffset);
			let [len, err] = socket.IPv4StrToBytes(view, 0, t.addr);
			expect(len).to.equal(4);
			expect(err).to.not.be.ok;
			if (t.binary) {
				// TODO: test
			}
			let out: string;
			[out, len, err] = socket.IPv4BytesToStr(view, 0);
			expect(out).to.equal(t.addr);
			expect(len).to.equal(4);
			expect(err).to.not.be.ok;
		});
	});
});

describe('ipv4 error', () => {
	IPv4_ERR_TESTS.forEach((t: RoundtripData) => {
		it('should error ' + t.addr, () => {
			let buf = new Uint8Array(4);
			let view = new DataView(buf.buffer, buf.byteOffset);
			let [len, err] = socket.IPv4StrToBytes(view, 0, t.addr);
			expect(len).to.equal(4);
			expect(err).to.be.ok;
		});
	});
});


describe('ip marshal', () => {
	let t  = {
		family: 1,
		port: 6379,
		addr: '127.0.0.1',
	};
	it('should marshal ' + t.addr, () => {
		let buf = new Uint8Array(socket.SockAddrInDef.length);
		let view = new DataView(buf.buffer, buf.byteOffset);
		let [len, err] = Marshal(view, 0, t, socket.SockAddrInDef);
		expect(err).to.not.be.ok;
	});
	it('should unmarshal ' + t.addr, () => {
		let buf = new Uint8Array(socket.SockAddrInDef.length);
		let view = new DataView(buf.buffer, buf.byteOffset);
		let [len, err] = Marshal(view, 0, t, socket.SockAddrInDef);

		let out: any = {};
		[len, err] = Unmarshal(out, view, 0, socket.SockAddrInDef)
		expect(err).to.not.be.ok;
		expect(out).to.deep.equal(t);
	});
});
