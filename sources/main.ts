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
import { checkEnvVariable } from "./utils/checkEnvVariable";
import { ApiException } from "./utils/apiException";
import {loggedOnly} from "./api/middleware/loggedOnly";


// Check for mandatory env variables
checkEnvVariable("DB_HOST");
checkEnvVariable("DB_PORT");
checkEnvVariable("DB_PASSWD");

checkEnvVariable("JWT_ENCODE_KEY");


// Express
const app = Express();

// Configure some useful middleware
app.use(Morgan('dev'));
app.use(Cors());
app.use(CookieParser());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());


// Load all Routers
loadRouters(app, "build/api/routes");

import * as AsyncHandler from 'express-async-handler';
app.get('/lol', AsyncHandler(loggedOnly), (req: Request, res: Response) => {
    const r = <any>req;
    console.log(r.user);
    console.log(r.dbConnection);

    res.status(200).json({});
});

// Handle invalid requests as 404
app.use((req: Request, res: Response, next: Function) => {

    const r = <any>req;
    console.log(r.user);
    console.log(r.dbConnection);

    res.status(404).json({
        message: "Route or Resource not found"
    });
});


// Handle errors
app.use((error: Error, req: Request, res: Response, next: Function) => {
    res.status(error instanceof ApiException ? (<ApiException>error).code : 500)
        .json({
            message: error.message
        });
});


// Start the server

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.debug('Server started on port ' + port);
    });
} else {
    module.exports = app;
}
