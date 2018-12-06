import { Calendar } from "../../model/entity/Calendar";
import { Event } from "../../model/entity/Event";
import { EventView } from "./EventView";

export class CalendarView {

    public static formatCalendar(calendar: Calendar): any {
        return {
            id: calendar.id,
            name: calendar.name
        };
    }

    public static formatEventList(events: Event[]): any {
        return events.map(EventView.formatEventRecap);
    }
}
