import { Request, Response } from "express";
import { EventsToAttendees } from "../../model/entity/EventsToAttendees";

import { ApiException } from "../../utils/apiException";
import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { CalendarsToOwners, createCalendarOwner } from "../../model/entity/CalendarsToOwners";
import { CalendarView } from "../views/CalendarView";
import { Event } from "../../model/entity/Event";
import { EventView } from "../views/EventView";
import { isEventVisibilityValid } from "../../utils/types/EventVisibility";
import { CalendarRole } from "../../utils/types/CalendarRole";
import { EventStatus } from "../../utils/types/EventStatus";


//
// Create a new Calendar
//
export async function createCalendar(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const name: string = req.body.name;
    if (!name) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    const calendar = new Calendar(name);
    if (!calendar.isValid()) {
        throw new ApiException(400, "Invalid fields in Calendar");
    }
    const createdCalendar = await Calendar.createCalendar(
        conn,
        calendar,
        [createCalendarOwner(requestingUser)],
        requestingUser.id
    );

    return res.status(201).json({
        message: "Calendar created",
        calendar: CalendarView.formatCalendarWithRole(createdCalendar, requestingUser)
    });
}


//
// Get information about a specific Calendar
//
export async function getCalendarInfo(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const id: number = req.params.calendar_id;

    const connection = await DbConnection.getConnection();
    const calendar = await Calendar.getCalendarWithOwners(connection, id);

    if (!calendar || !calendar.userCanViewEvents(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    return res.status(200).json({
        message: "OK",
        calendar: CalendarView.formatCalendarWithRole(calendar, requestingUser)
    });
}


//
// Edit a Calendar information
//
export async function editCalendar(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id: number = req.params.calendar_id;
    const name: string = req.body.name;
    if (!name) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Get the Calendar and make sure the requesting User can edit it
    const calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.isCalendarAdmin(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    calendar.name = name;
    if (!calendar.isValid()) {
        throw new ApiException(400, "Invalid fields in Calendar");
    }
    const updatedCalendar = await conn.manager.save(calendar);

    return res.status(200).json({
        message: "Calendar successfully edited",
        calendar: CalendarView.formatCalendarWithRole(updatedCalendar, requestingUser)
    });
}


//
// Delete a Calendar
//
export async function deleteCalendar(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id: number = req.params.calendar_id;

    const conn = await DbConnection.getConnection();

    // Check if the requesting User can delete this Calendar
    const calendarToOwner = await CalendarsToOwners.findCalendarRelation(conn, calendar_id, requestingUser.id);
    if (!calendarToOwner || calendarToOwner.role !== CalendarRole.Admin) {
        throw new ApiException(403, "Calendar not accessible");
    }

    // Delete the Calendar
    await Calendar.deleteCalendar(conn, calendar_id);

    return res.status(200).json({
        message: "Calendar successfully deleted"
    });
}


//
// Create an Event for a Calendar
//
export async function createEvent(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id = req.params.calendar_id;
    const name = req.body.name;
    const description = req.body.description || "";
    const location = req.body.location || "";
    const type = req.body.type;
    const visibility = req.body.visibility;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    if (!name || !type || !visibility || !isEventVisibilityValid(visibility) || !start_time || !end_time) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can create an Event in this Calendar
    const calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar
        || !calendar.userCanCreateEvents(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    // Create the Event
    const event = new Event(name, description, location, type, visibility, calendar, start_time, end_time);
    if (!event.isValid()) {
        throw new ApiException(400, "Invalid fields in Event");
    }

    // Add event in calendar's timeSlotPreferences
    calendar.addTimeslotPreference(event, requestingUser.timezone);

    // Invite Calendar members
    conn.manager.save(calendar);

    const savedEvent = await conn.manager.save(event);

    // Invite calendar members
    const calendarMembersInvites = calendar.owners
        .filter(m => m.role !== CalendarRole.Outsider)
        .map(m => {
            const status = m.owner_id === requestingUser.id
                ? EventStatus.Going
                : EventStatus.Invited;
            return new EventsToAttendees(savedEvent.id, m.owner_id, status)
        });

    await conn.manager.save(calendarMembersInvites);

    return res.status(201).json({
        message: "Event created",
        event: EventView.formatEventWithStatus(savedEvent, EventStatus.Going),
    });
}


//
// Get all Events of a Calendar
//
export async function getCalendarEvents(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id: number = req.params.calendar_id;

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can access this Calendar
    const calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.userCanViewEvents(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    // Get user status for each events
    const eventPromises = calendar.events.map(async e => {
        const eventRelation = await EventsToAttendees.getRelation(conn, e.id, requestingUser.id);
        e.calendar = calendar;
        return { event: e, relation: eventRelation };
    });
    let eventsWithRoles = await Promise.all(eventPromises);

    // Filter only accessible events when role is "Outsider"
    const userMember: CalendarsToOwners = calendar.owners.find(m => m.owner_id === requestingUser.id);
    if (userMember.role === CalendarRole.Outsider) {
        eventsWithRoles = eventsWithRoles.filter(e => e.relation !== null);
    }

    return res.status(200).json({
        message: "OK",
        events: eventsWithRoles.map(eta => {
            const status = eta.relation ? eta.relation.status : EventStatus.Invited;
            return EventView.formatEventWithStatus(eta.event, status);
        })
    });
}
