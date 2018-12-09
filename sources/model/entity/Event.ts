import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Connection, DeleteResult } from "typeorm";

import { Calendar }          from "./Calendar";
import { EventsToAttendees } from "./EventsToAttendees";

@Entity("events")
export class Event {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 256})
    name: string;

    @Column()
    description: string;

    @Column()
    location: string;

    @ManyToOne(type => Calendar, calendar => calendar.events)
    @JoinColumn({name: "calendar_id"})
    calendar: Calendar;

    @Column({name: "start_time", type: "timestamp with time zone"})
    startTime: Date;

    @Column({name: "end_time", type: "timestamp with time zone"})
    endTime: Date;

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    attendees: EventsToAttendees[];


    public constructor(name: string, description: string, location: string,
                       calendar: Calendar, startTime: Date, endTime: Date) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.calendar = calendar;
        this.startTime = startTime;
        this.endTime = endTime;
        this.attendees = [];
    }

    public isValid() {
        return this.name.length > 0
            && this.calendar
            && this.startTime <= this.endTime;
    }

    /**
     * @brief Get an Event Instance by its ID
     *
     * @param conn
     * @param event_id
     */
    public static getEventById(
        conn: Connection,
        event_id: number
    ): Promise<Event> {
        return conn.getRepository(Event)
            .createQueryBuilder("event")
            .innerJoinAndSelect("event.calendar", "calendar")
            .where("event.id = :event_id", {event_id})
            .getOne();
    }

    /**
     * @brief Remove specified event from calendar
     *
     * @param conn
     * @param event_id
     */
    public static deleteById(
        conn: Connection,
        event_id: number
    ): Promise<DeleteResult> {
        return conn.getRepository(Event)
            .createQueryBuilder()
            .delete()
            .where("id = :event_id", {event_id})
            .execute();
    }
}
