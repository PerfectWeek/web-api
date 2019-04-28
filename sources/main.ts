//
// Created by benard_g on 2018/06/02
//

import * as ExpressApp from 'express';
import { Request, Response, Express } from "express";
import * as Morgan from 'morgan';
import * as Cors from 'cors';
import * as CookieParser from 'cookie-parser';
import * as BodyParser from 'body-parser';
import { Connection } from 'typeorm';

import { loadRouters } from "./utils/loadRouters";
import { checkEnvVariable } from "./utils/checkEnvVariable";
import { ApiException } from "./utils/apiException";
import * as AuthStrategyGoogle from "./api/middleware/authStrategies/AuthStrategyGoogle";
import { DbConnection } from "./utils/DbConnection";


const run = (done: (app: Express) => any): any => {
    DbConnection.getConnection().then((conn: Connection) => {
        // Check for mandatory env variables
        checkEnvVariable("DB_HOST");
        checkEnvVariable("DB_PORT");
        checkEnvVariable("DB_PASSWD");

        checkEnvVariable("JWT_ENCODE_KEY");

        checkEnvVariable("API_HOST");

        checkEnvVariable("GOOGLE_CLIENT_ID");
        checkEnvVariable("GOOGLE_CLIENT_SECRET");

        // Express
        const app = ExpressApp();

        // Configure some useful middleware
        app.use(Morgan('dev'));
        app.use(Cors());
        app.use(CookieParser());
        app.use(BodyParser.urlencoded({ extended: true }));
        app.use(BodyParser.json());


        // Load all Routers
        loadRouters(app, "build/sources/api/routes");


        // OAuth
        AuthStrategyGoogle.init({
            conn: conn,
            credentials: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            },
            express: {
                app: app,
                path: "/auth/providers/google"
            }
        });


        // Handle invalid requests as 404
        app.use((req: Request, res: Response, next: Function) => {
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


        done(app);
    })
    .catch(e => {
        console.error(`Database connection error: ${e.message}`);
    });
};

// Start the server
if (require.main === module) {
    run(app => {
        const api_port = process.env.PORT || 3000;
        app.listen(api_port, () => {
            console.debug('Server started on port ' + api_port);
        });
    });
} else {
    module.exports = run;
}
