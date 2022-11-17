"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trinsicVerifiableCredentials = void 0;
require("dotenv/config");
const trinsic_1 = require("@trinsic/trinsic");
const uuid_1 = require("uuid");
const trinsic = new trinsic_1.TrinsicService();
// set company ecosystem authtoken
trinsic.setAuthToken(process.env.AUTHTOKEN || "");
function getFieldType(type) {
    switch (type.toLowerCase()) {
        case "bool":
            return trinsic_1.FieldType.BOOL;
        case "datetime":
            return trinsic_1.FieldType.DATETIME;
        case "number":
            return trinsic_1.FieldType.NUMBER;
        case "string":
            return trinsic_1.FieldType.STRING;
        default:
            return trinsic_1.FieldType.STRING;
    }
}
// create array of fields with FieldType datatypes
function createTemplateFields(credential_template_fields) {
    let fields = [];
    // create a dynamic templatefield for Trinsic
    credential_template_fields.forEach((field) => {
        // create new field object	
        let obj = {};
        obj[field.name] = trinsic_1.TemplateField.fromPartial({
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
// request: auth_token, JSON ["data": {"credential_template_title":"", "credential_template_fields":[{"name":"", "type":"", "description": ""}]}
// JSON field data types: bool, datetime, number, string
function createCredentialTemplate(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(request.payload);
        // set user auth token
        trinsic.options.authToken = request.payload.auth_token;
        // create credential temlpate from JSON data from params
        let credentialTemplate = trinsic_1.CreateCredentialTemplateRequest.fromPartial({
            name: `${request.payload.credential_template_title}-${(0, uuid_1.v4)()}`,
            fields: createTemplateFields(JSON.parse(request.payload.credential_template_fields)),
        });
        // send request to Trinsic
        const result = yield trinsic.template().create(credentialTemplate);
        const template = result.data;
        console.log(template);
        // REST response
        const response = responseToolkit.response(template);
        return response;
    });
}
// -------------
// insert credential values into credential template 
// request: template_id, credential_values
// wallet holder
function createCredential(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        // set account token
        trinsic.options.authToken = request.payload.auth_token;
        // todo: validate template using joi
        // send request to Trinsic
        const issueResponse = yield trinsic.credential().issueFromTemplate(trinsic_1.IssueFromTemplateRequest.fromPartial({
            templateId: request.payload.template_id,
            valuesJson: JSON.stringify(request.payload.credential_values),
        }));
        console.log('issueResponse ', issueResponse);
        const response = responseToolkit.response("insertCredentialTemplateValues");
        return response;
    });
}
// -------------
// issue credential / create credential
// issuer
// request: auth_token, credential_document
// response credentialData
function storeCredential(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        // set account token
        trinsic.options.authToken = request.payload.auth_token;
        const insertResponse = yield trinsic.wallet().insertItem(trinsic_1.InsertItemRequest.fromPartial({
            itemJson: request.payload.credential_document,
        }));
        console.log(insertResponse);
        const response = responseToolkit.response("createCredential");
        return response;
    });
}
// -------------
// create credential proof
// issuer
// request: auth_token, credential_id
// response: message to say complete
function createCredentialProof(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        trinsic.options.authToken = request.payload.auth_token;
        console.log(request.payload.auth_token);
        console.log(request.payload.credential_id);
        const proofResponse = yield trinsic.credential().createProof(trinsic_1.CreateProofRequest.fromPartial({
            itemId: request.payload.credential_id,
        }));
        console.log(proofResponse);
        const response = responseToolkit.response("createCredentialProof");
        return response;
    });
}
// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey, credentialData
// response: credentialId
function verifyCredentialProof(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        trinsic.options.authToken = request.payload.auth_token;
        const verifyResponse = yield trinsic.credential().verifyProof(trinsic_1.VerifyProofRequest.fromPartial({
            proofDocumentJson: request.payload.credential_proof,
        }));
        console.log(verifyResponse);
        const response = responseToolkit.response("verifyCredentialProof");
        return response;
    });
}
//-------------------
exports.trinsicVerifiableCredentials = [
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
        method: 'PUT',
        path: '/verifyCredentialProof',
        handler: verifyCredentialProof
    },
];
// todo: mask fields to show during verification process
// todo: update revcation status of credential
