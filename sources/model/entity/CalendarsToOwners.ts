import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index, Connection } from "typeorm";
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

    static async isCalendarOwner(
        conn: Connection,
        userId: number,
        calendarId: number
    ): Promise<boolean> {
        const cto = await conn.getRepository(CalendarsToOwners)
            .createQueryBuilder()
            .where("owner_id = :userId", {userId: userId})
            .andWhere("calendar_id = :calendarId", {calendarId: calendarId})
            .getCount();
        return cto > 0;
    }
}
