import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { CalendarView } from "./CalendarView";

export class CalendarsToOwnersView {

    public static formatCalendarsToOwnersList(calendars: CalendarsToOwners[]): any {
        return calendars.map(this.formatCalendarsToOwners);
    }

    static formatCalendarsToOwners(calendar: CalendarsToOwners): any {
        return CalendarView.formatCalendar(calendar.calendar);
    }
}
