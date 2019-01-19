import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index, Connection } from "typeorm";

import { User }                                                            from "./User";
import { Event }                                                           from "./Event"

@Entity("events_to_attendees")
export class EventsToAttendees {
    @PrimaryColumn()
    @ManyToOne(type => Event)
    @JoinColumn({name: "event_id"})
    event_id: number;

    @PrimaryColumn()
    @ManyToOne(type => User)
    @JoinColumn({name: "attendee_id"})
    @Index()
    attendee_id: number;

    event: Event;

    attendee: User;

    public constructor(event_id: number, attendee_id: number) {
        this.event_id = event_id;
        this.attendee_id = attendee_id;
        this.event = undefined;
        this.attendee = undefined;
    }


    /**
     * @brief Get all relations for a given Event
     *
     * @param conn
     * @param eventId
     */
    public static async getRelationsForEventId(
        conn: Connection,
        eventId: number
    ): Promise<EventsToAttendees[]> {
        return conn.getRepository(EventsToAttendees)
            .createQueryBuilder("eta")
            .select()
            .innerJoinAndMapOne("eta.event", Event, "event", "event.id = eta.event_id")
            .innerJoinAndMapOne("eta.attendee", User, "user", "user.id = eta.attendee_id")
            .where("event.id = :event_id", {event_id: eventId})
            .getMany();
    }
}
