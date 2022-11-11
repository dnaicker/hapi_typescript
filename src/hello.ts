import {Request, ResponseToolkit, ResponseObject, ServerRoute} from '@hapi/hapi'

async function sayHello(request: Request, responseToolkit: ResponseToolkit): Promise<ResponseObject> {
	// if there isnt a param called name, defaults to World
	const name: string = request.params.name || "World";

	// develops response adds prefix hello
	const response = responseToolkit.response("Hello " + name);

	// adds additional headers if required
	response.header('X-Custom', 'some-value');
	
	return response;
}

export const helloRoutes: ServerRoute[] = [
	{
		method: 'GET',
		path: '/hello',
		handler: sayHello
	},
	{
		method: 'GET',
		path: '/hello/{name}',
		handler: sayHello
	}
]