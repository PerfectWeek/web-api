import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Event } from "./Event"
import { CalendarsToOwners } from "./CalendarsToOwners";

@Entity("calendars")
export class Calendar {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 256})
    name: string

    @OneToMany(type => Event, event => event.calendar)
    events: Event[]

    owners: CalendarsToOwners[];

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    public constructor(name: string, events: Event[], owners: CalendarsToOwners[]) {
        this.name = name;
        this.events = events;
        this.owners = owners;
    }
}
