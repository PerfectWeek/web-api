import { Request, Response } from "express";
import { Connection }        from "typeorm";
import { EventsToAttendees } from "../../model/entity/EventsToAttendees";

import { getRequestingUser } from "../middleware/loggedOnly";
import { Event }             from "../../model/entity/Event";
import { DbConnection }      from "../../utils/DbConnection";
import { Calendar }          from "../../model/entity/Calendar";
import { User }              from "../../model/entity/User";
import { ApiException }      from "../../utils/apiException";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { EventView }         from "../views/EventView";
import { UserView }          from "../views/UserView";


export async function getEventInfo(req: Request, res: Response) {
    const requestingUser: User = getRequestingUser(req);

    const eventId: number = req.params.event_id;

    const conn: Connection = await DbConnection.getConnection();

    // Recover event and check if exists
    const event: Event = await Event.getEventById(conn, eventId);
    if (!event) {
        throw new ApiException(404, "Event not found")
    }

    const calendar: Calendar = event.calendar;

    // Check if requesting user is a member of the calendar
    if (!(await CalendarsToOwners.findCalendarRelation(conn, calendar.id, requestingUser.id))) {
        throw new ApiException(403, "Action not allowed")
    }

    return res.status(200).json({
        message: "OK",
        event: EventView.formatEvent(event)
    });
}

export async function getEventAttendees(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const eventId = req.params.event_id;

    const conn = await DbConnection.getConnection();

    // Get the Event
    const eventWithAttendees = await Event.getEventWithAttendeesById(conn, eventId);
    if (!eventWithAttendees) {
        throw new ApiException(403, "Event not accessible");
    }

    // Check if the Event is accessible by the requesting User
    const userCalendarRelation = await CalendarsToOwners.findCalendarRelation(
        conn,
        eventWithAttendees.calendar.id,
        requestingUser.id
    );
    if (!userCalendarRelation) {
        throw new ApiException(403, "Event not accessible");
    }

    return res.status(200).json({
        message: "OK",
        attendees: eventWithAttendees.attendees.map(eta => UserView.formatPublicUser(eta.attendee))
    });
}

// The users are automatically added to members, it will change with roles
export async function inviteUsersToEvent(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const eventId = req.params.event_id;
    const usersToInvite: string[] = req.body.users;
    if (!usersToInvite || !usersToInvite.length) {
        throw new ApiException(400, "Bad Request");
    }

    const conn = await DbConnection.getConnection();

    // Get the Event
    const eventWithAttendees = await Event.getEventWithAttendeesById(conn, eventId);
    if (!eventWithAttendees) {
        throw new ApiException(403, "Event not accessible");
    }

    // Check if the Event is accessible by the requesting User
    const userCalendarRelation = await CalendarsToOwners.findCalendarRelation(
        conn,
        eventWithAttendees.calendar.id,
        requestingUser.id
    );
    if (!userCalendarRelation) {
        throw new ApiException(403, "Event not accessible");
    }

    // Get all Users
    const usersPromises = usersToInvite.map(userPseudo => User.findByPseudo(conn, userPseudo));
    const users = await Promise.all(usersPromises);
    const indexNonExistingUser = users.findIndex(u => !u);
    if (indexNonExistingUser !== -1) {
        throw new ApiException(404, `User "${usersToInvite[indexNonExistingUser]}" does not exist`);
    }

    // Check if users to invite aren't already in the list
    const existingUserIds = new Set(eventWithAttendees.attendees.map(eta => eta.attendee_id));
    const indexUserAlreadyInList = users.findIndex(u => existingUserIds.has(u.id));
    if (indexUserAlreadyInList !== -1) {
        throw new ApiException(409, `User "${usersToInvite[indexUserAlreadyInList]}" already invited`);
    }

    // Add the users in the attendees list
    const newEventsToAttendees = users.map(u => new EventsToAttendees(eventWithAttendees.id, u.id));
    await conn.manager.save(newEventsToAttendees);

    const attendees = [
        ...(eventWithAttendees.attendees.map(eta => eta.attendee)),
        ...users
    ];
    return res.status(201).json({
        message: "User(s) successfully invited",
        attendees: attendees.map(u => UserView.formatPublicUser(u))
    });
}

export async function editEvent(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        event: {
            id: 5,
            name: "Nouvel An",
            description: "10, 9, 8, 7, 6, 5, 4, 3, 2, 1, BONNE ANNEEEE",
            location: "Le pub Universitaire",
            calendar_id: 2,
            start_time: "2018-12-31T21:00:00",
            end_time: "2019-01-01T07:00:00"
        }
    });
}

export async function deleteEvent(req: Request, res: Response) {

    const requestingUser: User = getRequestingUser(req);

    const event_id: number = req.params.event_id;

    const conn: Connection = await DbConnection.getConnection();

    // Recover event and check if exists
    const event: Event = await Event.getEventById(conn, event_id);
    if (!event) {
        throw new ApiException(404, "Event not found")
    }

    const calendar: Calendar = event.calendar;

    // Check if requesting user is a member of the calendar
    if (!(await CalendarsToOwners.findCalendarRelation(conn, calendar.id, requestingUser.id))) {
        throw new ApiException(403, "Action not allowed")
    }

    // Remove Event from calendar
    await Event.deleteById(conn, event.id);

    return res.status(200).json({
        message: "Event successfully deleted"
    });
}
