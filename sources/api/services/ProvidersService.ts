import { google, calendar_v3 } from "googleapis";

import { User } from "../../model/entity/User";
import { Calendar } from "../../model/entity/Calendar";
import { Event } from "../../model/entity/Event";
import { Connection } from "typeorm";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

export async function importGoogleCalendars(conn: Connection, user: User) {
    if (user.googleProviderPayload === null) {
        return;
    }
    const calendar = google.calendar("v3");

    oauth2Client.setCredentials({
        refresh_token: user.googleProviderPayload.refreshToken,
        access_token: user.googleProviderPayload.accessToken,
        token_type: user.googleProviderPayload.tokenType,
    });

    const calendars_promise = [];
    let nextPageToken = undefined;
    let lastSyncToken = user.googleProviderPayload.googleCalendarListSyncToken;

    while (lastSyncToken !== null) {
        const gcal: any = await calendar.calendarList.list({auth: oauth2Client, syncToken: lastSyncToken, pageToken: nextPageToken});

        calendars_promise.push(...await gcal.data.items.map(
            async (cal: any) => await importCalendar(conn, cal, oauth2Client, calendar, user)
        ));

        nextPageToken = gcal.data.nextPageToken;
        if (nextPageToken === undefined) {
            user.googleProviderPayload.googleCalendarListSyncToken = gcal.data.nextSyncToken;
            lastSyncToken = null;
        }
    }
    await conn.manager.save(user);
    return Promise.all(calendars_promise).then((completed) => { return completed; });
}

function isValid(googleEvent: calendar_v3.Schema$Event) : boolean {
    return googleEvent !== undefined
        && googleEvent.start !== undefined
        && googleEvent.start.dateTime !== undefined
        && googleEvent.summary !== undefined
        && googleEvent.summary !== "Week Numbers";
}

async function fetchOrCreateCalendar(
        conn: Connection,
        pw_id: number,
        googleCalendar: calendar_v3.Schema$CalendarListEntry
    ): Promise<Calendar> {

    if (pw_id === undefined) {
        const calendar = new Calendar(googleCalendar.summary);
        calendar.events = [];
        return calendar;
    }
    return Calendar.getCalendarWithOwners(conn, pw_id);
}

async function importCalendar(
        conn: Connection,
        googleCalendar: calendar_v3.Schema$CalendarListEntry,
        oauth2Client: any,
        calendar: calendar_v3.Calendar,
        user: User): Promise<Calendar|null> {

    const pw_id = user.googleProviderPayload.syncedGoogleCalendars[googleCalendar.id];
    const imported_calendar = await fetchOrCreateCalendar(conn, pw_id, googleCalendar);
    const events_promise = [];

    let nextPageToken = undefined;
    let lastSyncToken = imported_calendar.googleCalendarSyncToken;

    while (lastSyncToken !== null) {

        const events: any = await calendar.events.list({
            auth: oauth2Client,
            calendarId: googleCalendar.id,
            syncToken: lastSyncToken,
            pageToken: nextPageToken
        });

        events_promise.push(events.data.items
            .filter((e: any) => isValid(e))
            .map((e: any) => loadEvent(e, imported_calendar)))

        nextPageToken = events.data.nextPageToken;
        if (nextPageToken === undefined) {
            imported_calendar.googleCalendarSyncToken = events.data.nextSyncToken;
            lastSyncToken = null;
        }
    }
    const events_to_add: Event[] = await Promise.all(events_promise).then((completed) => { return completed; });
    imported_calendar.events.push(...events_to_add);
    if (pw_id !== undefined) {
        return null;
    }
    user.googleProviderPayload.syncedGoogleCalendars[googleCalendar.id] = pw_id;
    return imported_calendar;
}

function loadEvent(googleEvent: calendar_v3.Schema$Event, imported_calendar: Calendar): Event {
    const imported_event: Event = new Event(
        googleEvent.summary,
        googleEvent.description,
        googleEvent.location,
        "other",
        imported_calendar,
        new Date(googleEvent.start.dateTime),
        googleEvent.endTimeUnspecified ? new Date(googleEvent.start.dateTime) : new Date(googleEvent.end.dateTime),
    );
    return imported_event;
}

export async function importFacebookEvents(user: User) {
    console.log(user.facebookProviderPayload);
}
