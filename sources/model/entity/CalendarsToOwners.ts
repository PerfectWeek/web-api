import {Entity, PrimaryColumn, ManyToOne, JoinColumn, Index, Connection} from "typeorm";

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

    /**
     * @brief Find a relation between a Calendar and a User
     *
     * @param conn          The database Connection
     * @param calendarId
     * @param ownerId
     */
    public static async findCalendarRelation(
        conn: Connection,
        calendarId: number,
        ownerId: number
    ): Promise<CalendarsToOwners> {
        return conn.getRepository(CalendarsToOwners)
            .createQueryBuilder("cto")
            .select()
            .where("cto.calendar_id = :calendar_id", {calendar_id: calendarId})
            .andWhere("cto.owner_id = :owner_id", {owner_id: ownerId})
            .getOne();
    }

    /**
     * @brief Find  relation between a Group and a User
     *
     * @param conn      The database Connection
     * @param groupId
     * @param userId
     */
    public static async findGroupRelation(
        conn: Connection,
        groupId: number,
        userId: number
    ): Promise<CalendarsToOwners> {
        return conn.getRepository(CalendarsToOwners)
            .createQueryBuilder("cto")
            .innerJoin("calendars", "calendar", "cto.calendar_id = calendar.id")
            .innerJoin("groups", "group", "calendar.id = group.calendar_id")
            .where("cto.owner_id = :owner_id", {owner_id: userId})
            .andWhere("group.id = :group_id", {group_id: groupId})
            .getOne();
    }
}
