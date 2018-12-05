import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Connection } from "typeorm";
import { Event } from "./Event"
import { CalendarsToOwners } from "./CalendarsToOwners";
import { User } from "./User";

@Entity("calendars")
export class Calendar {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 256 })
    name: string

    @OneToMany(type => Event, event => event.calendar)
    events: Event[]

    @Column({ name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    owners: CalendarsToOwners[];


    public constructor(name: string, events: Event[], owners: CalendarsToOwners[]) {
        this.name = name;
        this.events = events;
        this.owners = owners;
    }

    /**
     * @brief Check if Calendar is valid
     */
    public isValid(): boolean {
        return this.name.length > 0;
    }


    /**
     * @brief Check if User owns the Calendar
     *
     * @param calendar
     * @param user
     */
    public isCalendarOwner(user: User) {
        for (let cto of this.owners) {
            if (cto.owner_id === user.id) {
                return true;
            }
        }
        return false;
    }

    /**
     * @brief Get Calendar information
     *
     * @param connection
     * @param calendarId
     *
     * @returns The expected Calendar information on success
     * @returns null on error
     */
    static async findCalendarById(
        connection: Connection,
        calendarId: number
    ): Promise<Calendar> {
        return connection.getRepository(Calendar)
            .createQueryBuilder("calendars")
            .leftJoinAndSelect("calendars.events", "events")
            .where({ id: calendarId })
            .getOne();
    }

    /**
     * @brief Get Calendar with owners
     *
     * @param connection
     * @param calendarId
     *
     * @returns The expected Calendar on success
     * @returns null on error
     */
    static async getCalendarWithOwners(
        connection: Connection,
        calendarId: number
    ): Promise<Calendar> {
        let calendar = await this.findCalendarById(connection, calendarId);
        if (!calendar) {
            return null;
        }
        calendar.owners = await this.getCalendarOwners(connection, calendarId);
        return calendar;
    }

    /**
     * @brief Get Calendar owners
     *
     * @param connection
     * @param calendarId
     *
     * @returns The expected CalendarToOwners list on success
     * @returns null on error
     */
    static async getCalendarOwners(
        connection: Connection,
        calendarId: number
    ): Promise<CalendarsToOwners[]> {
        return connection.getRepository(CalendarsToOwners)
            .createQueryBuilder("cto")
            .innerJoinAndMapOne("cto.owner", "users", "user", "user.id = cto.owner_id")
            .where("cto.calendar_id = :calendar_id", { calendar_id: calendarId })
            .getMany();
    }

    /**
     * @brief Delete Calendar
     *
     * @param connection
     * @param calendarId
     *
     */
    static async deleteCalendar(
        connection: Connection,
        calendarId: number
    ): Promise<any> {
        await connection.getRepository(CalendarsToOwners)
            .createQueryBuilder()
            .delete()
            .where({ calendar_id: calendarId })
            .execute();

        await connection.getRepository(Calendar)
            .createQueryBuilder()
            .delete()
            .where({ id: calendarId })
            .execute();
    }
}
