import {Entity, PrimaryColumn, ManyToOne, JoinColumn, Index, Connection, Column} from "typeorm";

import { Calendar } from "./Calendar";
import { User } from "./User";
import { CalendarRole } from "../../utils/types/CalendarRole";


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

    @Column({default: CalendarRole.Admin})
    role: CalendarRole;

    @Column({default: true})
    confirmed: boolean;

    calendar: Calendar;

    owner: User;

    public constructor(
        calendar_id: number,
        owner_id: number,
        role: CalendarRole,
        confirmed: boolean
    ) {
        this.calendar_id = calendar_id;
        this.owner_id = owner_id;
        this.role = role;
        this.confirmed = confirmed;
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
            .where("cto.calendar_id = :calendar_id", {calendar_id: calendarId})
            .andWhere("cto.owner_id = :owner_id", {owner_id: ownerId})
            .getOne();
    }

    /**
     * @brief Find if one of users in set is already present in the Calendar
     *
     * @param conn          The database Connection
     * @param calendarId
     * @param owners
     */
    public static async findUsersPresence(
        conn: Connection,
        calendarId: number,
        owners: User[]
    ): Promise<CalendarsToOwners[]> {
        return conn.getRepository(CalendarsToOwners)
            .createQueryBuilder("cto")
            .where("cto.calendar_id = :calendar_id", {calendar_id: calendarId})
            .andWhere("cto.owner_id IN (:...owners)", {owners: owners.map((u: User) => u.id)})
            .getMany();
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


    public static async fetchPendingRequestsForUserId(
        conn: Connection,
        userId: number
    ): Promise<CalendarsToOwners[]> {
        return conn
            .createQueryBuilder(CalendarsToOwners, "cto")
            .innerJoinAndMapOne("cto.calendar", "calendars", "calendar", "cto.calendar_id = calendar.id")
            .where("cto.owner_id = :owner_id", { owner_id: userId })
            .andWhere("cto.confirmed = false")
            .getMany()
    }

    public static async acceptInvite(
        conn: Connection,
        calendarId: number,
        userId: number
    ): Promise<any> {
        return conn
            .createQueryBuilder()
            .update(CalendarsToOwners)
            .set({confirmed: true})
            .where("owner_id = :owner_id", {owner_id: userId})
            .andWhere("calendar_id = :calendar_id", {calendar_id: calendarId})
            .execute();
    }
}


//
// Utils
//
export const createCalendarOwner = (user: User): { user: User, role: CalendarRole } => {
    return { user: user, role: CalendarRole.Admin };
}
