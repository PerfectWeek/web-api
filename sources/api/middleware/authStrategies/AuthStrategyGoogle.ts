import { Connection } from "typeorm";
import { Express, Request, Response } from "express";
import { google } from "googleapis";
import * as Jwt from "jsonwebtoken";

import { User } from "../../../model/entity/User";
import { UserView } from "../../views/UserView";


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
    const oauth = new google.auth.OAuth2(
        params.credentials.clientId,
        params.credentials.clientSecret,
        `${process.env.API_HOST}${params.express.path}/callback`
    );
    const scope = "https://www.googleapis.com/auth/calendar " +
        "https://www.googleapis.com/auth/userinfo.email " +
        "https://www.googleapis.com/auth/userinfo.profile";
    const oauthUri = oauth.generateAuthUrl({
        access_type: "offline",
        scope: scope
    });

    params.express.app.get(params.express.path, (req: Request, res: Response) => {
        res.status(200).json({
            oauth_uri: oauthUri
        });
    });

    params.express.app.get(`${params.express.path}/callback`, (req: Request, res: Response) => {
        oauth.getToken(req.query.code)
            .then(token => {
                oauth.setCredentials(token.tokens);
                const googleOauthApi = google.oauth2({
                    version: "v2",
                    auth: oauth
                });

                googleOauthApi.userinfo.get().then(value => {
                    const profile = value.data;

                    User.findByEmail(params.conn, profile.email).then((user: User) => {
                        if (!user) {
                            user = new User(profile.email, profile.email, null);
                        }

                        user.googleProviderPayload = {
                            accessToken: token.tokens.access_token,
                            refreshToken: token.tokens.refresh_token,
                            scope: scope,
                            tokenType: token.tokens.token_type,
                            expiresIn: null
                        };

                        params.conn.getRepository(User).save(user).then(() => {
                            const token_payload = { id: user.id };
                            const jwt = Jwt.sign(token_payload, process.env.JWT_ENCODE_KEY);

                            res.status(200).json({
                                message: "Connected",
                                token: jwt,
                                user: UserView.formatUser(user)
                            });
                        });
                    })
                })
            })
            .catch(e => {
                res.status(400).json({
                    message: e.message
                });
            });
    });
};
