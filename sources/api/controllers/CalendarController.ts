import { Request, Response } from "express";
import { ApiException } from "../../utils/apiException";
import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { CalendarView } from "../views/CalendarView";


export async function createCalendar(req: Request, res: Response) {
    const name: string = req.body.name;
    if (!name) {
        throw new ApiException(400, "Bad request");
    }

    const requestingUser = getRequestingUser(req);

    const connection = await DbConnection.getConnection();

    const calendar = new Calendar(name);

    if (!calendar.isValid()) {
        throw new ApiException(400, "Invalid fields in Calendar");
    }

    const createdCalendar = await connection.manager.save(calendar);

    const calendarsToOwners = new CalendarsToOwners(createdCalendar.id, requestingUser.id);
    await connection.manager.save(calendarsToOwners);

    return res.status(201).json({
        message: "Calendar created",
        calendar: CalendarView.formatCalendar(createdCalendar)
    });
}

export async function getCalendarInfo(req: Request, res: Response) {
    const id = req.params.calendar_id;

    const connection = await DbConnection.getConnection();
    const requestingUser = getRequestingUser(req);

    const calendar = await Calendar.getCalendarWithOwners(connection, id);

    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(404, "Calendar not found");
    }

    return res.status(200).json({
        message: "OK",
        calendar: CalendarView.formatCalendar(calendar)
    });
}

export async function editCalendar(req: Request, res: Response) {
    const id = req.params.calendar_id;
    const name = req.body.name;
    if (!name) {
        throw new ApiException(400, "Bad request");
    }

    const connection = await DbConnection.getConnection();
    const requestingUser = getRequestingUser(req);

    let calendar = await Calendar.getCalendarWithOwners(connection, id);

    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(404, "Calendar not found");
    }

    calendar.name = name;
    calendar = await connection.manager.save(calendar);

    return res.status(200).json({
        message: "Calendar successfully edited",
        calendar: CalendarView.formatCalendar(calendar)
    });
}

export async function deleteCalendar(req: Request, res: Response) {
    const id = req.params.calendar_id;

    const connection = await DbConnection.getConnection();
    const requestingUser = getRequestingUser(req);

    const calendar = await Calendar.getCalendarWithOwners(connection, id);

    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(404, "Calendar not found");
    }

    await Calendar.deleteCalendar(connection, calendar.id);

    return res.status(200).json({
        message: "Calendar successfully deleted"
    })
}

export async function createEvent(req: Request, res: Response) {
    return res.status(201).json({
        message: "Event created",
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

export async function getCalendarEvents(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        events: [
            {
                id: 2,
                name: "Nouvel an",
                start_time: "2018-12-31T20:00:00",
                end_time: "2019-01-01T05:00:00"
            },
            {
                id: 3,
                name: "Noel",
                start_time: "2018-12-25T00:00:00",
                end_time: "2018-12-25T01:00:00"
            },
            {
                id: 4,
                name: "Grosse ress chez benard",
                start_time: "2018-12-28T18:00:00",
                end_time: "2018-12-30T19:30:00"
            },
        ]
    });
}
