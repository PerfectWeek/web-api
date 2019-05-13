import { Calendar } from "../../../model/entity/Calendar";
import { TimeSlot } from "../../../utils/TimeSlot";
import { softmax, minMaxNormalisation } from "../../../utils/math";
import { TimeslotPreferences } from "../../../utils/baseTimeslotPreferences";
import { Event } from "../../../model/entity/Event";
import { User } from "../../../model/entity/User";
import { EventSuggestion } from "../../../utils/types/EventSuggestion";

const MINUTES = 60 * 1000;
const TRAVEL_TIME = 30;

function slotAvailable(calendar: Calendar, start_time: Date, end_time: Date, travel_time: number): boolean {
    return calendar.events.every((event: Event) => {
        return (!(start_time.getTime() - travel_time * MINUTES < event.endTime.getTime()
            && event.startTime.getTime() < end_time.getTime() + travel_time * MINUTES))
        })
}

function slotAvailableAll(calendars: Calendar[], start_time: Date, end_time: Date, travel_time: number): boolean {
    return calendars.every((calendar: Calendar) => {
        return (slotAvailable(calendar, start_time, end_time, travel_time));
    })
}

function getSlotScore(start_time: Date, end_time: Date, type: string, stride: number, preferences: TimeslotPreferences): number {
    let score = 0

    while (start_time < end_time) {
        score += preferences[type][start_time.getUTCDay()][start_time.getUTCHours()];
        start_time = new Date(start_time.getTime() + stride * MINUTES);
    }
    return score;
}

function applyTimezone(prefs: number[][], timezone: number): number[][] {
    const timezone_offset = Math.round(timezone / 60);
    if (timezone_offset !== 0) {

        const local_prefs = new Array(7).fill([])
            .map(() => new Array(24).fill(0));

        prefs.forEach((prefs_day: number[], day_idx: number) => {
            prefs_day.forEach((prefs_hour: number, hour_idx: number) => {
                let local_hour_idx = hour_idx - timezone_offset; // Back to UTC
                let local_day_idx = day_idx;

                if (local_hour_idx > 23) {
                    local_hour_idx %= 24;
                    local_day_idx += 1;
                }
                else if (local_hour_idx < 0) {
                    local_hour_idx += 24;
                    local_day_idx -= 1;
                }
                if (local_day_idx < 0) {
                    local_day_idx += 7;
                }
                else if (local_day_idx > 6) {
                    local_day_idx -= 7;
                }
                local_prefs[local_day_idx][local_hour_idx] = prefs_hour;
            })
        });
        return local_prefs;
    }
    return prefs;
}

function buildTypePreferences(prefs: number[][], timezone: number): number[][] {
    prefs = applyTimezone(prefs, timezone)

    const data = softmax([].concat.apply([], prefs));
    const ret: number[][] = [data.splice(0, 24)];

    while (data.length) {
        ret.push(data.splice(0, 24));
    }
    return ret;
}

function getPreferencesMatrix(calendar: Calendar, timezone: number): any {
    return {
        "party": buildTypePreferences(calendar.timeslotPreferences["party"], timezone),
        "work": buildTypePreferences(calendar.timeslotPreferences["work"], timezone),
        "hobby": buildTypePreferences(calendar.timeslotPreferences["hobby"], timezone),
        "workout": buildTypePreferences(calendar.timeslotPreferences["workout"], timezone),
    };
}

function normaliseSlots(slots: TimeSlot[], min_score: number, max_score: number): TimeSlot[] {
    return slots.map(slot => {
        slot.score = minMaxNormalisation(slot.score, min_score, max_score);
        return slot;
    });
}

export function findBestSlots(groupCalendar: Calendar, calendars: Calendar[], duration: number,
        min_time: Date, max_time: Date, type: string, timezone: number): Array<TimeSlot> {
    const slots = []
    const stride = 60; // in minutes
    let min_score = 0;
    let max_score = 0;

    const preferences = getPreferencesMatrix(groupCalendar, timezone);

    while (min_time.getTime() + duration * MINUTES <= max_time.getTime()) {
        const end_time = new Date(min_time.getTime() + duration * MINUTES);
        if (slotAvailableAll(calendars, min_time, end_time, TRAVEL_TIME)) {

            const score = getSlotScore(min_time, end_time, type, stride, preferences);
            if (score > max_score) {
                max_score = score;
            }
            if (score < min_score) {
                min_score = score;
            }

            slots.push(new TimeSlot(
                min_time,
                end_time,
                score,
            ));
        }
        min_time = new Date(min_time.getTime() + stride * MINUTES);
    }
    return normaliseSlots(slots, min_score, max_score).sort((a: TimeSlot, b: TimeSlot) => b.score - a.score);
}

function filterAttendableEvents(calendars: Calendar[], events: Event[], min_time: Date, max_time: Date): Event[] {
    return events.filter((e: Event) => {
        return (e.startTime >= min_time && e.endTime <= max_time
            && slotAvailableAll(calendars, e.startTime, e.endTime, TRAVEL_TIME));
    })
}

function getSuggestionScore(user: User, event: Event): number {
    return 1; //TODO build a real collaborative filtering
}

export function processEventSuggestions(user: User, calendars: Calendar[], events: Event[],
        min_time: Date, max_time: Date)
        : EventSuggestion[] {
    const attendableEvents = filterAttendableEvents(calendars, events, min_time, max_time);

    return attendableEvents.map((e: Event) => {
        return ({
            event: e,
            score: getSuggestionScore(user, e)
        })
    });
}
