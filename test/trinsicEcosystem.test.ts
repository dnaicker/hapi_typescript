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
	it("trinsic ecosystem test", async() => {
		const res = await server.inject({
			method: "get",
			url: "/trinsicEcoSystemInfo"
		});
		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`urn:trinsic:ecosystems:CSIR`);
	});
})