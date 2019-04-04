import { Calendar } from "../../model/entity/Calendar";
import { TimeSlot } from "../../utils/TimeSlot";


/**
 * This variable describes how each category of Event is linked to a timeSlot,
 * with an array of values each representing an hours of the day (from 12AM to 11PM).
 * The values sums at 1, which means a value of 1 is forced to be set on that time slot.
 * For example, if a category has prefs [0, 0, ,...,0.3, 0.4, 0.2, 0.1, 0],
 * it means it is mandatory to set this event on the evening.
 * This prefs will be learnt during training.
 */
interface ICategories {
    party:      string;
    secondKey:     string;
    thirdKey:      string;
    [key: string]: string;
}

const categories_prefs: any = {
    "party": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.3, 0.4, 0.2, 0],
    "work": [0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0],
    "workout": [0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0, 0, 0.1, 0.1, 0, 0, 0, 0, 0.1, 0.3, 0.1, 0, 0, 0, 0],
    "dinner": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.3, 0.3, 0.2, 0, 0],
    "lunch": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.5, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}

function slotAvailable(calendar: Calendar, min_time: Date, end_time: Date, travel_time: number): boolean {
    for (let event of calendar.events) {
        if ((event.startTime.getTime() >= min_time.getTime()
            && event.startTime.getTime() <= end_time.getTime())
            || (event.endTime.getTime() >= min_time.getTime()
                && event.endTime.getTime() <= end_time.getTime())) {
            return false;
        }
    }
    return true;
}

function slotAvailableAll(calendars: Calendar[], min_time: Date, end_time: Date, travel_time: number): boolean {
    for (let calendar of calendars) {
        if (!slotAvailable(calendar, min_time, end_time, travel_time)) {
            return false;
        }
    }
    return true;
}

function getSlotScore(start_time: Date, end_time: Date, category: string, stride: number): number {
    let score = 0
    while (start_time < end_time) {
        score += categories_prefs[category][start_time.getUTCHours()];
        start_time = new Date(start_time.getTime() + stride * 60000);
    }
    return score;
}

export function findBestSlots(calendars: Calendar[], duration: number, location: string, min_time: Date, max_time: Date, category: string): Array<TimeSlot> {
    const slots = []
    const stride = 60;
    while (min_time < max_time) {
        const end_time = new Date(min_time.getTime() + duration * 60000);
        if (slotAvailableAll(calendars, min_time, end_time, 30)) {
            slots.push(new TimeSlot(
                min_time,
                end_time,
                getSlotScore(min_time, end_time, category, stride),
            ));
        }
        min_time = new Date(min_time.getTime() + stride * 60000);
    }

    return slots.sort((a: TimeSlot, b: TimeSlot) => b.score - a.score);
}
