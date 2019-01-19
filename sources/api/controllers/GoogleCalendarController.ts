import { Request, Response } from "express";
import { Connection } from "typeorm";
import { Credentials } from "google-auth-library";

import { GoogleCalendarUtils } from "../../utils/GoogleCalendarUtils";
import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { GoogleCalendarCredentials } from "../../model/entity/GoogleCalendarCredentials";
import { Calendar } from "../../model/entity/Calendar";


export async function authorizeGoogleCalendar(req: Request, res: Response) {
    const url: string = GoogleCalendarUtils.getConsentPageUrl();
    res.redirect(url);
}

export async function getCode(req: Request, res: Response) {
    return res.status(200).json({
        message: 'Authorization granted',
        code: req.query.code,
        scope: req.query.scope,
    });
}

export async function importGoogleCalendar(req: Request, res: Response) {
    const user = getRequestingUser(req);

    const code: string = req.query.code;
    const token = await GoogleCalendarUtils.getTokenFromCode(code);
    const credentials : Credentials = token.res.data;

    const conn: Connection = await DbConnection.getConnection();

    const googleCalendarCredentials = new GoogleCalendarCredentials(
        credentials.access_token, credentials.refresh_token,
        "", credentials.token_type, new Date(credentials.expiry_date),
        user
    );

    await conn.manager.save(googleCalendarCredentials);

    const calendars: Calendar[] = await GoogleCalendarUtils.getCalendarAndEventsFromCredentials(googleCalendarCredentials);

    for (const cal of calendars) {
        await Calendar.createCalendar(conn, cal, [user]);
        const eventsInsertions = cal.events.map(e => {return conn.manager.save(e)});
        await Promise.all(eventsInsertions);
    }

    return res.status(201).json({
        message: 'Calendars imported successfully',
    });
}
