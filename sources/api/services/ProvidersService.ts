import { google, calendar_v3 } from "googleapis";

import { User } from "../../model/entity/User";
import { Calendar } from "../../model/entity/Calendar";
import { Event } from "../../model/entity/Event";
import { Connection } from "typeorm";

import axios from "axios";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

export async function importGoogleCalendars(conn: Connection, user: User) {
    if (user.googleProviderPayload === null) {
        return [];
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
            .map((e: any) => loadGoogleEvent(e, imported_calendar)))

        nextPageToken = events.data.nextPageToken;
        if (nextPageToken === undefined) {
            imported_calendar.googleCalendarSyncToken = events.data.nextSyncToken;
            lastSyncToken = null;
        }
    }
    const events_to_add: Event[] = await Promise.all(events_promise).then((completed) => { return completed; });
    imported_calendar.events.push(...events_to_add);
    user.googleProviderPayload.syncedGoogleCalendars[googleCalendar.id] = pw_id;
    return imported_calendar;
}

function loadGoogleEvent(googleEvent: calendar_v3.Schema$Event, imported_calendar: Calendar): Event {
    return new Event(
        googleEvent.summary,
        googleEvent.description,
        googleEvent.location,
        "other",
        imported_calendar,
        new Date(googleEvent.start.dateTime),
        googleEvent.endTimeUnspecified ? new Date(googleEvent.start.dateTime) : new Date(googleEvent.end.dateTime),
    );
}

export async function importFacebookEvents(conn: Connection, user: User) {
    if (user.facebookProviderPayload === null) {
        return;
    }

    const fields = 'id, name, description, start_time, end_time, place';

    const response = await axios.get('https://graph.facebook.com/v3.2/me/events', {
        params: {
            access_token: user.facebookProviderPayload.accessToken,
            fields: fields
        },
    });

    const cal_id: number = user.facebookProviderPayload.facebookCalendarId;
    const calendar = (cal_id)
        ? await Calendar.findCalendarById(conn, cal_id)
        : await Calendar.createCalendar(conn, new Calendar('Facebook'), [user]);

    const events_promise = [];

    if (cal_id === undefined) {
        user.facebookProviderPayload.facebookCalendarId = calendar.id;
        await conn.manager.save(user);
    }
    if (response.status === 200) {
        events_promise.push(
            ...response.data.data.map(
                async (e: any) => await loadFacebookEvent(conn, e, calendar, user)
            )
        );
    }
    calendar.events = await Promise.all(events_promise).then((completed) => { return completed; });
}

async function loadFacebookEvent(conn: Connection,
        facebookEvent: any,
        calendar: Calendar,
        user: User) {

    const event_id = user.facebookProviderPayload.syncedEvents[facebookEvent.id];
    if (event_id === undefined) {
        const event = new Event(
            facebookEvent.name,
            facebookEvent.description,
            facebookEvent.place.name,
            "other",
            calendar,
            new Date(facebookEvent.start_time),
            new Date(facebookEvent.end_time)
        );
        const imported_event = await conn.manager.save(event);
        user.facebookProviderPayload.syncedEvents[facebookEvent.id] = imported_event.id;
    }
    else {
        const imported_event = await Event.getEventById(conn, event_id);
        imported_event.name = facebookEvent.name;
        imported_event.description = facebookEvent.description;
        imported_event.location = facebookEvent.place.name;
        imported_event.startTime = new Date(facebookEvent.start_time);
        imported_event.endTime = new Date(facebookEvent.end_time);
        await conn.manager.save(imported_event);
    }
}
