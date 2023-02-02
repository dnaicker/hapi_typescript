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
exports.trinsicAccount = void 0;
require("dotenv/config");
const trinsic_1 = require("@trinsic/trinsic");
//-------------------
// create account
// retrieve account details on login
// response: challenge (bytes), profile (Account Profile: auth_data, auth_token, profile_type, protection)
function createOrLoginAccount(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        // retrieve email
        // todo: validate that email field was sent using joi
        // todo: verify no escape characters in request
        // response otp (sent to email) and challenge
        const loginResponse = yield trinsic.account().login(trinsic_1.LoginRequest.fromPartial({
            email: `${request.params.email}`,
            ecosystemId: "urn:trinsic:ecosystems:CSIR",
        }));
        // if not account detials sent back, show a ui screen that asks for input for one time pin
        const response = responseToolkit.response(loginResponse);
        return response;
    });
}
//-------------------
// register account
// this is only done if the user does not have an existing account
// request: challenge, otp
// response: (account profile: auth_data, auth_token, profile_type, protection)
function registerAccount(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('---------------');
            const trinsic = new trinsic_1.TrinsicService();
            // set orginisation auth token
            trinsic.setAuthToken(process.env.AUTHTOKEN || "");
            console.log(process.env.AUTHTOKEN);
            console.log(request.payload.challenge);
            console.log(request.payload.otp);
            // todo: validate that one_time_pin and challenge fields was sent thorugh using joi
            // todo: verify no escape characters in request
            const authToken = yield trinsic.account()
                .loginConfirm(new Uint8Array(request.payload.challenge), request.payload.otp);
            const response = responseToolkit.response(authToken);
            return response;
        }
        catch (error) {
            console.log(error);
            console.log(typeof error);
            const response = responseToolkit.response("error");
            return response;
        }
    });
}
//-------------------
// register account
// this is only done if the user does not have an existing account
// request: challenge, otp
// response: (account profile: auth_data, auth_token, profile_type, protection)
function registerAccountChallengeString(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('---------------');
            const trinsic = new trinsic_1.TrinsicService();
            // set orginisation auth token
            trinsic.setAuthToken(process.env.AUTHTOKEN || "");
            console.log(process.env.AUTHTOKEN);
            console.log(request.payload.challenge);
            console.log(request.payload.otp);
            // todo: validate that one_time_pin and challenge fields was sent thorugh using joi
            // todo: verify no escape characters in request
            const authToken = yield trinsic.account()
                .loginConfirm(new Uint8Array(JSON.parse(request.payload.challenge)), request.payload.otp);
            const response = responseToolkit.response(authToken);
            return response;
        }
        catch (error) {
            console.log(error);
            console.log(typeof error);
            const response = responseToolkit.response("error");
            return response;
        }
    });
}
// -------------
// get account info
// request:
// response: credentialId
function getAccountInfo(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        trinsic.options.authToken = request.payload.auth_token;
        const account = yield trinsic.account().getInfo();
        console.log(account);
        const response = responseToolkit.response(account);
        return response;
    });
}
//-------------------
// register event handlers to website routes
exports.trinsicAccount = [
    {
        method: 'GET',
        path: '/trinsicCreateOrLoginAccount/{email}',
        handler: createOrLoginAccount
    },
    {
        method: 'POST',
        path: '/trinsicRegisterAccount',
        handler: registerAccount
    },
    {
        method: 'POST',
        path: '/trinsicRegisterAccountChallengeString',
        handler: registerAccountChallengeString
    }
];
