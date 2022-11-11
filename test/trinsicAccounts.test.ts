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
				"challenge":{"type":"Buffer","data":[228,14,254,96,138,12,112,220,116,205,209,36,136,160,69,83,123,136,45,63,127,177,88,135,142,120,72,9,196,48,173,206]}
			},
			url: "/trinsicRegisterAccount/804483",
		});
		// console.log(res);
		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`trinsic account created`);
	});
})