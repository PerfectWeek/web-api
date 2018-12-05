import { Request, Response } from "express"


export async function getEventInfo(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        event: {
            id: 5,
            name: "Nouvel An",
            description: "10, 9, 8, 7, 6, 5, 4, 3, 2, 1, BONNE ANNEEEE",
            location: "Le pub Universitaire",
            calendar_id: 2,
            start_time: "31-12-2018T20:00:00",
            end_time: "01-01-2019T06:00:00"
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
            start_time: "31-12-2018T21:00:00",
            end_time: "01-01-2019T07:00:00"
        }
    });
}

export async function deleteEvent(req: Request, res: Response) {
    return res.status(200).json({
        message: "Event successfully deleted"
    });
}