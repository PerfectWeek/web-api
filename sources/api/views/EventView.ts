import { Event } from "../../model/entity/Event";
import { EventStatus } from "../../utils/types/EventStatus";
import { EventsToAttendees } from "../../model/entity/EventsToAttendees";

export class EventView {

    public static formatEvent(event: Event): any {
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            type: event.type,
            visibility: event.visibility,
            calendar_id: event.calendar.id,
            location: event.location,
            start_time: event.startTime,
            end_time: event.endTime
        };
    }

    public static formatEventWithStatus(event: Event, status: EventStatus) {
        return {
            ...EventView.formatEvent(event),
            status: status
        };
    }

    public static formatEventRecap(event: Event): any {
        return {
            id: event.id,
            name: event.name,
            start_time: event.startTime,
            end_time: event.endTime
        };
    }

    public static formatAttendee(eta: EventsToAttendees): any {
        return {
            pseudo: eta.attendee.pseudo,
            status: eta.status
        };
    }
}
