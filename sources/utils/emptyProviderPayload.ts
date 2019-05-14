import { GoogleProviderPayload, FacebookProviderPayload } from "./types/ProviderPayload";

export const emptyGooglePayloadToken = (scope: string): GoogleProviderPayload => {
    return {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        googleCalendarListSyncToken: undefined,
        syncedGoogleCalendars: {}
    };
};

export const emptyFacebookPayloadToken = (scope: string): FacebookProviderPayload => {
    return {
        accessToken: null,
        refreshToken: null,
        facebookCalendarId: undefined,
        syncedEvents: {}
    };
};
