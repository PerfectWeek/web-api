import { EventsToAttendees } from "../../model/entity/EventsToAttendees";


export class EventsToAttendeesView {

    static formatPendingInvite(eta: EventsToAttendees): any {
        return {
            name: eta.event.name,
            id: eta.event.id,
            status: eta.status
        };
    }
}
