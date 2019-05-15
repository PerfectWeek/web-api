import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";

import { CalendarView } from "./CalendarView";

export class CalendarsToOwnersView {

    public static formatCalendarsToOwnersList(ctos: CalendarsToOwners[]): any {
        return ctos.map(cto => ({
            calendar: this.formatCalendarsToOwners(cto)
        }));
    }

    static formatCalendarsToOwners(cto: CalendarsToOwners): any {
        return {
            ...CalendarView.formatCalendar(cto.calendar),
            role: cto.role
        };
    }

    static formatPendingInvite(cto: CalendarsToOwners): any {
        return {
            ...CalendarView.formatCalendar(cto.calendar),
            role: cto.role,
            confirmed: cto.confirmed
        };
    }
}
