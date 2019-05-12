import { Request, Response } from "express";

import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { ApiException } from "../../utils/apiException";
import { User } from "../../model/entity/User";
import { TimeSlotListView } from "../views/assistant/TimeSlotListView";

import * as Assistant from "../services/assistant/Assistant";

//
//  Find best slots for an Event
//
export async function findBestSlots(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id: number = req.params.calendar_id;
    const duration: number = req.query.duration;
    const location: string = req.query.location || '';
    const min_time: Date = new Date(req.query.min_time);
    const max_time: Date = new Date(req.query.max_time);
    const limit: number = req.query.limit || 10;
    const type: string = req.query.type;

    if (!duration || !min_time || !max_time || min_time.getTime() >= max_time.getTime() || !type || limit <= 0) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can access this Calendar
    let calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.isCalendarOwner(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    const calendars = []
    for (const owner of calendar.owners) {
        const cals = await User.getAllCalendars(conn, owner.owner_id);
        for (const cal of cals) {
            cal.calendar = await Calendar.getCalendarWithOwners(conn, cal.calendar_id)
            calendars.push(cal.calendar);
        }
    }
    const slots = Assistant.findBestSlots(calendar, calendars, duration, min_time, max_time, type, requestingUser.timezone);

    return res.status(200).json({
        message: "OK",
        slots: TimeSlotListView.formatTimeSlotList(slots.slice(0, limit)),
    });
}

export async function getEventSuggestions(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        suggestions: [
            {
                event: {
                    id: 454,
                    name: "Damso a Montreal",
                    description: "lourd bail",
                    type: "hobby",
                    visibility: "public",
                    location: "Montreal",
                    start_time: "2012-12-12T12:12:12",
                    end_time: "2012-12-12T12:12:12",
                },
                score: 0.99,
            },
            {
                event: {
                    id: 92,
                    name: "Booba // U Arena",
                    description: "lourd bail",
                    type: "hobby",
                    visibility: "public",
                    location: "Montreal",
                    start_time: "2012-12-12T12:12:12",
                    end_time: "2012-12-12T12:12:12"
                },
                score: 1.00,
            },
            {
                event: {
                    id: 91,
                    name: "PNL -- Bercy",
                    description: "lourd bail",
                    type: "hobby",
                    visibility: "public",
                    location: "Montreal",
                    start_time: "2012-12-12T12:12:12",
                    end_time: "2012-12-12T12:12:12"
                },
                score: 1.00,
            },
            {
                event: {
                    id: 101,
                    name: "Road trip au sud du Canada",
                    description: "lourd bail",
                    type: "hobby",
                    visibility: "public",
                    location: "Montreal",
                    start_time: "2012-12-12T12:12:12",
                    end_time: "2012-12-12T12:12:12"
                },
                score: 0.5,
            },
            {
                event: {
                    id: 1,
                    name: "Evenement nul",
                    description: "moins lourd bail",
                    type: "hobby",
                    visibility: "public",
                    location: "Montreal",
                    start_time: "2012-12-12T12:12:12",
                    end_time: "2012-12-12T12:12:12"
                },
                score: 0.01,
            }
        ]
    })
}
