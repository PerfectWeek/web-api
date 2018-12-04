import { Request, Response } from "express"


export async function createCalendar(req: Request, res: Response) {
    return res.status(201).json({
        message: "Calendar created",
        calendar: {
            id: 4,
            name: "Groupe Travail"
        }
    });
}

export async function createEvent(req: Request, res: Response) {
    return res.status(201).json({
        message: "Event created",
        event: {
            id: 5,
            name: "Nouvel An",
            description: "10, 9, 8, 7, 6, 5, 4, 3, 2, 1, BONNE ANNEEEE",
            calendar_id: 2,
            start_time: Date.parse("31-12-2018T20:00:00"),
            end_time: Date.parse("01-01-2019T06:00:00")
        }
    });
}

export async function getCalendarInfo(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        calendar: {
            id: 2,
            name: "La famille",
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
                start_time: Date.parse("31-12-2018T20:00:00"),
                end_time: Date.parse("01-12-2019T05:00:00")
            },
            {
                id: 3,
                name: "Noel",
                start_time: Date.parse("25-12-2018T00:00:00"),
                end_time: Date.parse("25-12-2018T00:00:00")
            },
            {
                id: 4,
                name: "Grosse ress chez benard",
                start_time: Date.parse("28-12-2018T18:00:00"),
                end_time: Date.parse("30-12-2018T19:30:00")
            },
        ]
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
