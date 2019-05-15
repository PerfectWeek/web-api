import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index, Connection, Column } from "typeorm";

import { User } from "./User";
import { Event } from "./Event"

import { EventStatus } from "../../utils/types/EventStatus";

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

    @Column({ default: EventStatus.Going })
    status: EventStatus;

    event: Event;

    attendee: User;

    public constructor(event_id: number, attendee_id: number, status: EventStatus) {
        this.event_id = event_id;
        this.attendee_id = attendee_id;
        this.status = status;
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
            .innerJoinAndMapOne("eta.event", Event, "event", "event.id = eta.event_id")
            .innerJoinAndMapOne("eta.attendee", User, "user", "user.id = eta.attendee_id")
            .where("event.id = :event_id", {event_id: eventId})
            .getMany();
    }

    /**
     * @brief Get relation
     *
     * @param conn
     * @param eventId
     * @param userId
     */
    public static async getRelation(
        conn: Connection,
        eventId: number,
        userId: number
    ): Promise<EventsToAttendees> {
        return conn.getRepository(EventsToAttendees)
            .createQueryBuilder("eta")
            .where("eta.event_id = :event_id", { event_id: eventId })
            .andWhere("eta.attendee_id = :user_id", { user_id: userId })
            .getOne();
    }
}
