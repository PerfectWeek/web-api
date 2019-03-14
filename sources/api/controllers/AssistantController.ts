import { Request, Response } from "express";

import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { ApiException } from "../../utils/apiException";
import { User } from "../../model/entity/User";
import * as Assistant from "../../core/assistant/Assistant";

//
//  Find best slots for an Event
//
export async function findBestSlots(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id: number = req.params.calendar_id;
    const duration: number = req.query.duration;
    const location: string = req.query.location;
    const min_time: Date = new Date(req.query.min_time);
    const max_time: Date = new Date(req.query.max_time);

    if (!duration || !location || !min_time || !max_time) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can access this Calendar
    let calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    const calendars = []
    for (let owner of calendar.owners) {
        const cals = await User.getAllCalendars(conn, owner.owner_id);
        for (let cal of cals) {
            cal.calendar = await Calendar.getCalendarWithOwners(conn, cal.calendar_id)
            calendars.push(cal.calendar);
        }
    }
    Assistant.findBestSlots(calendars, duration, location, min_time, max_time);

    return res.status(200).json({
        message: "OK",
        slots: [
            {
                "start_time": "2019-03-08T12:12:12",
                "end_time": "2019-03-08T15:12:12",
                "score": 0.9
            },
            {
                "start_time": "2019-03-08T14:12:12",
                "end_time": "2019-03-08T17:12:12",
                "score": 0.8
            },
            {
                "start_time": "2019-03-08T20:12:12",
                "end_time": "2019-03-08T23:12:12",
                "score": 0.5
            },
            {
                "start_time": "2019-03-09T12:12:12",
                "end_time": "2019-03-09T15:12:12",
                "score": 0.2
            },
        ]
    });
}
