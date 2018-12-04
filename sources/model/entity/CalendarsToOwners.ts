import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { Calendar } from "./Calendar";
import { User } from "./User";

@Entity("calendars_to_owners")
export class CalendarsToOwners {
    @PrimaryColumn()
    @ManyToOne(type => Calendar)
    @JoinColumn({name: "calendar_id"})
    calendar_id: number;

    @PrimaryColumn()
    @ManyToOne(type => User)
    @JoinColumn({name: "owner_id"})
    @Index()
    owner_id: number;

    calendar: Calendar;

    owner: User;
    
    public constructor(calendar_id: number, owner_id: number) {
        this.calendar_id = calendar_id;
        this.owner_id = owner_id;
        this.calendar = undefined;
        this.owner = undefined;
    }
}
