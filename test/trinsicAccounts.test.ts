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
	it("trinsic account validate test", async() => {
		const res = await server.inject({
			method: "POST",
			payload: {
				"challenge":[179,111,178,67,83,232,128,115,108,22,210,251,88,76,49,241,130,55,241,103,52,30,203,248,28,1,82,51,130,37,87,126],
				"otp": "369714"
			},
			url: "/trinsicRegisterAccount",
		});
		console.log(res);
		expect(res.statusCode).to.equal(200);
	});
})