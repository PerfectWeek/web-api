//
// Created by benard_g on 2018/06/02
//

import * as Express from 'express';
import { Request, Response } from "express";
import * as Morgan from 'morgan';
import * as Cors from 'cors';
import * as CookieParser from 'cookie-parser';
import * as BodyParser from 'body-parser';

import { loadRouters } from "./utils/loadRouters";


const app = Express();

// Configure some useful middleware
app.use(Morgan('dev'));
app.use(Cors());
app.use(CookieParser());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());

// Load all Routers
loadRouters(app, "build/api/routes");

// Handle invalid requests as 404
app.use((req: Request, res: Response, next: Function) => {
    const error = new Error('Route or Resource not found');
    (<any>error).status = 404;
    next(error);
});

// Handle errors
app.use((error: Error, req: Request, res: Response) => {
    res.status((<any>error).status || 500);
    res.json({
        message: error.message
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.debug('Server started on port ' + port);
});
