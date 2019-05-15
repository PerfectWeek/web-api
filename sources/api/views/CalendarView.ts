import { Calendar } from "../../model/entity/Calendar";
import { Event } from "../../model/entity/Event";
import { User } from "../../model/entity/User";

import { EventView } from "./EventView";

export class CalendarView {

    public static formatCalendar(calendar: Calendar): any {
        return {
            id: calendar.id,
            name: calendar.name
        };
    }

    public static formatCalendarWithRole(calendar: Calendar, user: User): any {
        return {
            id: calendar.id,
            name: calendar.name,
            role: roleInCalendar(calendar, user)
        };
    }

    public static formatEventList(events: Event[]): any[] {
        return events.map(EventView.formatEventRecap);
    }
}


//
// Helpers
//
const roleInCalendar = (calendar: Calendar, user: User): string => {
    const userIdx = calendar.owners.findIndex(u => u.owner_id === user.id);
    return calendar.owners[userIdx].role;
};
