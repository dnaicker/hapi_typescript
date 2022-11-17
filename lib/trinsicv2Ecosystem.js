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
exports.trinsicEcoSystemInfo = void 0;
require("dotenv/config");
const trinsic_1 = require("@trinsic/trinsic");
//----------------
// get ecosystem info 
function getTrinsicEcoSystemInfo(request, responseToolkit) {
    return __awaiter(this, void 0, void 0, function* () {
        const trinsic = new trinsic_1.TrinsicService();
        // Set CSIR AuthToken as EcoSystemId
        trinsic.setAuthToken(process.env.AUTHTOKEN || "");
        const infoResponse = yield trinsic
            .provider()
            .ecosystemInfo(trinsic_1.EcosystemInfoRequest.fromPartial({}));
        const ecosystem = infoResponse.ecosystem;
        console.log(ecosystem);
        const response = responseToolkit.response(`${ecosystem.id}`);
        return response;
    });
}
//----------------
// export test case url access points
exports.trinsicEcoSystemInfo = [
    {
        method: 'GET',
        path: '/trinsicEcoSystemInfo',
        handler: getTrinsicEcoSystemInfo
    }
];
