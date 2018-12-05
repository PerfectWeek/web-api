import { Request, Response } from "express";
import { ApiException } from "../../utils/apiException";
import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { CalendarView } from "../views/CalendarView";
import { User } from "../../model/entity/User";


export async function createCalendar(req: Request, res: Response) {
    if (!req.body.name) {
        throw new ApiException(400, "Invalid request");
    }
    const requestingUser = getRequestingUser(req);

    const connection = await DbConnection.getConnection();
    const calendarRepository = connection.getRepository(Calendar);
    const calendarsToOwnersRepository = connection.getRepository(CalendarsToOwners);

    const calendar = new Calendar(req.body.name, [], []);
    const createdCalendar = await calendarRepository.save(calendar);

    const calendarsToOwners = new CalendarsToOwners(createdCalendar.id, requestingUser.id);

    await calendarsToOwnersRepository.save(calendarsToOwners);

    return res.status(201).json({
        message: "Calendar created",
        group: CalendarView.formatCalendar(createdCalendar)
    });
}

export async function getCalendarInfo(req: Request, res: Response) {
    const connection = await DbConnection.getConnection();
    const calendarRepository = connection.getRepository(Calendar);
    const calendarsToOwnersRepository = connection.getRepository(CalendarsToOwners);
    const requestingUser = getRequestingUser(req);

    const id = req.params.calendar_id;
    const calendar = await Calendar.getCalendarWithOwners(calendarRepository, calendarsToOwnersRepository, id);

    if (!isCalendarOwner(calendar, requestingUser)) {
        return res.status(403).json({
            message: "Calendar not accessible"
        });
    }

    if (!calendar) {
        return res.status(404).json({
            message: "Calendar not found"
        });
    }
    return res.status(200).json({
        message: "OK",
        calendar: CalendarView.formatCalendar(calendar)
    });
}

export async function editCalendar(req: Request, res: Response) {
    return res.status(200).json({
        message: "Calendar successfully edited",
        calendar: {
            id: 2,
            name: "QLF"
        }
    });
}

export async function deleteCalendar(req: Request, res: Response) {
    return res.status(200).json({
        message: "Calendar successfully deleted"
    })
}

function isCalendarOwner(calendar: Calendar, user: User) {
    for (let cto of calendar.owners) {
        if (cto.owner_id === user.id) {
            return true;
        }
    }
    return false;
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
            start_time: Date.parse("31-12-2018T20:00:00"),
            end_time: Date.parse("01-01-2019T06:00:00")
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
                start_time: "31-12-2018T20:00:00",
                end_time: "01-12-2019T05:00:00"
            },
            {
                id: 3,
                name: "Noel",
                start_time: "25-12-2018T00:00:00",
                end_time: "25-12-2018T00:00:00"
            },
            {
                id: 4,
                name: "Grosse ress chez benard",
                start_time: "28-12-2018T18:00:00",
                end_time: "30-12-2018T19:30:00"
            },
        ]
    });
}
