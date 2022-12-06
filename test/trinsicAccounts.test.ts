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
				"challenge":[249,135,166,144,87,72,154,171,172,45,57,75,146,211,92,112,217,134,168,250,183,209,212,10,137,148,227,43,245,135,216,119],
				"otp": "436760"
			},
			url: "/trinsicRegisterAccount",
		});
		console.log(res);
		expect(res.statusCode).to.equal(200);
	});
})