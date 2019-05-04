export type GoogleProviderPayload = {
    accessToken: string,
    refreshToken: string,
    tokenType: string,
    scope: string,
    expiresIn: string,
    googleCalendarListSyncToken: string,
    syncedGoogleCalendars: any;
};

export type FacebookProviderPayload = {
    accessToken: string,
    refreshToken: string,
    tokenType: string,
    scope: string,
    expiresIn: string,
}
