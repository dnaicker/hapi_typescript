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
  AccountService,
  SearchRequest,
  CredentialService,
  CheckStatusRequest,
} from "@trinsic/trinsic";
import {
  Request,
  ResponseToolkit,
  ResponseObject,
  ServerRoute,
} from "@hapi/hapi";
import { v4 as uuid } from "uuid";
import { AppDataSource } from "./data-source"
import { CredentialTemp } from "./entity/CredentialTemp"
import { Verification } from "./entity/Verification";

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
  for (let i = 0; i < credential_template_fields.length; i++) {
    const field = credential_template_fields[i];
    const field_type = getFieldType(field.type);

    obj[field.name] = TemplateField.fromPartial({
      type: field_type,
      description: field.description,
      optional: field.optional === "true" ? true : false,
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
async function createCredentialTemplate(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  // set user auth token
  trinsic.options.authToken = (request.payload as any).auth_token;

  const fields = createTemplateFields(
    JSON.parse((request.payload as any).credential_template_fields)
  );

  // create credential temlpate from JSON data from params
  let credentialTemplate = CreateCredentialTemplateRequest.fromPartial({
    name: `${(request.payload as any).credential_template_title}-${uuid()}`,
    fields: fields,
  });

  // send request to Trinsic
  const result = await trinsic.template().create(credentialTemplate);
  const template = result.data;

  console.log(template);

  // REST response
  const response = responseToolkit.response(template);
  return response;
}

// -------------
// create credential without email
// request: template_id, credential_values
// wallet holder
async function createCredential(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log("createCredential");
  console.log(request.payload);

  try {
    // set account token
    trinsic.options.authToken = (request.payload as any).auth_token;

    // todo: validate template using joi
    console.log("issueResponse 3");

    // send request to Trinsic
    const credential = await trinsic.credential().issueFromTemplate(
      IssueFromTemplateRequest.fromPartial({
        templateId: (request.payload as any).template_id,
        valuesJson: (request.payload as any).credential_values,
      })
    );

    console.log("postgres");

    // store credential json-ld in database
    const lookup_id = await AppDataSource.initialize()
    .then(async () => {
      console.log('looking into postgres');

      const credential_temp = new CredentialTemp()
      credential_temp.lookup = uuid();
      credential_temp.credential = JSON.stringify(credential)

      await AppDataSource.manager.save(credential_temp)
      
      const credentials = await AppDataSource.manager.find(CredentialTemp)
      
      console.log("Loaded credentials: ", credentials)

      return credential_temp.lookup;

    })
    .catch((error) => console.log(error))

    AppDataSource.destroy();

    console.log({credential: credential, qrCodeLookUp: lookup_id});
    
    console.log("issueResponse 4000 issued");

    const response_two = responseToolkit.response({credential: credential, lookup_id: lookup_id});
    return response_two;
  } catch (error) {
    console.log(error);
    const response = responseToolkit.response("error");
    return response;
  }
}

// -------------
// lookup credential using database lookup id
// used when scanning qr code in a shorten url form
// request: lookup id
// return credential
// wallet holder
async function getCredentialWithLookupId(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log("getCredentialWithLookupId");

  try {

    const credential = await AppDataSource.initialize()
    .then(async () => {

      const lookup_id = request.params.qrcode_lookup_id;

      const query = AppDataSource.getRepository(CredentialTemp)
      
      const result = await query.findOneBy({lookup: lookup_id});
      
      return result?.credential;

    })
    .catch((error) => { return {error: error, message: 'credential not found'}})

    AppDataSource.destroy();

    const response = responseToolkit.response(credential!);
    return response;
  } catch (error) {
    console.log(error);
    const response = responseToolkit.response("error");
    return response;
  }
}

// -------------
// lookup credential using database lookup id
// used when after credential inserted into wallet id
// request: lookup id
// wallet holder
async function deleteCredentialWithLookupId(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log("deleteCredentialWithLookupId");

  try {

    await AppDataSource.initialize()
    .then(async () => {

      const lookup_id = request.params.qrcode_lookup_id;

      const query = AppDataSource.getRepository(CredentialTemp)
      
      const result = await query.findOneBy({lookup: lookup_id});

      await query.remove(result!);
    })
    .catch((error) => console.log(error))

    AppDataSource.destroy();

    const response = responseToolkit.response(`Removed ${request.params.qrcode_lookup_id}`);
    return response;
  } catch (error) {
    console.log(error);
    const response = responseToolkit.response("error");
    return response;
  }
}

// -------------
// insert credential values into credential template
// request: template_id, credential_values
// wallet holder
async function createCredentialWithEmail(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  try {
    console.log("createCredentialWithEmail");
    console.log(request.payload);
    console.log((request.payload as any).account_email);
    console.log((request.payload as any).credential_values);
    console.log((request.payload as any).template_id);

    // set account token
    trinsic.options.authToken = (request.payload as any).auth_token;

    // todo: validate template using joi
    console.log("createCredentialWithEmail Response");

    // send request to Trinsic
    const credential = await trinsic.credential().issueFromTemplate(
      IssueFromTemplateRequest.fromPartial({
        templateId: (request.payload as any).template_id,
        valuesJson: (request.payload as any).credential_values,
      })
    );

    console.log(credential);

    // store against email address

    console.log("store against email address");

    const credential_id = await trinsic.credential().send(
      SendRequest.fromPartial({
        email: (request.payload as any).account_email,
        documentJson: credential.documentJson,
      })
    );

    // const credential_id = await trinsic.wallet().insertItem(
    // 	InsertItemRequest.fromPartial({
    // 		itemJson: credential.documentJson,
    // 	})
    // );

    console.log(credential_id);

    const response = responseToolkit.response("Success");
    return response;
  } catch (error) {
    console.log(error);
    console.log(typeof error);
    const response = responseToolkit.response("error");
    return response;
  }
}

// -------------
// issue credential / create credential
// issuer
// request: auth_token, credential_document
// response credentialData
async function storeCredential(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  // set account token
  trinsic.options.authToken = (request.payload as any).auth_token;

  const insertResponse = await trinsic.wallet().insertItem(
    InsertItemRequest.fromPartial({
      itemJson: (request.payload as any).credential_document,
    })
  );

  console.log(insertResponse);

  const response = responseToolkit.response(insertResponse);
  return response;
}

// -------------
// create credential proof
// issuer
// request: auth_token (String), credential_id (String)
// response: message to say complete
async function createCredentialProof(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  trinsic.options.authToken = (request.payload as any).auth_token;

  console.log((request.payload as any).auth_token);
  console.log((request.payload as any).credential_id);

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
// create selective credential proof
// issuer
// request: auth_token (String), credential_id (String)
// response: message to say complete
async function createCredentialSelectiveProofAndVerify(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  try {
    let credentialSubject: any = {};
    trinsic.options.authToken = (request.payload as any).auth_token;

    console.log((request.payload as any).auth_token);
    console.log((request.payload as any).credential_id);
    console.log((request.payload as any).credential_fields);

    // typescript loop through array
    const selectedFields = JSON.parse(
      (request.payload as any).credential_fields
    );

    // add property to object
    credentialSubject["@explicit"] = true;

    for (var index of selectedFields) {
      credentialSubject[index] = {};
    }

    const jsonLD: JSON = <JSON>(<unknown>{
      "@context": [
        "https://www.w3.org/2018/credentials/v1", // hardcode this value
        {
          "@vocab": "https://trinsic.cloud/CSIR/",  // hardcode this value
        },
      ],
      type: ["VerifiableCredential"],
      credentialSubject: credentialSubject,
    });
    console.log(jsonLD);

    const proofResponse = await trinsic.credential().createProof(
      CreateProofRequest.fromPartial({
        itemId: (request.payload as any).credential_id,
        revealDocumentJson: JSON.stringify(jsonLD),
      })
    );

    console.log(proofResponse);

    // verify credential proof
    let verifyResponse = await trinsic.credential().verifyProof({
      proofDocumentJson: proofResponse.proofDocumentJson,
    });

    console.log(verifyResponse);

    const response = responseToolkit.response(verifyResponse);
    return response;
  } catch (error) {
    console.log(error);
    console.log(typeof error);
    const response = responseToolkit.response("error");
    return response;
  }
}

// -------------
// store credential / insert credential into owners wallet
// wallet holder
// request: authKey (String), credentialData
// response: credentialId
async function verifyCredentialProof(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
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
async function searchTemplate(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log(request.payload);
  trinsic.options.authToken = (request.payload as any).auth_token;

  const searchResponse = await trinsic
    .template()
    .search(
      SearchCredentialTemplatesRequest.fromPartial({
        query: (request.payload as any).query,
      })
    );

  console.log(searchResponse);

  const response = responseToolkit.response(searchResponse);
  return response;
}

// -------------
// verify selected reveal temlpate fields to generate credential proof
// issuer
// request: auth_token (String), credential_id (String), revealTemplate (Array of Strings)
// response: sends back validation checks for SchemaConformance , IssuerIsSigner , CredentialStatus , SignatureVerification 
async function verifySelectiveCredentialProof(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  trinsic.options.authToken = (request.payload as any).auth_token;

  console.log((request.payload as any).auth_token);
  console.log((request.payload as any).credential_id);
  console.log((request.payload as any).reveal_template);

  const proofResponse = await trinsic.credential().createProof(
    CreateProofRequest.fromPartial({
      itemId: (request.payload as any).credential_id,
      revealTemplate: {
        templateAttributes: (request.payload as any).reveal_template,
      }
    })
  );

  console.log(proofResponse);

  const response = responseToolkit.response(proofResponse);
  return response;
}

// -------------
// get credential template
// request: authKey, query
// response: credentialId
async function getCredentialTemplate(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  trinsic.options.authToken = (request.payload as any).auth_token;

  const getTemplateData = await trinsic
    .template()
    .get(
      GetCredentialTemplateRequest.fromPartial({
        id: (request.payload as any).id,
      })
    );
  console.log(getTemplateData);

  const response = responseToolkit.response(getTemplateData);
  return response;
}



// -------------
// search wallet
// request: authKey, query, continuation_token
// response:
async function searchWallet(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log(
    (request.payload as any)?.query != "" ? (request.payload as any)?.query : ""
  );

  console.log(request.payload);

  trinsic.options.authToken = (request.payload as any).auth_token;

  //todo: use search query (request.payload as any).query
  //the token is sent through again from previous query response

  const result = await trinsic
    .wallet()
    .searchWallet(
      SearchRequest.fromPartial({
        query: (request.payload as any).query,
        continuationToken: (request.payload as any)?.continuation_token ?? "",
      })
    );

  console.log(result);

  const response = responseToolkit.response(result);
  return response;
}


// -------------
// Sharing credential proof to verifier using QR Code containing URL /credential_id
// to reduce size constraints when generating QR code with credential proof json-ld
// request: authToken credentialId
// response: JSON-LD stringified
async function shareCredentialProof(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  try {
    // user wallet authToken
    trinsic.options.authToken = request.params.authToken;

    // get credential id
    const credential_id = request.params.credentialId;

    console.log(request.params.authToken)
    console.log(credential_id)

    const credential_json_ld = await trinsic
      .wallet()
      .searchWallet(
        SearchRequest.fromPartial({
          query: `SELECT * FROM c WHERE c.id = '${credential_id}'`,
          continuationToken: "",
        })
      );


    console.log(credential_json_ld?.items![0]);

    // create proof from json-ld
    const credential_proof = await trinsic.credential().createProof(
      CreateProofRequest.fromPartial({
        itemId: credential_id,
        revealDocumentJson: credential_json_ld?.items![0],
      })
    );

    console.log(credential_proof);

    const response = responseToolkit.response(credential_proof);
    return response;
  } catch (error) {
    console.log(error);
    console.log(typeof error);
    const response = responseToolkit.response("error");
    return response;
  }

}

// -------------
// email credential
// request: authKey
// response:
async function emailCredential(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log("emailCredential");

  trinsic.options.authToken = (request.payload as any).auth_token;

  const result = await trinsic.credential().send(
    SendRequest.fromPartial({
      email: (request.payload as any).account_email,
      documentJson: (request.payload as any).credential,
    })
  );

  console.log(result);

  const response = responseToolkit.response(result);
  return response;
}

// -------------
// check revocation status
// request: authKey, credential_status_id
// response:
async function checkRevocationStatus(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  console.log("checkRevocationStatus");
  console.log((request.payload as any).credential_status_id);

  trinsic.options.authToken = (request.payload as any).auth_token;

  const result = await trinsic.credential().checkStatus(
    CheckStatusRequest.fromPartial({
      credentialStatusId: (request.payload as any).credential_status_id,
    })
  );

  console.log(result);

  const response = responseToolkit.response(result);
  return response;
}



// -------------
// send back requirements for verifying credential
// request: url , requirements
// response: url and requirements
async function createMobileAppScanQRCodeURLDetails(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  try {
    let obj = {};

    // create json object
    obj["requirements"] = request.params.requirements;

    console.log(obj);

    const response = responseToolkit.response(obj);
    return response;
  } catch (error) {
    console.log(error);
    const response = responseToolkit.response({error: error, error_message: "server error occured"});
    return response;
  }
}

// -------------
// Credential template data and lookUp id sent back to mobile device as creating QR code with template data is too large
// request: authToken templateId fieldsAndValuesRequired ([{field: "value"},...])
// response: 
async function createVerificationQRCodeLookup(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  try {
    // user wallet authToken
    trinsic.options.authToken = request.params.authToken;

    const template_id = request.params.templateId;
    const fields_and_values_required = request.params.fieldsAndValuesRequired;

    // console.log(request.params.authToken)
    // console.log(template_id)
    console.log(fields_and_values_required)

    // get template data
    const template = await trinsic
    .template()
    .get(
      GetCredentialTemplateRequest.fromPartial({
        id: request.params.templateId,
      })
    );

    //create qrCodeLookup from db proxy
    const look_up_id = await AppDataSource.initialize()
    .then(async () => {
      const verification = new Verification()
      verification.lookUp = uuid();
      verification.templateId = template_id
      verification.dateTime = new Date().toISOString();
      verification.fieldsAndValuesRequired = fields_and_values_required;
      verification.status = "pending"

      await AppDataSource.manager.save(verification)
      
      return verification.lookUp;

    })
    .catch((error) => console.log(error))

    AppDataSource.destroy();

    console.log(template);

    const response = responseToolkit.response({template: template, lookup: look_up_id, fieldsAndValuesRequired: fields_and_values_required});
    return response;
  } catch (error) {
    console.log(error);
    const response = responseToolkit.response({error: error, error_message: "server error occured"});
    return response;
  }
}

// -------------
// use ecosystem auth token
// request: verificationProof(json-ld) proof lookup_id
// response: 
async function receiveVerificationRequestWithQRCodeLookupId(
  request: Request,
  responseToolkit: ResponseToolkit
): Promise<ResponseObject> {
  try {
    let match = {};

    // issuer authToken
    trinsic.options.authToken = process.env.AUTHTOKEN;

    // get credential id
    const credential_proof = JSON.parse((request.payload as any).credential_proof);
    const lookup_id = (request.payload as any).lookup_id;

    // retrieved lookup fields
    const fields_and_values_required = JSON.parse((request.payload as any).fields_and_values_required);

    console.log(fields_and_values_required);


    // compare value_required with credential_proof 

    // loop through fields_and_values_required
    for(let credential_field in credential_proof.credentialSubject) {
      for(let business_field in fields_and_values_required) {
        if(credential_field == business_field) {
          if(credential_proof.credentialSubject[credential_field] == fields_and_values_required[business_field]) {
            match[credential_field] = "valid";
          }
        }
      }
    }

    console.log(match);

    // verify proof from json-ld
    let verifyResponse = await trinsic.credential().verifyProof({
      proofDocumentJson: JSON.stringify(credential_proof),
    });



    //update status of verification qrCodeLookup to complete
    const result = await AppDataSource.initialize()
    .then(async () => {
      const verification = new Verification()

      const query = AppDataSource.getRepository(Verification)
      
      // find verification by lookup_id
      const result = await query.findOneBy({lookUp: lookup_id});

      //update status of verification qrCodeLookup to complete
      const update_result = query.update(result!.id.toString(), {status: "completed"});
      
      return update_result;

    })
    .catch((error) => console.log(error))

    AppDataSource.destroy();

    // trust registry issuer check

    // build array of checks to return
      // trust registry [x]
      // verification checks [x]
      // business check (matching fields and values) [x]

    console.log(result);

    const response = responseToolkit.response({verification_result: verifyResponse, lookup_result: result});
    return response;
  } catch (error) {
    console.log(error);
    const response = responseToolkit.response({error: error, error_message: "server error occured"});
    return response;
  }
}


//-------------------
export const trinsicVerifiableCredentials: ServerRoute[] = [
  {
    method: "POST",
    path: "/createCredentialTemplate",
    handler: createCredentialTemplate,
  },
  {
    method: "POST",
    path: "/createCredential",
    handler: createCredential,
  },
  {
    method: "POST",
    path: "/createCredentialSelectiveProofAndVerify",
    handler: createCredentialSelectiveProofAndVerify,
  },
  {
    method: "POST",
    path: "/storeCredential",
    handler: storeCredential,
  },
  {
    method: "POST",
    path: "/createCredentialProof",
    handler: createCredentialProof,
  },
  {
    method: "PUT",
    path: "/verifyCredentialProof",
    handler: verifyCredentialProof,
  },
  {
    method: "POST",
    path: "/verifySelectiveCredentialProof",
    handler: verifySelectiveCredentialProof,
  },
  {
    method: "POST",
    path: "/searchTemplate",
    handler: searchTemplate,
  },
  {
    method: "POST",
    path: "/getCredentialTemplate",
    handler: getCredentialTemplate,
  },
  {
    method: "POST",
    path: "/searchWallet",
    handler: searchWallet,
  },
  {
    method: "POST",
    path: "/emailCredential",
    handler: emailCredential,
  },
  {
    method: "POST",
    path: "/createCredentialWithEmail",
    handler: createCredentialWithEmail,
  },
  {
    method: "POST",
    path: "/checkRevocationStatus",
    handler: checkRevocationStatus,
  },
  {
    method: "GET",
    path: "/createMobileAppScanQRCodeURLDetails/{requirements}",
    handler: createMobileAppScanQRCodeURLDetails,
  },
  {
    method: "GET",
    path: "/createVerificationQRCodeLookup/{authToken}/{templateId}/{fieldsAndValuesRequired}",
    handler: createVerificationQRCodeLookup,
  },
  {
    method: "POST",
    path: "/receiveVerificationRequestWithQRCodeLookupId",
    handler: receiveVerificationRequestWithQRCodeLookupId,
  },
  {
    method: "GET",
    path: "/shareCredentialProof/{credentialId}/{authToken}",
    handler: shareCredentialProof,
  },
  {
    method: "GET",
    path: "/getCredentialWithLookupId/{qrcode_lookup_id}",
    handler: getCredentialWithLookupId,
  },
  {
    method: "DELETE",
    path: "/deleteCredentialWithLookupId/{qrcode_lookup_id}",
    handler: deleteCredentialWithLookupId,
  }
];

// todo: mask fields to show during verification process
// todo: add api calls revcation status of credential
// todo: add api calls for trustworthy registration
