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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.init = exports.server = void 0;
const hapi_1 = __importDefault(require("@hapi/hapi"));
const trinsicv2Account_1 = require("./trinsicv2Account");
const trinsicv2Ecosystem_1 = require("./trinsicv2Ecosystem");
const trinsicV2VerifiableCredentials_1 = require("./trinsicV2VerifiableCredentials");
function index(request) {
    console.log("processing request", request.info.id);
    return "hello nice to meet you";
}
const init = function () {
    return __awaiter(this, void 0, void 0, function* () {
        exports.server = hapi_1.default.server({
            port: process.env.PORT || 4000,
            host: '0.0.0.0',
            routes: {
                cors: true
            }
        });
        // server.route({
        // 	method: "GET",
        // 	path: "/",
        // 	handler: index
        // });
        // server.route(helloRoutes);
        exports.server.route(trinsicv2Ecosystem_1.trinsicEcoSystemInfo);
        exports.server.route(trinsicv2Account_1.trinsicAccount);
        exports.server.route(trinsicV2VerifiableCredentials_1.trinsicVerifiableCredentials);
        exports.server.route({
            method: '*',
            path: '/{any*}',
            handler: function (request, h) {
                return '404 Error! Page Not Found!';
            }
        });
        return exports.server;
    });
};
exports.init = init;
const start = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Listening on ${exports.server.settings.host}:${exports.server.settings.port}`);
        return exports.server.start();
    });
};
exports.start = start;
process.on('unhandledRejection', (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});
