import { Connection } from "typeorm";
import { Express, Request, Response } from "express";
import * as Jwt from "jsonwebtoken";
import * as RequestPromise from "request-promise";

import { User } from "../../../model/entity/User";
import { UserView } from "../../views/UserView";
import { ProviderPayload } from "../../../utils/types/ProviderPayload";


type Params = {
    conn: Connection,
    express: {
        app: Express,
        path: string
    },
    credentials: {
        clientId: string,
        clientSecret: string
    }
};


export const init = (params: Params): void => {
    const scope = "email user_events";

    params.express.app.get(`${params.express.path}/callback`, (req: Request, res: Response) => {

        const accessToken = req.query.access_token;
        const refreshToken = req.query.refreshToken || null;

        if (!accessToken) {
            return res.status(400).json({
                message: "Bad request"
            });
        }

        // Retrieve user info
        RequestPromise.get({
            uri: "https://graph.facebook.com/v3.2/me",
            qs: {
                fields: "name,email",
                access_token: accessToken
            }
        }).then(value => {
            const profile = JSON.parse(value);

            User.findByEmail(params.conn, profile.email)
                .then(user => {
                    if (!user) {
                        user = new User(profile.email, profile.email, null);
                    }

                    if (!user.facebookProviderPayload) {
                        user.facebookProviderPayload = emptyPayloadToken(scope);
                    }

                    user.facebookProviderPayload.accessToken = accessToken;
                    if (refreshToken) {
                        user.facebookProviderPayload.refreshToken = refreshToken;
                    }

                    params.conn.getRepository(User).save(user).then(() => {
                        const token_payload = { id: user.id };
                        const jwt = Jwt.sign(token_payload, process.env.JWT_ENCODE_KEY);

                        res.status(200).json({
                            message: "Connected",
                            token: jwt,
                            user: UserView.formatUser(user)
                        });
                    });
                });
        }).catch((error: Error) => {
            res.status(400).json({
                message: error.message
            });
        });
    });
};

const emptyPayloadToken = (scope: string): ProviderPayload => {
    return {
        accessToken: null,
        refreshToken: null,
        scope: scope,
        expiresIn: null,
        tokenType: null
    };
};
