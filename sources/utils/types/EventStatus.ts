export enum EventStatus {
    Going = "going",
    Maybe = "maybe",
    No = "no",
    Invited = "invited"
}

export function eventStatusFromString(status: string): EventStatus | undefined {
    switch (status) {
        case EventStatus.Going: return EventStatus.Going;
        case EventStatus.Maybe: return EventStatus.Maybe;
        case EventStatus.No: return EventStatus.No;
        case EventStatus.Invited: return EventStatus.Invited;
        default: return undefined;
    }
}
