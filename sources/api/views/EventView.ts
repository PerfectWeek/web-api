import { Event } from "../../model/entity/Event";

export class EventView {

    public static formatEvent(event: Event): any {
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            calendar_id: event.calendar.id,
            location: event.location,
            start_time: event.startTime,
            end_time: event.endTime,
            attendees: event.attendees
        };
    }

    public static formatEventRecap(event: Event): any {
        return {
            id: event.id,
            name: event.name,
            start_time: event.startTime,
            end_time: event.endTime,
        };
    }


}
