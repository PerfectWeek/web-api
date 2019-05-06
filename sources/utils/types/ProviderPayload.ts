export type GoogleProviderPayload = {
    accessToken: string,
    refreshToken: string,
    tokenType: string,
    scope: string,
    expiresIn: string,
    googleCalendarListSyncToken: string,
    syncedGoogleCalendars: {[key: string]: number};
};

export type FacebookProviderPayload = {
    accessToken: string,
    refreshToken: string,
    tokenType: string,
    scope: string,
    expiresIn: string,
    facebookCalendarId: number,
    syncedEvents: {[key: string]: number}
}
