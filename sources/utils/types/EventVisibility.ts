export enum EventVisibility {
    PRIVATE = "private",
    RESTRICTED = "restricted",
    PUBLIC = "public",
}

export function isEventVisibilityValid(visibility: string): boolean {
    return Object.values(EventVisibility).indexOf(visibility) !== -1;
}
