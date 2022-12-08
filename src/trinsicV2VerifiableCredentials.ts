import "dotenv/config";
import {
	CreateCredentialTemplateRequest,
	CreateEcosystemRequest,
	CreateProofRequest,
	FieldType,
	InsertItemRequest,
	IssueFromTemplateRequest,
	TemplateData,
	TemplateField,
	TrinsicService,
	VerifyProofRequest,
	ServiceOptions,
	EcosystemInfoRequest,
	LoginRequest,
	SearchCredentialTemplatesRequest,
	GetCredentialTemplateRequest,
	SendRequest,
	SearchRequest,
	CredentialService
} from "@trinsic/trinsic";
import { Request, ResponseToolkit, ResponseObject, ServerRoute } from '@hapi/hapi'
import { v4 as uuid } from "uuid";

const trinsic = new TrinsicService();

// -------------
// set company ecosystem authtoken
trinsic.setAuthToken(process.env.AUTHTOKEN || "");

function getFieldType(type: String): FieldType {
	switch (type.toLowerCase()) {
		case "bool":
			return FieldType.BOOL;
		case "datetime":
			return FieldType.DATETIME;
		case "number":
			return FieldType.NUMBER;
		case "string":
			return FieldType.STRING;
		default:
			return FieldType.STRING;
	}
}

// -------------
// create array of fields with FieldType datatypes
function createTemplateFields(credential_template_fields: any): any {
	let obj: any = {};

	// create a dynamic templatefield for Trinsic
	for(let i = 0; i < credential_template_fields.length; i++) {
		const field = credential_template_fields[i];
		const field_type = getFieldType(field.type);

		obj[field.name] = TemplateField.fromPartial({
			type: field_type,
			description: field.description,
			optional: field.optional === 'true' ? true : false
		});
	}

	console.log(obj);

	return obj;
}

// -------------
// POST
// create template
// actor: issuer
// request: auth_token, JSON ["data": {"credential_template_title":"", "credential_template_fields":[{"name":"", "type":"", "description": ""}]}
// JSON field data types: bool, datetime, number, string
async function createCredentialTemplate(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {

	// set user auth token
	trinsic.options.authToken = (request.payload as any).auth_token;

	const fields = createTemplateFields(JSON.parse((request.payload as any).credential_template_fields));

	// create credential temlpate from JSON data from params
	let credentialTemplate = CreateCredentialTemplateRequest.fromPartial({
		name: `${(request.payload as any).credential_template_title}-${uuid()}`,
		fields: fields,
	});

	// send request to Trinsic
	const result = await trinsic.template().create(credentialTemplate);
	const template = result.data;

	// REST response
	const response = responseToolkit.response(template);
	return response;
}

// -------------
// create credential without email
// request: template_id, credential_values
// wallet holder
async function createCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	console.log("createCredential");
	console.log(request.payload);
	// set account token
	trinsic.options.authToken = (request.payload as any).auth_token;

	// todo: validate template using joi
	console.log('issueResponse')

	// send request to Trinsic
	const credential = await trinsic.credential().issueFromTemplate(IssueFromTemplateRequest.fromPartial({
		templateId: (request.payload as any).template_id,
		valuesJson: (request.payload as any).credential_values,
	}));

	console.log(credential)

	const response = responseToolkit.response(credential);
	return response;
}

// -------------
// insert credential values into credential template 
// request: template_id, credential_values
// wallet holder
async function createCredentialWithEmail(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	try {
		console.log("createCredentialWithEmail");
		console.log(request.payload);
		console.log((request.payload as any).account_email);
		console.log((request.payload as any).credential_values);
		console.log((request.payload as any).template_id);
	
		// set account token
		trinsic.options.authToken = (request.payload as any).auth_token;
	
		// todo: validate template using joi
		console.log('createCredentialWithEmail Response')
	
		// send request to Trinsic
		const credential = await trinsic.credential().issueFromTemplate(IssueFromTemplateRequest.fromPartial({
			templateId: (request.payload as any).template_id,
			valuesJson: (request.payload as any).credential_values,
		}));
	
		console.log(credential)
	
		// store against email address
		
		const credential_id = await trinsic.credential().send(SendRequest.fromPartial({
			email: (request.payload as any).account_email,
			documentJson: credential.documentJson,
		}));
		
		// const credential_id = await trinsic.wallet().insertItem(
		// 	InsertItemRequest.fromPartial({
		// 		itemJson: credential.documentJson,
		// 	})
		// );
	
		console.log(credential_id)
	
		const response = responseToolkit.response(credential_id);
		return response;
	} catch(error) {
		console.log(error);
		console.log(typeof error);
		const response = responseToolkit.response('error');
		return response;
	}
}

// -------------
// issue credential / create credential
// issuer
// request: auth_token, credential_document
// response credentialData
async function storeCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	// set account token
	trinsic.options.authToken = (request.payload as any).auth_token;

	const insertResponse = await trinsic.wallet().insertItem(
		InsertItemRequest.fromPartial({
			itemJson: (request.payload as any).credential_document,
		})
	);

	console.log(insertResponse)

	const response = responseToolkit.response(insertResponse);
	return response;
}

// -------------
// create credential proof
// issuer
// request: auth_token (String), credential_id (String)
// response: message to say complete
async function createCredentialProof(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	trinsic.options.authToken = (request.payload as any).auth_token;
	
	console.log((request.payload as any).auth_token)
	console.log((request.payload as any).credential_id)

	const proofResponse = await trinsic.credential().createProof(
		CreateProofRequest.fromPartial({
			itemId: (request.payload as any).credential_id,
		})
	);

	console.log(proofResponse);

	const response = responseToolkit.response(proofResponse);
	return response;
}

// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey (String), credentialData
// response: credentialId
async function verifyCredentialProof(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	trinsic.options.authToken = (request.payload as any).auth_token;

	const verifyResponse = await trinsic.credential().verifyProof(
		VerifyProofRequest.fromPartial({
			proofDocumentJson: (request.payload as any).credential_proof,
		})
	);

	console.log(verifyResponse);

	const response = responseToolkit.response(verifyResponse);
	return response;
}

// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey, query
// response: credentialId
async function searchTemplate(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	console.log(request.payload);
	trinsic.options.authToken = (request.payload as any).auth_token;

	const searchResponse = await trinsic.template().search(SearchCredentialTemplatesRequest.fromPartial({ query: (request.payload as any).query }));

	console.log(searchResponse);

	const response = responseToolkit.response(searchResponse);
	return response;
}

// -------------
// get credential template 
// request: authKey, query
// response: credentialId
async function getCredentialTemplate(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	trinsic.options.authToken = (request.payload as any).auth_token;

	const getTemplateData = await trinsic.template().get(GetCredentialTemplateRequest.fromPartial({ id: (request.payload as any).id }));
	console.log(getTemplateData);

	const response = responseToolkit.response(getTemplateData);
	return response;
}

// -------------
// search wallet
// request: authKey, query, continuation_token
// response: 
async function searchWallet(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	console.log((request.payload as any)?.query != "" ? (request.payload as any)?.query : "");	

	console.log(request.payload);

	trinsic.options.authToken = (request.payload as any).auth_token;

	//todo: use search query (request.payload as any).query
	//the token is sent through again from previous query response
	
	const result = await trinsic.wallet().searchWallet(SearchRequest.fromPartial({ query: (request.payload as any).query, continuationToken: ((request.payload as any)?.continuation_token ?? "") }));
	
	console.log(result);

	const response = responseToolkit.response(result);
	return response;
}

// -------------
// email credential
// request: authKey
// response: 
async function emailCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	console.log('emailCredential');

	trinsic.options.authToken = (request.payload as any).auth_token;

	const result = await trinsic.credential().send(SendRequest.fromPartial({
		email: (request.payload as any).account_email,
		documentJson: (request.payload as any).credential,
	}));
	
	console.log(result);

	const response = responseToolkit.response(result);
	return response;
}

//-------------------
export const trinsicVerifiableCredentials: ServerRoute[] = [
	{
		method: 'POST',
		path: '/createCredentialTemplate',
		handler: createCredentialTemplate
	},
	{
		method: 'POST',
		path: '/createCredential',
		handler: createCredential
	},
	{
		method: 'POST',
		path: '/storeCredential',
		handler: storeCredential
	},
	{
		method: 'POST',
		path: '/createCredentialProof',
		handler: createCredentialProof
	},
	{
		method: 'PUT',
		path: '/verifyCredentialProof',
		handler: verifyCredentialProof
	},
	{
		method: 'POST',
		path: '/searchTemplate',
		handler: searchTemplate
	},
	{
		method: 'POST',
		path: '/getCredentialTemplate',
		handler: getCredentialTemplate
	},
	{
		method: 'POST',
		path: '/searchWallet',
		handler: searchWallet
	},
	{
		method: 'POST',
		path: '/emailCredential',
		handler: emailCredential
	},
	{
		method: 'POST',
		path: '/createCredentialWithEmail',
		handler: createCredentialWithEmail
	}
]


// todo: mask fields to show during verification process
// todo: add api calls revcation status of credential
// todo: add api calls for trustworthy registration 