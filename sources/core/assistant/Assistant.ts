import { Calendar } from "../../model/entity/Calendar";

function slotAvailable(calendar: Calendar, min_time: Date, duration: number, travel_time: number): boolean {
    for (let event of calendar.events) {
        console.log(event.startTime, event.endTime);
        if ((event.startTime.getTime() <= min_time.getTime()
            && event.endTime.getTime() >= min_time.getTime())
            || (event.endTime.getTime() >= min_time.getTime() + duration*60000
            && event.startTime.getTime() <= min_time.getTime() + duration*60000)) {
            return false;
        }
    }
    return true;
}

function slotAvailableAll(calendars: Calendar[], min_time: Date, duration: number, travel_time: number): boolean {
    for (let calendar of calendars) {
        if (!slotAvailable(calendar, min_time, duration, travel_time)) {
            return false;
        }
    }
    return true;
}

export function findBestSlots(calendars: Calendar[], duration: number, location: string, min_time: Date, max_time: Date) {
    const slots = []
    const stride = 60;
    while (min_time < max_time) {
        if (slotAvailableAll(calendars, min_time, duration, 30)) {
            slots.push({start_time: min_time, end_time: new Date(min_time.getTime() + duration*60000)});
        }
        min_time = new Date(min_time.getTime() + stride * 60000);
    }
    console.log(slots);
}
