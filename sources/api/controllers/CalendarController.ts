import { Request, Response } from "express";
import { EventsToAttendees } from "../../model/entity/EventsToAttendees";

import { ApiException } from "../../utils/apiException";
import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { CalendarView } from "../views/CalendarView";
import { Event } from "../../model/entity/Event";
import { EventView } from "../views/EventView";


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
    const createdCalendar = await Calendar.createCalendar(conn, calendar, [requestingUser]);

    return res.status(201).json({
        message: "Calendar created",
        calendar: CalendarView.formatCalendar(createdCalendar)
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

    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    return res.status(200).json({
        message: "OK",
        calendar: CalendarView.formatCalendar(calendar)
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
    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    calendar.name = name;
    if (!calendar.isValid()) {
        throw new ApiException(400, "Invalid fields in Calendar");
    }
    const updatedCalendar = await conn.manager.save(calendar);

    return res.status(200).json({
        message: "Calendar successfully edited",
        calendar: CalendarView.formatCalendar(updatedCalendar)
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
    if (!calendarToOwner) {
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
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    if (!name || !start_time || !end_time) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can create an Event in this Calendar
    const calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar
        || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    // Create the Event
    const event = new Event(name, description, location, calendar, start_time, end_time);
    if (!event.isValid()) {
        throw new ApiException(400, "Invalid fields in Event");
    }
    const savedEvent = await conn.manager.save(event);

    // Add the requesting User in the attendees list
    const eventToAttendee = new EventsToAttendees(savedEvent.id, requestingUser.id);
    await conn.manager.save(eventToAttendee);

    return res.status(201).json({
        message: "Event created",
        event: EventView.formatEvent(savedEvent),
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
    let calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    return res.status(200).json({
        message: "OK",
        events: CalendarView.formatEventList(calendar.events),
    });
}
