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
} from "@trinsic/trinsic";
import { Request, ResponseToolkit, ResponseObject, ServerRoute } from '@hapi/hapi'
import { v4 as uuid } from "uuid";


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

// create array of fields with FieldType datatypes
function createTemplateFields(request: Request): any {
	let fields: any = [];

	// create a dynamic templatefield for Trinsic
	(request.payload as any).data.fields.forEach((field: any) => {
		// create new field object	
		let obj: any = {};

		obj[field.name] = TemplateField.fromPartial({
			type: getFieldType(field.type),
			description: field.description
		});

		fields.push(obj);
	});
}

// -------------
// POST
// create template
// actor: issuer
// request: authKey, JSON ["data": {"title":"", "fields":[{"name":"", "type":"", "description": ""}]}
// JSON field data types: bool, datetime, number, string
async function createCredentialTemplate(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	// start Trinsic Service
	const trinsic = new TrinsicService();

	// set company ecosystem authtoken
	trinsic.setAuthToken(process.env.AUTHTOKEN || "");

	// get user account auth token from params
	const accountAuthToken = (request.payload as any).accountAuthToken;

	// create credential temlpate from JSON data from params
	let credentialTemplate = CreateCredentialTemplateRequest.fromPartial({
		name: `${(request.payload as any).data.title}-${uuid()}`,
		fields: createTemplateFields(request),
	});

	// send request to Trinsic
	const result = await trinsic.template().create(credentialTemplate);
	const template = result.data;
	console.log(template);

	// REST response
	const response = responseToolkit.response("createCredentialTemplate");
	return response;
}

// -------------
// insert credential values into credential template 
// wallet holder
async function insertCredentialTemplateValues(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	const response = responseToolkit.response("insertCredentialTemplateValues");
	return response;
}

// -------------
// issue credential / create credential
// issuer
// request: authKey, credentialTemplateId, credentialValues
// response credentialData
async function createCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	const response = responseToolkit.response("createCredential");
	return response;
}

// -------------
// send credential / email credential
// issuer
// request: email, credentialData
// response: message to say complete
async function sendCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	const response = responseToolkit.response("sendCredential");
	return response;
}

// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey, credentialData
// response: credentialId
async function saveCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	const response = responseToolkit.response("saveCredential");
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
		path: '/insertCredentialTemplateValues',
		handler: insertCredentialTemplateValues
	},
	{
		method: 'POST',
		path: '/createCredential',
		handler: createCredential
	},
	{
		method: 'POST',
		path: '/sendCredential',
		handler: sendCredential
	},
	{
		method: 'POST',
		path: '/saveCredential',
		handler: saveCredential
	},
]
