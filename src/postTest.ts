import {Request, ResponseToolkit, ResponseObject, ServerRoute} from '@hapi/hapi'
import { HasExpressionInitializer } from 'typescript'

export const postRoutes: ServerRoute[] = [
	{
		method: ['GET','POST'],
		path: '/post/{id}',
		handler: (request: Request, reply: ResponseToolkit) => {
			console.log("request.payload", request.payload);
			return reply.response("This is a POST method");
		}
	}
]