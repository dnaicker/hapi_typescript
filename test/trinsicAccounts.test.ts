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
				"challenge":[229,135,148,199,38,118,254,8,196,159,60,206,8,240,184,35,68,5,8,190,157,151,99,221,169,87,45,2,47,137,217,117],
				"otp": "791137"
			},
			url: "/trinsicRegisterAccount",
		});
		// console.log(res);
		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`trinsic account created`);
	});
})