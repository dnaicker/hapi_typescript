import {Server} from "@hapi/hapi";
import {describe, it, beforeEach, afterEach} from "mocha";
import {expect} from "chai";

import {init} from "../src/server";

describe('trinsic v2', async() => {
	let server: Server;
	// ------------------
	// configure server
	beforeEach((done) => {
		init().then(result => {
			server = result;
			done();
		})
	});
	
	afterEach((done) => {
		server.stop().then(() => done());
	});
	
	// ------------------
	// first test
	// it("trinsic ecosystem account login", async() => {
	// 	const res = await server.inject({
	// 		method: "GET",
	// 		url: "/trinsicCreateOrLoginAccount/dnaicker@gmail.com",
	// 	});
		
	// 	console.log(res.payload);

	// 	expect(res.statusCode).to.equal(200);
	// });
	
	// ------------------
	// second test
	// conduct test after second test using 10 min email test
	it("trinsic ecosystem account create test", async() => {
		const res = await server.inject({
			method: "post",
			payload: {"challenge":{"type":"Buffer","data":[25,145,191,76,201,110,247,175,113,186,215,181,175,64,92,148,240,182,159,225,243,242,43,15,134,200,33,142,209,82,108,17]}},
			url: "/trinsicRegisterAccount/575975",
		});
		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`trinsic account created`);
	});
})