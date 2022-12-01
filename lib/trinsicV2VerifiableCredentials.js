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
// -------------
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
// -------------
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
        console.log("createCredential");
        console.log(request.payload);
        // set account token
        trinsic.options.authToken = request.payload.auth_token;
        // todo: validate template using joi
        console.log('issueResponse');
        // send request to Trinsic
        const credential = yield trinsic.credential().issueFromTemplate(trinsic_1.IssueFromTemplateRequest.fromPartial({
            templateId: request.payload.template_id,
            valuesJson: request.payload.credential_values,
        }));
        console.log(credential);
        // store against email address
        const credential_id = yield trinsic.wallet().insertItem(trinsic_1.InsertItemRequest.fromPartial({
            itemJson: credential.documentJson,
        }));
        const response = responseToolkit.response(credential_id);
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
        const response = responseToolkit.response(insertResponse);
        return response;
    });
}
// -------------
// create credential proof
// issuer
// request: auth_token (String), credential_id (String)
// response: message to say complete
function createCredentialProof(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        trinsic.setAuthToken(process.env.AUTHTOKEN || "");
        trinsic.options.authToken = request.payload.auth_token;
        console.log(request.payload.auth_token);
        console.log(request.payload.credential_id);
        const proofResponse = yield trinsic.credential().createProof(trinsic_1.CreateProofRequest.fromPartial({
            itemId: request.payload.credential_id,
        }));
        console.log(proofResponse);
        const response = responseToolkit.response(proofResponse);
        return response;
    });
}
// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey (String), credentialData
// response: credentialId
function verifyCredentialProof(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        trinsic.options.authToken = request.payload.auth_token;
        const verifyResponse = yield trinsic.credential().verifyProof(trinsic_1.VerifyProofRequest.fromPartial({
            proofDocumentJson: request.payload.credential_proof,
        }));
        console.log(verifyResponse);
        const response = responseToolkit.response(verifyResponse);
        return response;
    });
}
// -------------
// store credential / insert credential into owners wallet 
// wallet holder
// request: authKey, query
// response: credentialId
function searchTemplate(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(request.payload);
        trinsic.options.authToken = request.payload.auth_token;
        const searchResponse = yield trinsic.template().search(trinsic_1.SearchCredentialTemplatesRequest.fromPartial({ query: request.payload.query }));
        console.log(searchResponse);
        const response = responseToolkit.response(searchResponse);
        return response;
    });
}
// -------------
// get credential template 
// request: authKey, query
// response: credentialId
function getCredentialTemplate(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        trinsic.setAuthToken(process.env.AUTHTOKEN || "");
        console.log(request.payload);
        trinsic.options.authToken = request.payload.auth_token;
        const getTemplateData = yield trinsic.template().get(trinsic_1.GetCredentialTemplateRequest.fromPartial({ id: request.payload.id }));
        console.log(getTemplateData);
        const response = responseToolkit.response(getTemplateData);
        return response;
    });
}
// -------------
// search wallet
// request: authKey, query, continuation_token
// response: 
function searchWallet(request, responseToolkit) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        trinsic.setAuthToken(process.env.AUTHTOKEN || "");
        console.log(((_a = request.payload) === null || _a === void 0 ? void 0 : _a.query) != "" ? (_b = request.payload) === null || _b === void 0 ? void 0 : _b.query : "");
        console.log(request.payload);
        trinsic.options.authToken = request.payload.auth_token;
        //todo: use search query (request.payload as any).query
        //the token is sent through again from previous query response
        const result = yield trinsic.wallet().searchWallet(trinsic_1.SearchRequest.fromPartial({ query: request.payload.query, continuationToken: ((_d = (_c = request.payload) === null || _c === void 0 ? void 0 : _c.continuation_token) !== null && _d !== void 0 ? _d : "") }));
        console.log(result);
        const response = responseToolkit.response(result);
        return response;
    });
}
// -------------
// email credential
// request: authKey
// response: 
function emailCredential(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        trinsic.setAuthToken(process.env.AUTHTOKEN || "");
        console.log(request.payload);
        trinsic.options.authToken = request.payload.auth_token;
        const result = yield trinsic.credential().send(trinsic_1.SendRequest.fromPartial({
            email: request.payload.email,
            documentJson: JSON.stringify(request.payload.documentJson),
        }));
        console.log(result);
        const response = responseToolkit.response(result);
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
    }
];
// todo: mask fields to show during verification process
// todo: add api calls revcation status of credential
// todo: add api calls for trustworthy registration 
