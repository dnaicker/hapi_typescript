import Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import {helloRoutes} from "./hello";
import { trinsicAccount } from "./trinsicv2Account";
import {trinsicEcoSystemInfo} from "./trinsicv2Ecosystem";
import {trinsicVerifiableCredentials} from "./trinsicV2VerifiableCredentials";

export let server: Server;

function index(request: Request): string {
	console.log("processing request", request.info.id);
	return "hello nice to meet you";
}

export const init = async function(): Promise<Server> {
	server = Hapi.server({
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
	
	server.route(trinsicEcoSystemInfo);
	server.route(trinsicAccount);
	server.route(trinsicVerifiableCredentials);

	server.route({
		method: '*',
		path: '/{any*}',
		handler: function (request, h) {

				return '404 Error! Page Not Found!';
		}
	});
	
	return server;
};

export const start = async function(): Promise<void> {
	console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
	return server.start();
}

process.on('unhandledRejection', (err) => {
	console.error("unhandledRejection");
	console.error(err);
	process.exit(1);
});