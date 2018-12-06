import { Calendar } from "../../model/entity/Calendar";
import { Event } from "../../model/entity/Event";

export class CalendarView {

    public static formatCalendar(calendar: Calendar): any {
        return {
            id: calendar.id,
            name: calendar.name
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

    public static formatEventList(events: Event[]): any {
        return {
            events: events.map(this.formatEventRecap),
        };
    }
}
