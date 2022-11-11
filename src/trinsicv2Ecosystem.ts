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
} from "@trinsic/trinsic";
import {Request, ResponseToolkit, ResponseObject, ServerRoute} from '@hapi/hapi'


//----------------
// get ecosystem info 
async function getTrinsicEcoSystemInfo(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	const trinsic = new TrinsicService();

	// Set CSIR AuthToken as EcoSystemId
	trinsic.setAuthToken(process.env.AUTHTOKEN || "");

	const infoResponse = await trinsic
		.provider()
		.ecosystemInfo(EcosystemInfoRequest.fromPartial({}));

	const ecosystem = infoResponse.ecosystem;

	console.log(ecosystem);
	const response = responseToolkit.response(`${ecosystem!.id}`);
	return response;
}


//----------------
// export test case url access points
export const trinsicEcoSystemInfo: ServerRoute[] = [
	{
		method: 'GET',
		path: '/trinsicEcoSystemInfo',
		handler: getTrinsicEcoSystemInfo
	}
]