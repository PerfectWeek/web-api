import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Connection } from "typeorm";
import { Event }                                                         from "./Event"
import { CalendarsToOwners }                                             from "./CalendarsToOwners";
import { EventsToAttendees }                                             from "./EventsToAttendees";
import { User }                                                          from "./User";
import { Group }                                                         from "./Group";

import { baseTimeslotPreferences, TimeslotPreferences }                  from "../../utils/baseTimeslotPreferences";
import { ApiException }                                                  from "../../utils/apiException";

@Entity("calendars")
export class Calendar {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 256 })
    name: string;

    @OneToMany(type => Event, event => event.calendar)
    events: Event[];

    @Column({ name: "nb_owners", default: 0 })
    nbOwners: number;

    @Column("simple-json")
    timeslotPreferences: TimeslotPreferences;

    @Column({ name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    owners: CalendarsToOwners[];


    public constructor(name: string) {
        this.name = name;
        this.nbOwners = 0;
        this.timeslotPreferences = baseTimeslotPreferences;
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
     * @brief Add event Timeslot in timeSlotPrefenreces
     * @param event The event to add the timeslot from
     */
    public addTimeslotPreference(event: Event): any {
        if (this.timeslotPreferences[event.type] === undefined) {
            throw new ApiException(400, "Event type invalid");
        }

        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        const iter = startTime;
        while (iter.getTime() <= endTime.getTime()) {
            this.timeslotPreferences[event.type][iter.getDay()][iter.getHours()] += 1;
            iter.setTime(iter.getTime() + 3600*1000);
        }

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
        const eventsIdsToDelete: number[] = (await conn.createQueryBuilder(Event, "event")
            .select(["event.id"])
            .innerJoin("event.calendar", "calendar")
            .where("calendar.id = :calendar_id", {calendar_id: calendarId})
            .execute())
            .map((e: any) => e.event_id);

        await conn.transaction(async entityManager => {
            // Delete Group related to Calendar
            await entityManager.getRepository(Group)
                .createQueryBuilder()
                .delete()
                .where("calendar_id = :calendar_id", {calendar_id: calendarId})
                .execute();

            // Delete Events related to Calendar
            if (eventsIdsToDelete.length !== 0) {
                await entityManager.getRepository(EventsToAttendees)
                    .createQueryBuilder()
                    .delete()
                    .where("event_id IN (:...event_ids)", {event_ids: eventsIdsToDelete})
                    .execute();

                await entityManager.getRepository(Event)
                    .createQueryBuilder()
                    .delete()
                    .where("id IN (:...event_ids)", {event_ids: eventsIdsToDelete})
                    .execute();
            }

            // Remove Calendar
            await entityManager.getRepository(CalendarsToOwners)
                .createQueryBuilder()
                .delete()
                .where("calendar_id = :calendar_id", {calendar_id: calendarId})
                .execute();

            await entityManager.getRepository(Calendar)
                .createQueryBuilder()
                .delete()
                .where("id = :calendar_id", {calendar_id: calendarId})
                .execute();
        });
    }

    /**
     * @brief Add Users to Calendar
     *
     * @param conn
     * @param calendarId
     * @param users
     */
    static async addUsers(
        conn: Connection,
        calendarId: number,
        users: User[]
    ): Promise<any> {
        await conn.transaction(async entityManager => {
            // Recover User <=> Calendar Relationship Repository
            const calendarsToOwnersRepository = entityManager.getRepository(CalendarsToOwners);

            for (const user of users) {

                // Create and save new relationship
                const newCalendarToOwner = new CalendarsToOwners(calendarId, user.id);
                await calendarsToOwnersRepository.save(newCalendarToOwner);

            }

        });
    }

    /**
     * @brief Remove User from Calendar
     *
     * @param conn
     * @param calendarId
     * @param user
     */
    static async removeUser(
        conn: Connection,
        calendarId: number,
        user: User
    ): Promise<any> {
        // Recover repository
        const calendarsToOwnerRepository = conn.getRepository(CalendarsToOwners);

        // Remove relation
        await calendarsToOwnerRepository
            .createQueryBuilder()
            .delete()
            .where("calendar_id = :calendar_id", {calendar_id: calendarId})
            .andWhere("owner_id = :owner_id", {owner_id: user.id})
            .execute();

        const calendar: Calendar = await Calendar.findCalendarById(conn, calendarId);
        if (calendar.nbOwners == 0) {
            // Try to fetch group linked to calendar if it exists
            const group: Group = await Group.findByCalendarId(conn, calendarId);
            if (group) {
                // Delete group linked to empty calendar
                await Group.deleteById(conn, group.id);
            }

            // Delete empty calendar
            await conn.getRepository(Calendar)
                .createQueryBuilder()
                .delete()
                .where("id = :calendar_id", {calendar_id: calendarId})
                .execute();
        }

    }
}
