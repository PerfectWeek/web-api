import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Connection } from "typeorm";
import { Event } from "./Event"
import { CalendarsToOwners } from "./CalendarsToOwners";
import { User } from "./User";


@Entity("calendars")
export class Calendar {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 256 })
    name: string;

    @OneToMany(type => Event, event => event.calendar)
    events: Event[];

    @Column({name: "nb_owners", default: 0})
    nbOwners: number;

    @Column({ name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    owners: CalendarsToOwners[];


    public constructor(name: string) {
        this.name = name;
        this.nbOwners = 0;
    }

    /**
     * @brief Check if the Calendar is valid
     *
     * @return true if the Calendar is valid
     * @return false otherwise
     */
    public isValid(): boolean {
        return this.name.length > 0;
    }

    /**
     * @brief Check if User owns the Calendar
     *
     * @param user  The User to look for
     *
     * @return true is the User owns this Calendar
     * @return false otherwise
     */
    public isCalendarOwner(user: User) {
        return this.owners.findIndex(cto => cto.owner_id === user.id) !== -1;
    }

    /**
     * @brief Create a new Calendar with owners
     *
     * @param conn      The database Connection
     * @param calendar
     * @param owners
     *
     * @return The created Calendar
     */
    public static async createCalendar(
        conn: Connection,
        calendar: Calendar,
        owners: User[]
    ): Promise<Calendar> {
        const calendarRepository = conn.getRepository(Calendar);
        const calendarsToOwnersRepository = conn.getRepository(CalendarsToOwners);

        const createdCalendar = await calendarRepository.save(calendar);

        const calendarsToOwners = owners.map(owner => new CalendarsToOwners(createdCalendar.id, owner.id));
        createdCalendar.owners = await calendarsToOwnersRepository.save(calendarsToOwners);
        createdCalendar.nbOwners = calendar.owners.length;

        return createdCalendar;
    }

    /**
     * @brief Get Calendar information
     *
     * @param conn
     * @param calendarId
     *
     * @returns The expected Calendar information on success
     * @returns null on error
     */
    static async findCalendarById(
        conn: Connection,
        calendarId: number
    ): Promise<Calendar> {
        return conn.getRepository(Calendar)
            .createQueryBuilder("calendars")
            .leftJoinAndSelect("calendars.events", "events")
            .where({ id: calendarId })
            .getOne();
    }

    /**
     * @brief Get Calendar with owners
     *
     * @param conn
     * @param calendarId
     *
     * @returns The expected Calendar on success
     * @returns null on error
     */
    static async getCalendarWithOwners(
        conn: Connection,
        calendarId: number
    ): Promise<Calendar> {
        let calendar = await this.findCalendarById(conn, calendarId);
        if (!calendar) {
            return null;
        }
        calendar.owners = await this.getCalendarOwners(conn, calendarId);
        return calendar;
    }

    /**
     * @brief Get Calendar owners
     *
     * @param conn
     * @param calendarId
     *
     * @returns The expected CalendarToOwners list on success
     * @returns null on error
     */
    static async getCalendarOwners(
        conn: Connection,
        calendarId: number
    ): Promise<CalendarsToOwners[]> {
        return conn.getRepository(CalendarsToOwners)
            .createQueryBuilder("cto")
            .innerJoinAndMapOne("cto.owner", "users", "user", "user.id = cto.owner_id")
            .where("cto.calendar_id = :calendar_id", { calendar_id: calendarId })
            .getMany();
    }

    /**
     * @brief Delete Calendar
     *
     * @param conn
     * @param calendarId
     *
     */
    static async deleteCalendar(
        conn: Connection,
        calendarId: number
    ): Promise<any> {
        await conn.getRepository(CalendarsToOwners)
            .createQueryBuilder()
            .delete()
            .where({ calendar_id: calendarId })
            .execute();

        await conn.getRepository(Calendar)
            .createQueryBuilder()
            .delete()
            .where({ id: calendarId })
            .execute();
    }
}
