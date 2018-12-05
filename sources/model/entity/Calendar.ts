import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Repository } from "typeorm";
import { Event } from "./Event"
import { CalendarsToOwners } from "./CalendarsToOwners";

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
     * @brief Get Calendar information
     *
     * @param calendarRepository
     * @param calendarId
     *
     * @returns The expected Calendar information on success
     * @returns null on error
     */
    static async getCalendar(
        calendarRepository: Repository<Calendar>,
        calendarId: number
    ): Promise<Calendar> {
        return calendarRepository
            .createQueryBuilder("calendars")
            .leftJoinAndSelect("calendars.events", "events")
            .where({ id: calendarId })
            .getOne();
    }

    /**
     * @brief Get Calendar with owners
     *
     * @param calendarRepository
     * @param calendarsToOwnersRepository
     * @param calendarId
     *
     * @returns The expected Calendar on success
     * @returns null on error
     */
    static async getCalendarWithOwners(
        calendarRepository: Repository<Calendar>,
        calendarsToOwnersRepository: Repository<CalendarsToOwners>,
        calendarId: number
    ): Promise<Calendar> {
        let calendar = await this.getCalendar(calendarRepository, calendarId);
        if (!calendar) {
            return null;
        }
        calendar.owners = await this.getCalendarOwners(calendarsToOwnersRepository, calendarId);
        return calendar;
    }

    /**
     * @brief Get Calendar owners
     *
     * @param calendarsToOwnersRepository
     * @param calendarId
     *
     * @returns The expected CalendarToOwners list on success
     * @returns null on error
     */
    static async getCalendarOwners(
        calendarsToOwnersRepository: Repository<CalendarsToOwners>,
        calendarId: number
    ): Promise<CalendarsToOwners[]> {
        return calendarsToOwnersRepository
            .createQueryBuilder("cto")
            .innerJoinAndMapOne("cto.owner", "users", "user", "user.id = cto.owner_id")
            .where("cto.calendar_id = :calendar_id", { calendar_id: calendarId })
            .getMany();
    }

    /**
     * @brief Delete Calendar
     *
     * @param calendarRepository
     * @param calendarsToOwnersRepository
     * @param calendarId
     *
     */
    static async deleteCalendar(
        calendarRepository: Repository<Calendar>,
        calendarsToOwnersRepository: Repository<CalendarsToOwners>,
        calendarId: number
    ): Promise<any> {
        console.log("ANUS");
        await calendarsToOwnersRepository
            .createQueryBuilder()
            .delete()
            .where({ calendar_id: calendarId })
            .execute();

        await calendarRepository
            .createQueryBuilder()
            .delete()
            .where({ id: calendarId })
            .execute();
    }
}
