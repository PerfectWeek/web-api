import { Connection } from "typeorm";
import { Express, Request, Response } from "express";
import { google } from "googleapis";
import * as Jwt from "jsonwebtoken";

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
    const oauth = new google.auth.OAuth2(
        params.credentials.clientId,
        params.credentials.clientSecret,
        `${process.env.API_HOST}${params.express.path}/callback`
    );
    const scope = "https://www.googleapis.com/auth/calendar " +
        "https://www.googleapis.com/auth/userinfo.email " +
        "https://www.googleapis.com/auth/userinfo.profile";

    params.express.app.get(`${params.express.path}/callback`, (req: Request, res: Response) => {

        const accessToken = req.query.access_token;
        const refreshToken = req.query.refreshToken || null;

        if (!accessToken) {
            return res.status(400).json({
                message: "Bad request"
            });
        }

        oauth.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });
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

                if (!user.googleProviderPayload) {
                    user.googleProviderPayload = emptyPayloadToken(scope);
                }

                user.googleProviderPayload.accessToken = accessToken;
                if (refreshToken) {
                    user.googleProviderPayload.refreshToken = refreshToken;
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
        })
        .catch(e => {
            res.status(400).json({
                message: e.message
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
