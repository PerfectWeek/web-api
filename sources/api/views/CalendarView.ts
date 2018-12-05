import { Calendar } from "../../model/entity/Calendar";

export class CalendarView {

    public static formatCalendar(calendar: Calendar): any {
        return {
            id: calendar.id,
            name: calendar.name
        };
    }
}
