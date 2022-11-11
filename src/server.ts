import Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import {helloRoutes} from "./hello";
import { trinsicAccount } from "./trinsicv2Account";
import {trinsicEcoSystemInfo} from "./trinsicv2Ecosystem";

export let server: Server;

function index(request: Request): string {
	console.log("processing request", request.info.id);
	return "hello nice to meet you";
}

export const init = async function(): Promise<Server> {
	server = Hapi.server({
		port: process.env.PORT || 4000,
		host: '0.0.0.0'
	});
	
	// server.route({
	// 	method: "GET",
	// 	path: "/",
	// 	handler: index
	// });

	// server.route(helloRoutes);
	
	server.route(trinsicEcoSystemInfo);
	server.route(trinsicAccount);

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