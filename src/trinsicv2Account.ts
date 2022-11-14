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
import {Request, ResponseToolkit, ResponseObject, ServerRoute} from '@hapi/hapi'

//-------------------
// create account
// retrieve account details on login
// response: challenge (bytes), profile (Account Profile: auth_data, auth_token, profile_type, protection)
async function createOrLoginAccount(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	const trinsic = new TrinsicService();
	
	// set orginisation auth token
	trinsic.setAuthToken(process.env.AUTHTOKEN || "");

	// retrieve email
	// todo: validate that email field was sent using joi
	// todo: verify no escape characters in request

	// response otp (sent to email) and challenge
	const loginResponse = await trinsic.account().login(
    LoginRequest.fromPartial({
        email: `${request.params.email}`,
    })
	);

	// if not account detials sent back, show a ui screen that asks for input for one time pin
	const response = responseToolkit.response(loginResponse);
	return response;
}

//-------------------
// register account
// this is only done if the user does not have an existing account
// request: challenge, otp
// response: (account profile: auth_data, auth_token, profile_type, protection)
async function registerAccount(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	
	const trinsic = new TrinsicService();
	
	// set orginisation auth token
	trinsic.setAuthToken(process.env.AUTHTOKEN || "");

	// todo: validate that one_time_pin and challenge fields was sent thorugh using joi
	// todo: verify no escape characters in request
	const authToken = await trinsic.account()
		.loginConfirm(
			new Uint8Array((request.payload as any).challenge),
			(request.payload as any).otp);
	
	console.log('auth token',authToken);
	
	const response = responseToolkit.response(`trinsic account created`);
	return response;
}

//-------------------
// register event handlers to website routes
export const trinsicAccount: ServerRoute[] = [
	{
		method: 'GET',
		path: '/trinsicCreateOrLoginAccount/{email}',
		handler: createOrLoginAccount
	},
	{
		method: 'POST',
		path: '/trinsicRegisterAccount/{otp}',
		handler: registerAccount
	}
]