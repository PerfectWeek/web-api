import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { User } from "./User";
import { Event } from "./Event"

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
    }
}
