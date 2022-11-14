import {Server} from "@hapi/hapi";
import {describe, it, beforeEach, afterEach} from "mocha";
import {expect} from "chai";
import {init} from "../src/server";

describe('test suite', async() => {
	let server: Server;

	beforeEach((done) => {
		init().then(result => {
			server = result;
			done();
		})
	});
	
	afterEach((done) => {
		server.stop().then(() => done());
	});
	
	//-------------------
	// request: authKey, JSON template field params
	it("createCredentialTemplate", async() => {
		const res = await server.inject({
			method: "POST",
			payload: {
				"data": {
					"accountAuthToken": "",
					"title": "credential title test",
					"fields": [
						{
							"name": "name1",
							"type": "string",
							"description": "test"
						}
					]
				} 
			},
			url: "/createCredentialTemplate",
		});

		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`createCredentialTemplate`);
	});
	
	//-------------------
	// Request: json body of fields
	it("insertCredentialTemplateValues", async() => {
		const res = await server.inject({
			method: "POST",
			payload: {
				
			},
			url: "/insertCredentialTemplateValues",
		});

		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`insertCredentialTemplateValues`);
	});
	
	//-------------------
	// request: authKey, credentialTemplateId, credentialValues
	it("createCredential", async() => {
		const res = await server.inject({
			method: "POST",
			payload: {
				
			},
			url: "/createCredential",
		});

		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`createCredential`);
	});
	
	//-------------------
	// request: email, credentialData
	it("sendCredential", async() => {
		const res = await server.inject({
			method: "POST",
			payload: {
				
			},
			url: "/sendCredential",
		});

		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`sendCredential`);
	});
	
	//-------------------
	// request: authKey, credentialData
	it("saveCredential", async() => {
		const res = await server.inject({
			method: "POST",
			payload: {
				
			},
			url: "/saveCredential",
		});

		expect(res.statusCode).to.equal(200);
		expect(res.result).to.equal(`saveCredential`);
	});


})