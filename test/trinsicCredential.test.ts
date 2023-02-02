import { Server } from "@hapi/hapi";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import { init } from "../src/server";

describe('test suite', async () => {
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
	// it("createCredentialTemplate", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 				"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmQKKnVybjp0cmluc2ljOndhbGxldHM6Q2M5Um9CU0xreFVlb3YyZnBnU2NDVSI2dXJuOnRyaW5zaWM6ZWNvc3lzdGVtczppbnRlbGxpZ2VudC1nb29kYWxsLThRZEFwNnpWRmVUGjCnYO3ZQ45Yyc66eieqDIInHON-3zt-bIOx0SAqI5VGvXFYSvNiKVQlz9DRkyE1fd4iAA",
	// 				"credential_template_title": "credential title test 3",
	// 				"credential_template_fields": [
	// 					{
	// 						"name": "test name 3",
	// 						"type": "string",
	// 						"description": "test description 3"
	// 					}
	// 				]
	// 		},
	// 		url: "/createCredentialTemplate",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// 	expect(res.result).to.equal(`createCredentialTemplate`);
	// });

	// //-------------------
	// // Request: json body of fields
	// it("create credential wtih fields: string", async () => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmQKKnVybjp0cmluc2ljOndhbGxldHM6Q2M5Um9CU0xreFVlb3YyZnBnU2NDVSI2dXJuOnRyaW5zaWM6ZWNvc3lzdGVtczppbnRlbGxpZ2VudC1nb29kYWxsLThRZEFwNnpWRmVUGjCnYO3ZQ45Yyc66eieqDIInHON-3zt-bIOx0SAqI5VGvXFYSvNiKVQlz9DRkyE1fd4iAA",
	// 			"template_id": "urn:template:CSIR:credential-title-test-3-cde56f84-ac63-457b-9667-5936723f03f9",
	// 			"credential_values": {
	// 				"test_name_3": "test value 3"
	// 			},
	// 		},
	// 		url: "/createCredential",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// 	expect(res.result).to.equal(`createCredential`);
	// });

	// //-------------------
	// // request: authKey, credentialTemplateId, credentialValues
	// it("storeCredential using auth token as issuer", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkwKKnVybjp0cmluc2ljOndhbGxldHM6VW45TGpFNUVjN0ZCUFRvNzFURFpVQSIedXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpkZWZhdWx0GjCAevCcnadUa3HuncGb_YN6BFwU-jgBzgZZHR4hABloaRWyEVo2T1uqFz0lOTWSrf0iAA",
	// 			"credential_document": '{"@context":["https://www.w3.org/2018/credentials/v1","https://w3id.org/bbs/v1","https://schema.trinsic.cloud/CSIR/credential-title-test-3-cde56f84-ac63-457b-9667-5936723f03f9/context"],"type":["VerifiableCredential","CredentialTitleTest3-cde56f84-ac63-457b-9667-5936723f03f9"],"credentialSchema":[{"id":"https://schema.trinsic.cloud/CSIR/credential-title-test-3-cde56f84-ac63-457b-9667-5936723f03f9","type":"JsonSchemaValidator2018"}],"credentialSubject":{"test_name_3":"test value 3","id":"urn:uuid:f4ba57366bbb428ebcea16dd37550a25"},"id":"urn:uuid:64b72f1c86f34ad2a65d7b20a92adbe1","issuanceDate":"2022-11-15T07:35:07.2344257Z","credentialStatus":{"id":"urn:revocation-registry:intelligent-goodall-8QdAp6zVFeT:E95rX3mLwqYVPtt3DLcrC7#1","type":"RevocationList2020Status","revocationListIndex":"1","revocationListCredential":"urn:revocation-registry:intelligent-goodall-8QdAp6zVFeT:E95rX3mLwqYVPtt3DLcrC7"},"issuer":"did:key:z5TcDaC3hWxTACAbQNXTKpumJUCGPjyoRiJjYBKZj6jRFGrGUR4d58BYTg4Btqi5LA2udUE4pkCqyHrNdqY5A3MoRCWX5dhiZvhrHhvdqYujfRthubmmGwFjNFBoHPjiZSNkq2p2Cu5ZSzNzHjPzxuFEYFJijNELmXybBspJBnDkVktQMBo9vWysKRk5w3c72A3C2Hvah","proof":{"type":"BbsBlsSignature2020","created":"2022-11-15T07:35:07Z","proofPurpose":"assertionMethod","proofValue":"kKZ7AfpRM7ydhECYmYpS8G/WpSoW8Ac4QOID3rZnAsDxXRULHNmyC5jFS1pwtQ4OMH7Q2fcqLu5LpytkFFVPahcuFWxJc4YHd3+6s/HkhaJRKI3IAeHJuhTt6gcYV3EZpu/v9R+oLkRyWvv7+lZyZQ==","verificationMethod":"did:key:z5TcDaC3hWxTACAbQNXTKpumJUCGPjyoRiJjYBKZj6jRFGrGUR4d58BYTg4Btqi5LA2udUE4pkCqyHrNdqY5A3MoRCWX5dhiZvhrHhvdqYujfRthubmmGwFjNFBoHPjiZSNkq2p2Cu5ZSzNzHjPzxuFEYFJijNELmXybBspJBnDkVktQMBo9vWysKRk5w3c72A3C2Hvah#zUC711nEkxR5RikVtrNWwrmvFpuWvbmcePXajGgraXp9772W8pE8YWYcPUkcjCb6gpUfzmPVfATtoir86kLxDGRWfhitGw9AdsL2E8LAiVybKAHSU5pnpVz53wZG9pM8ShntG9K"}}'
	// 		},
	// 		url: "/storeCredential",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// });

	// //-------------------
	// // request: email, credentialData
	// it("createCredentialProof", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmAKKnVybjp0cmluc2ljOndhbGxldHM6TmFBUVpvN3FDWWdrMk45TExta1RUQiIydXJuOnRyaW5zaWM6ZWNvc3lzdGVtczp2aWdvcm91cy1rZWxsZXItRllSR2ZkRVdaWHQaMJK76tJBHrph2GiNhsBiS6oH7YbkvoF7ESrWLjKxiPy8rZFyxrBO8ZyHqBwxdPYA1CIA",	
	// 			"credential_id": "urn:uuid:d54288d0-637c-464a-86f6-2d3db4fa31bf"
	// 		},
	// 		url: "/createCredentialProof",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// 	expect(res.result).to.equal(`createCredentialProof`);
	// });

	// //-------------------
	// // request: authKey, credentialData
	// it("verifyCredentialProof", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmAKKnVybjp0cmluc2ljOndhbGxldHM6TmFBUVpvN3FDWWdrMk45TExta1RUQiIydXJuOnRyaW5zaWM6ZWNvc3lzdGVtczp2aWdvcm91cy1rZWxsZXItRllSR2ZkRVdaWHQaMJK76tJBHrph2GiNhsBiS6oH7YbkvoF7ESrWLjKxiPy8rZFyxrBO8ZyHqBwxdPYA1CIA",
	// 			"credential_proof": '{"@context":["https://www.w3.org/2018/credentials/v1","https://w3id.org/bbs/v1","https://schema.trinsic.cloud/CSIR/credential-title-test-3-cde56f84-ac63-457b-9667-5936723f03f9/context"],"id":"urn:uuid:64b72f1c86f34ad2a65d7b20a92adbe1","type":["CredentialTitleTest3-cde56f84-ac63-457b-9667-5936723f03f9","VerifiableCredential"],"credentialSchema":{"id":"https://schema.trinsic.cloud/CSIR/credential-title-test-3-cde56f84-ac63-457b-9667-5936723f03f9","type":"JsonSchemaValidator2018"},"credentialStatus":{"id":"urn:revocation-registry:intelligent-goodall-8QdAp6zVFeT:E95rX3mLwqYVPtt3DLcrC7#1","type":"RevocationList2020Status","revocationListCredential":"urn:revocation-registry:intelligent-goodall-8QdAp6zVFeT:E95rX3mLwqYVPtt3DLcrC7","revocationListIndex":"1"},"credentialSubject":{"id":"urn:uuid:f4ba57366bbb428ebcea16dd37550a25","test_name_3":"test value 3"},"issuanceDate":"2022-11-15T07:35:07.2344257Z","issuer":"did:key:z5TcDaC3hWxTACAbQNXTKpumJUCGPjyoRiJjYBKZj6jRFGrGUR4d58BYTg4Btqi5LA2udUE4pkCqyHrNdqY5A3MoRCWX5dhiZvhrHhvdqYujfRthubmmGwFjNFBoHPjiZSNkq2p2Cu5ZSzNzHjPzxuFEYFJijNELmXybBspJBnDkVktQMBo9vWysKRk5w3c72A3C2Hvah","proof":{"type":"BbsBlsSignatureProof2020","created":"2022-11-15T07:35:07Z","nonce":"LtJOevCb/C8idEBQ8y1jvlNf0V27odDdAuAEW0cx/8oHp+YspQCRkGxvaI6d74R0j34=","proofPurpose":"assertionMethod","proofValue":"ABAA//+jrFt7Cxf523IkonGm4E6wThl/3+UBLuc9v9cvTypbNNprn69bF9IgfLBMQENjWG+u/+FcSzBPDnrlGpERoD9VQnBwxwwxjk6D157h8lFda4PjZjgtDTJc+YfyjZUC9raJEN41XCOIM/secxRfmesC2iqEDDUdMS1SDehIX2rOnuxoVDWW7rRSRdzNhOi75GcAAAB0srBc1PJ3NOk2ust62A/LubvaVY0TOufsTiorDImhWA04jSJQbtdrlXphXemn/OEcAAAAAke5S0CqN5EwhE8HjNxJcMpCVZQMBQAzanjiU357Z+xCWhF5fPV173FaTi+mEOlbKHJGb+HUf8UTNHHDG8YZsWCuPhmjZO0nlBWAbLK56F7yBUm7QjU8THhXGGvRmxSumlMgpZrAY1e93RMSOgbkd5kAAAACb+m518v7qsJCE9AD7lgW64tmlYDTqwAiv+zHC4pSYEYVcX+D5k7pZ7o3rw5O1RT+TBtldoQw9DCinY99OrFQ+A==","verificationMethod":"did:key:z5TcDaC3hWxTACAbQNXTKpumJUCGPjyoRiJjYBKZj6jRFGrGUR4d58BYTg4Btqi5LA2udUE4pkCqyHrNdqY5A3MoRCWX5dhiZvhrHhvdqYujfRthubmmGwFjNFBoHPjiZSNkq2p2Cu5ZSzNzHjPzxuFEYFJijNELmXybBspJBnDkVktQMBo9vWysKRk5w3c72A3C2Hvah#zUC711nEkxR5RikVtrNWwrmvFpuWvbmcePXajGgraXp9772W8pE8YWYcPUkcjCb6gpUfzmPVfATtoir86kLxDGRWfhitGw9AdsL2E8LAiVybKAHSU5pnpVz53wZG9pM8ShntG9K"}}'
	// 		},
	// 		url: "/verifyCredentialProof",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// 	expect(res.result).to.equal(`verifyCredentialProof`);
	// });

	//-------------------
	// request: authKey, credentialData
	// it("searchTemplate", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmAKKnVybjp0cmluc2ljOndhbGxldHM6TmFBUVpvN3FDWWdrMk45TExta1RUQiIydXJuOnRyaW5zaWM6ZWNvc3lzdGVtczp2aWdvcm91cy1rZWxsZXItRllSR2ZkRVdaWHQaMJK76tJBHrph2GiNhsBiS6oH7YbkvoF7ESrWLjKxiPy8rZFyxrBO8ZyHqBwxdPYA1CIA",
	// 			"query": 'SELECT * FROM c'
	// 		},
	// 		url: "/searchTemplate",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// 	expect(res.result).to.equal(`searchTemplate`);
	// });

	//-------------------
	// request: authKey, credentialData
	// it("searchWallet", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkwKKnVybjp0cmluc2ljOndhbGxldHM6VW45TGpFNUVjN0ZCUFRvNzFURFpVQSIedXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpkZWZhdWx0GjCAevCcnadUa3HuncGb_YN6BFwU-jgBzgZZHR4hABloaRWyEVo2T1uqFz0lOTWSrf0iAA",
	// 			"query": 'SELECT c.id, c.type FROM c'
	// 		},
	// 		url: "/searchWallet",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// });

	//-------------------
	// request: authKey, credentialData
	it("getJSONLD", async() => {
		const res = await server.inject({
			method: "GET",
			url: "/getJSONLD/urn:uuid:a0bb4617-15e9-43fb-99cb-f5bc208a0b90/CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkkKKnVybjp0cmluc2ljOndhbGxldHM6N1VwRmtIUEdvektWUWNFSHVLYVZ3TSIbdXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpDU0lSGjCTwP0t3e2BdAKnkSjJIJN1HMwlexAmvYBUGBzR_DEFkGZebj-IdHu48JKhMrjBdegiAA"
		});

		console.log(res.payload);

		expect(res.statusCode).to.equal(200);
	});

	//-------------------
	// it("emailCredential", async() => {
	// 	const res = await server.inject({
	// 		method: "POST",
	// 		payload: {
	// 			"auth_token": "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmAKKnVybjp0cmluc2ljOndhbGxldHM6TmFBUVpvN3FDWWdrMk45TExta1RUQiIydXJuOnRyaW5zaWM6ZWNvc3lzdGVtczp2aWdvcm91cy1rZWxsZXItRllSR2ZkRVdaWHQaMJK76tJBHrph2GiNhsBiS6oH7YbkvoF7ESrWLjKxiPy8rZFyxrBO8ZyHqBwxdPYA1CIA",
	// 			"email": 'dnaicker@gmail.com',
	// 			"documentJson": '{"@context":["https://www.w3.org/2018/credentials/v1","https://w3id.org/bbs/v1","https://schema.trinsic.cloud/default/demo-prep/context"],"type":["VerifiableCredential","DemoPrep"],"credentialSchema":[{"id":"https://schema.trinsic.cloud/default/demo-prep","type":"JsonSchemaValidator2018"}],"credentialSubject":{"Name":"asdasd","id":"urn:uuid:e11fd38ab1c14109ad08bac621d6ced3"},"id":"urn:uuid:0184a37ef38e41158a7f57bc02bb5f16","issuanceDate":"2022-11-22T09:48:30.4929859Z","credentialStatus":{"id":"urn:revocation-registry:default:5k56kTgYanmmgtScX4zuKa#0","type":"RevocationList2020Status","revocationListIndex":"0","revocationListCredential":"urn:revocation-registry:default:5k56kTgYanmmgtScX4zuKa"},"issuer":"did:key:z5TcCRi7gjZ2SNBkvPwUbg8rZYKWpe2WGJkhYoQ4qWeR2S47hh11yX7rApWNMZfSzFbj1ziKqcyfvkL8i3VRcVfJS6BL9Qc3BpWbCdna1WfuWR63bcYNdoWWu1eFb3b2X6jtftaN58vYxRHeBe7qejmzCRaMNZjWahZRiX5Ch4R9fgxrUm13se4GGFCxAFJwdewiQtKQa","proof":{"type":"BbsBlsSignature2020","created":"2022-11-22T09:48:30Z","proofPurpose":"assertionMethod","proofValue":"tLPkSfSf/SBZnflGqq4W5u1vSahTyDPxKnQGwjQMGMw69ghp+8mKIk45QF6A3zmvNrQtGXBKw+jh6TSbThu3AxaTcMKJZZIARUkf2Xi+avVuFbRDT6u7/R3za5rLC/nEm2UkwnTd1keu0QFQ1SUy8A==","verificationMethod":"did:key:z5TcCRi7gjZ2SNBkvPwUbg8rZYKWpe2WGJkhYoQ4qWeR2S47hh11yX7rApWNMZfSzFbj1ziKqcyfvkL8i3VRcVfJS6BL9Qc3BpWbCdna1WfuWR63bcYNdoWWu1eFb3b2X6jtftaN58vYxRHeBe7qejmzCRaMNZjWahZRiX5Ch4R9fgxrUm13se4GGFCxAFJwdewiQtKQa#zUC7KM8zJLJMXbKKDdkXYu8J6Uskvi9eUE8jbjsTNexswMNm8nj1BvQLnGbYNrxMmkUEDfZ3vSnMbxPzrRu4X6ZVE8GKWk1F4EBcdzpo8XEZvZyUuGFQ8x71E12ocNNkTNg59W6"}}'
	// 		},
	// 		url: "/emailCredential",
	// 	});

	// 	expect(res.statusCode).to.equal(200);
	// });


})