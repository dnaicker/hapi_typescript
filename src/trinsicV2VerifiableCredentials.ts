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

const trinsic = new TrinsicService();

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

// create array of fields with FieldType datatypes
function createTemplateFields(request: Request): any {
	let fields: any = [];

	// create a dynamic templatefield for Trinsic
	(request.payload as any).credential_template_fields.forEach((field: any) => {
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
	// set user auth token
	trinsic.options.authToken = (request.payload as any).auth_token;

	// create credential temlpate from JSON data from params
	let credentialTemplate = CreateCredentialTemplateRequest.fromPartial({
		name: `${(request.payload as any).credential_template_title}-${uuid()}`,
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
// request: template_id, credential_values
// wallet holder
async function createCredential(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	// set account token
	trinsic.options.authToken = (request.payload as any).auth_token;

	// todo: validate template using joi

	// send request to Trinsic
	const issueResponse = await trinsic.credential().issueFromTemplate(
		IssueFromTemplateRequest.fromPartial({
			templateId: (request.payload as any).template_id,
			valuesJson: JSON.stringify((request.payload as any).credential_values),
		})
	);

	console.log('issueResponse ', issueResponse)

	const response = responseToolkit.response("insertCredentialTemplateValues");
	return response;
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

	const response = responseToolkit.response("createCredential");
	return response;
}

// -------------
// create credential proof
// issuer
// request: auth_token, credential_id
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
	
	const response = responseToolkit.response("createCredentialProof");
	return response;
}

// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey, credentialData
// response: credentialId
async function verifyCredentialProof(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	trinsic.options.authToken = (request.payload as any).auth_token;
	
	const verifyResponse = await trinsic.credential().verifyProof(
		VerifyProofRequest.fromPartial({
				proofDocumentJson: (request.payload as any).credential_proof,
		})
	);

	console.log(verifyResponse);

	const response = responseToolkit.response("verifyCredentialProof");
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
		handler: createCredential
	},
	{
		method: 'POST',
		path: '/createCredential',
		handler: storeCredential
	},
	{
		method: 'POST',
		path: '/createCredentialProof',
		handler: createCredentialProof
	},
	{
		method: 'POST',
		path: '/verifyCredentialProof',
		handler: verifyCredentialProof
	},
]
