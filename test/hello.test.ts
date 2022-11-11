// import {Server} from "@hapi/hapi";
// import {describe, it, beforeEach, afterEach} from "mocha";
// import {expect} from "chai";

// import {init} from "../src/server";

// describe('hello test', async() => {
// 	let server: Server;
// 	// ------------------
// 	// configure server
// 	beforeEach((done) => {
// 		init().then(result => {
// 			server = result;
// 			done();
// 		})
// 	});
	
// 	afterEach((done) => {
// 		server.stop().then(() => done());
// 	});
	
// 	// ------------------
// 	// first test
// 	it("says hello world", async() => {
// 		const res = await server.inject({
// 			method: "get",
// 			url: "/hello"
// 		});
// 		expect(res.statusCode).to.equal(200);
// 		expect(res.result).to.equal("Hello World");
// 	});

// 	// ------------------
// 	// second test
// 	it('says hello to a person', async () => {
// 		const res = await server.inject({
// 			method: 'get',
// 			url: '/hello/Tom'
// 		});

// 		expect(res.statusCode).to.equal(200);
// 		expect(res.result).to.equal('Hello Tom');
// 	})


// })