import { Connection } from "typeorm";
import { User } from "../../model/entity/User";
import { Event } from "../../model/entity/Event"
import { Calendar } from "../../model/entity/Calendar";
import { EventVisibility } from "../../utils/types/EventVisibility";

import axios from "axios";
import { CalendarRole } from "../../utils/types/CalendarRole";
import { createCalendarOwner } from "../../model/entity/CalendarsToOwners";

export async function importFacebookEvents(conn: Connection, user: User) {
    if (user.facebookProviderPayload === null) {
        return;
    }

    const fields = 'id, name, description, start_time, end_time, place, type';

    const response = await axios.get('https://graph.facebook.com/v3.2/me/events', {
        params: {
            access_token: user.facebookProviderPayload.accessToken,
            fields: fields
        },
    });

    const cal_id: number = user.facebookProviderPayload.facebookCalendarId;
    const calendar = (cal_id)
        ? await Calendar.findCalendarById(conn, cal_id)
        : await Calendar.createCalendar(
            conn,
            new Calendar('Facebook'),
            [createCalendarOwner(user)],
            user.id
        );

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
            facebookEvent.type === "public" ? EventVisibility.PUBLIC : EventVisibility.PRIVATE,
            calendar,
            new Date(facebookEvent.start_time),
            facebookEvent.end_time ? new Date(facebookEvent.end_time) : new Date(facebookEvent.start_time),
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
