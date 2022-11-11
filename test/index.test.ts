// import { Server } from '@hapi/hapi';
// import {describe, it, beforeEach, afterEach} from 'mocha';
// import chain, {expect, util} from 'chai';

// import {init} from '../src/server';

// describe("smoke test", async() => {
// 	let server: Server;

// 	// create a clean server object
// 	beforeEach((done) => {
// 		init().then(result => {
// 			server = result;
// 			done();
// 		})
// 	});

// 	// cleans up server object
// 	afterEach((done) => {
// 		server.stop().then(()=> done());
// 	});

// 	// start first test
// 	it("index responds", async() => {
// 		// hapi inject method with making http call
// 		const res = await server.inject({
// 			method: 'get',
// 			url: '/'
// 		});
// 		expect(res.statusCode).to.equal(200);
// 		expect(res.result).to.equal("hello nice to meet you");
// 	});
// })