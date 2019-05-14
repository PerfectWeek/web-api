import { Connection } from "typeorm";
import { Express, Request, Response } from "express";
import { google } from "googleapis";
import * as Jwt from "jsonwebtoken";

import { User } from "../../../model/entity/User";
import { UserView } from "../../views/UserView";
import { emptyGooglePayloadToken } from "../../../utils/emptyProviderPayload";
import { Calendar } from "../../../model/entity/Calendar";


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
        const refreshToken = req.query.refresh_token || null;

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
                let needFirstCalendar = false;
                if (!user) {
                    user = new User(profile.email, profile.email, null);
                    needFirstCalendar = true;
                }

                if (!user.googleProviderPayload) {
                    user.googleProviderPayload = emptyGooglePayloadToken(scope);
                }

                user.googleProviderPayload.accessToken = accessToken;
                if (refreshToken) {
                    user.googleProviderPayload.refreshToken = refreshToken;
                }

                params.conn.getRepository(User).save(user).then(savedUser => {
                    const token_payload = { id: user.id };
                    const jwt = Jwt.sign(token_payload, process.env.JWT_ENCODE_KEY);

                    if (needFirstCalendar) {
                        const firstCalendar = new Calendar("Main calendar");
                        Calendar.createCalendar(params.conn, firstCalendar, [savedUser]);
                    }

                    res.status(200).json({
                        message: "Connected",
                        token: jwt,
                        user: UserView.formatUser(savedUser)
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
