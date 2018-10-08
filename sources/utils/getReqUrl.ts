import {Request, Response} from 'express';

export function getReqUrl(req: Request): string {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}