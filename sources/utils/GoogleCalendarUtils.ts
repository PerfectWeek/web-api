import { google, calendar_v3 } from "googleapis";
import * as credentials from "../../credentials.json";
import { GetTokenResponse, OAuth2Client } from "google-auth-library/build/src/auth/oauth2client";
import { GoogleCalendarCredentials } from "../model/entity/GoogleCalendarCredentials.js";
import { Calendar } from "../model/entity/Calendar.js";
import { Event } from "../model/entity/Event.js";

const oauth2Client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    process.env.API_HOST + "/calendars/import-google-calendar/",
);

export class GoogleCalendarUtils {
    public static getConsentPageUrl(): string {
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: "https://www.googleapis.com/auth/calendar"
        });
    }

    public static getTokenFromCode(code: string): Promise<GetTokenResponse> {
        return oauth2Client.getToken(code);
    }

    public static async getCalendarAndEventsFromCredentials(credentials: GoogleCalendarCredentials): Promise<Calendar[]> {
        const calendar = google.calendar("v3");
        oauth2Client.setCredentials({
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate.getTime(),
            access_token: credentials.accessToken,
            token_type: credentials.tokenType,
        });

        //TODO use nextPage to get all calendars in case of a big collection
        const gcal = await calendar.calendarList.list({
            auth: oauth2Client,
        });
        const calendars_promise = await gcal.data.items.map(async (cal) => await this.importCalendar(cal, oauth2Client, calendar));
        return Promise.all(calendars_promise).then((completed) => { return completed; });
    }

    public static isValid(googleEvent: calendar_v3.Schema$Event) : boolean {
        return googleEvent !== undefined
            && googleEvent.start !== undefined
            && googleEvent.start.dateTime !== undefined 
            && googleEvent.summary !== undefined
            && googleEvent.summary !== "Week Numbers";
    }

    public static async importCalendar(
            googleCalendar: calendar_v3.Schema$CalendarListEntry,
            oauth2Client: OAuth2Client,
            calendar: calendar_v3.Calendar): Promise<Calendar> {
        const imported_calendar: Calendar = new Calendar(googleCalendar.summary);
        const events = await calendar.events.list({
            auth: oauth2Client,
            calendarId: googleCalendar.id,
        });
        imported_calendar.events = events.data.items
                .filter(e => this.isValid(e))
                .map((e) => this.importEvent(e, imported_calendar))
        return imported_calendar;
    }

    public static importEvent(googleEvent: calendar_v3.Schema$Event, imported_calendar: Calendar): Event {
        const imported_event: Event = new Event(
            googleEvent.summary,
            googleEvent.description,
            googleEvent.location,
            imported_calendar,
            new Date(googleEvent.start.dateTime),
            googleEvent.endTimeUnspecified ? new Date(googleEvent.start.dateTime) : new Date(googleEvent.end.dateTime),
        );
        return imported_event;
    }
}