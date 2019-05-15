import { Request, Response } from "express";

import { getRequestingUser } from "../middleware/loggedOnly";
import { DbConnection } from "../../utils/DbConnection";
import { Calendar } from "../../model/entity/Calendar";
import { ApiException } from "../../utils/apiException";
import { User } from "../../model/entity/User";
import { TimeSlotView } from "../views/assistant/TimeSlotView";
import { EventSuggestionView } from "../views/assistant/EventSuggestionView";
import { Event } from "../../model/entity/Event";
import { EventSuggestion } from "../../utils/types/EventSuggestion";
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

    if (!duration || !min_time || !max_time || min_time.getTime() > max_time.getTime() || !type || limit <= 0) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can access this Calendar
    let calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.userCanCreateEvents(requestingUser)) {
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
        slots: TimeSlotView.formatTimeSlotList(slots.slice(0, limit)),
    });
}

export async function getEventSuggestions(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const calendar_id: number = req.params.calendar_id;
    const min_time: Date = new Date(req.query.min_time);
    const max_time: Date = new Date(req.query.max_time);
    const limit: number = req.query.limit || 10;

    if (!min_time || !max_time || min_time.getTime() >= max_time.getTime() || limit <= 0) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Make sure the requesting User can access this Calendar
    const calendar = await Calendar.getCalendarWithOwners(conn, calendar_id);
    if (!calendar || !calendar.userCanCreateEvents(requestingUser)) {
        throw new ApiException(403, "Calendar not accessible");
    }

    const events = await Event.fetchAllPublicEvents(conn, min_time, max_time);
    const ctos = await User.getAllCalendars(conn, requestingUser.id);

    const calendarPromises: Promise<Calendar>[] = ctos.map(async cto => {
        return Calendar.getCalendarWithOwners(conn, cto.calendar_id);
    });
    const calendars: Calendar[] = await Promise.all(calendarPromises);

    const suggestions: EventSuggestion[] = Assistant.processEventSuggestions(requestingUser, calendars, events, min_time, max_time);
    return res.status(200).json({
        message: "OK",
        suggestions: EventSuggestionView.formatSuggestionList(suggestions),
    })
}
