import { Request, Response } from "express";
import { Connection }        from "typeorm";

import { getRequestingUser } from "../middleware/loggedOnly";
import { Event }             from "../../model/entity/Event";
import { DbConnection }      from "../../utils/DbConnection";
import { Calendar }          from "../../model/entity/Calendar";
import { User }              from "../../model/entity/User";
import { ApiException }      from "../../utils/apiException";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";


export async function getEventInfo(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        event: {
            id: 5,
            name: "Nouvel An",
            description: "10, 9, 8, 7, 6, 5, 4, 3, 2, 1, BONNE ANNEEEE",
            location: "Le pub Universitaire",
            calendar_id: 2,
            start_time: "2018-12-31T20:00:00",
            end_time: "2019-01-01T06:00:00"
        }
    });
}

export async function getEventAttendees(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        attendees: [
            {
                pseudo: "Michel"
            },
            {
                pseudo: "Nicolas"
            },
            {
                pseudo: "Damien"
            },
            {
                pseudo: "Henri"
            }
        ]
    });
}

// The user is automatically added to members, it will change with roles
export async function inviteUser(req: Request, res: Response) {
    return res.status(201).json({
        message: "OK",
        attendees: [
            {
                pseudo: "Michel"
            },
            {
                pseudo: "Corentin"
            },
            {
                pseudo: "Nicolas"
            },
            {
                pseudo: "Damien"
            },
            {
                pseudo: "Henri"
            }
        ]
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
        throw new ApiException(404, "No such Event")
    }

    const calendar: Calendar = event.calendar;

    // Check if requesting user is a member of the calendar
    if (!(await CalendarsToOwners.findCalendarRelation(conn, calendar.id, requestingUser.id))) {
        throw new ApiException(403, "Action not allowed")
    }

    // Remove Event from calendar
    await Event.deleteById(conn, event.id);

    return res.status(200).json({
        message: "OK"
    });
}
