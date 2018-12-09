import {Column, Connection, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";

import {Calendar} from "./Calendar";


@Entity("groups")
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Calendar)
    @JoinColumn({name: "calendar_id"})
    calendar: Calendar;

    @Column()
    description: string;

    public constructor(description: string, calendar: Calendar) {
        this.description = description;
        this.calendar = calendar;
    }

    /**
     * @brief Get Group by id
     *
     * @param conn      The database Connection
     * @param groupId
     *
     * @return The expected Group on success
     * @return null otherwise
     */
    public static async findById(
        conn: Connection,
        groupId: number
    ): Promise<Group> {
        return conn.getRepository(Group)
            .createQueryBuilder("group")
            .innerJoinAndSelect("group.calendar", "calendar")
            .where({id: groupId})
            .getOne();
    }

    /**
     * @brief Get Group by Calendar ID
     *
     * @param conn
     * @param calendarId
     */
    public static async findByCalendarId(
        conn: Connection,
        calendarId: number
    ): Promise<Group> {
        return conn.getRepository(Group)
            .createQueryBuilder("group")
            .innerJoinAndSelect("group.calendar", "calendar")
            .where("calendar_id = :calendar_id", {calendar_id: calendarId})
            .getOne();
    }

    /**
     * @brief Delete a Group
     *
     * @param conn      The database Connection
     * @param groupId   The Group to delete
     */
    public static async deleteById(
        conn: Connection,
        groupId: number
    ): Promise<any> {
        return conn.getRepository(Group)
            .createQueryBuilder()
            .delete()
            .where({id: groupId})
            .execute();
    }
}
