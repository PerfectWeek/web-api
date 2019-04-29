import { Connection } from "typeorm";
import { Express, Request, Response } from "express";
import * as Jwt from "jsonwebtoken";
import { OAuth2 } from "oauth";
import * as RequestPromise from "request-promise";

import { User } from "../../../model/entity/User";


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
    const oauth = new OAuth2(
        params.credentials.clientId,
        params.credentials.clientSecret,
        "",
        "https://www.facebook.com/dialog/oauth",
        "https://graph.facebook.com/oauth/access_token"
    );

    const scope = "email";
    const redirectUri = `${process.env.API_HOST}${params.express.path}/callback`;
    const oauthUri = oauth.getAuthorizeUrl({
        redirect_uri: redirectUri,
        scope: scope
    });

    params.express.app.get(params.express.path, (req: Request, res: Response) => {
        res.status(200).json({
            oauth_uri: oauthUri
        });
    });

    params.express.app.get(`${params.express.path}/callback`, (req: Request, res: Response) => {
        oauth.getOAuthAccessToken(
            req.query.code,
            {
                redirect_uri: redirectUri
            },
            (error, accessToken, refreshToken, results) => {
                if (error) {
                    console.error(error);
                    res.status(400).json({
                        message: "Auth error"
                    });
                }
                else if (results.error) {
                    console.error(results.error);
                    res.status(400).json({
                        message: "Auth error"
                    });
                }
                else {
                    RequestPromise.get({
                        uri: "https://graph.facebook.com/v3.2/me",
                        qs: {
                            fields: "name,email",
                            access_token: results.access_token
                        }
                    }).then(value => {
                        const profile = JSON.parse(value);

                        User.findByEmail(params.conn, profile.email)
                            .then(user => {
                                if (!user) {
                                    user = new User(profile.email, profile.email, null);
                                }

                                user.facebookProviderPayload = {
                                    accessToken: results.access_token,
                                    refreshToken: null,
                                    scope: scope,
                                    tokenType: results.token_type,
                                    expiresIn: results.expires_in
                                };

                                params.conn.getRepository(User).save(user).then(() => {
                                    const token_payload = { id: user.id };
                                    const jwt = Jwt.sign(token_payload, process.env.JWT_ENCODE_KEY);

                                    res.status(200).json({
                                        message: "Connected",
                                        token: jwt
                                    });
                                });
                            });
                    }).catch((error: Error) => {
                        res.status(400).json({
                            message: error.message
                        });
                    });
                }
            }
        );
    });
};
