"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
exports.postRoutes = [
    {
        method: ['GET', 'POST'],
        path: '/post/{id}',
        handler: (request, reply) => {
            console.log("request.payload", request.payload);
            return reply.response("This is a POST method");
        }
    }
];
