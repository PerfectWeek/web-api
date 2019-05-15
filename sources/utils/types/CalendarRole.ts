export enum CalendarRole {
    Admin = "admin",
    Actor = "actor",
    Spectator = "spectator",
    Outsider = "outsider"
}

export function calendarRoleFromString(role: string): CalendarRole | undefined {
    switch (role) {
        case CalendarRole.Admin: return CalendarRole.Admin;
        case CalendarRole.Actor: return CalendarRole.Actor;
        case CalendarRole.Spectator: return CalendarRole.Spectator;
        case CalendarRole.Outsider: return CalendarRole.Outsider;
        default: return undefined;
    }
}
