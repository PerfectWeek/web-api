import { Entity, PrimaryGeneratedColumn, OneToMany, Column, ManyToOne, Repository } from "typeorm";
import { Calendar } from "./Calendar";
import { EventsToAttendees } from "./EventsToAttendees";

@Entity("events")
export class Event {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 256})
    name: string

    @Column()
    description: string

    @Column()
    location: string

    @ManyToOne(type => Calendar, calendar => calendar.events)
    calendar: Calendar
    
    @Column({name: "start_time", type: "timestamp with time zone"})
    startTime: Date

    @Column({name: "end_time", type: "timestamp with time zone"})
    endTime: Date

    attendees: EventsToAttendees[]

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

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
}
