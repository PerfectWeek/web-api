import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Connection } from "typeorm";

import { Calendar }          from "./Calendar";
import { EventsToAttendees } from "./EventsToAttendees";
import { EventVisibility } from "../../utils/types/EventVisibility";

@Entity("events")
export class Event {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 256 })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false, default: EventVisibility.PRIVATE })
    visibility: EventVisibility;

    @ManyToOne(type => Calendar, calendar => calendar.events)
    @JoinColumn({ name: "calendar_id" })
    calendar: Calendar;

    @Column({ name: "start_time", type: "timestamp with time zone" })
    startTime: Date;

    @Column({ name: "end_time", type: "timestamp with time zone" })
    endTime: Date;

    @Column({ name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    attendees: EventsToAttendees[];

    @Column("bytea", {nullable: true})
    image?: Buffer;


    public constructor(
        name: string,
        description: string,
        location: string,
        type: string,
        visibility: EventVisibility,
        calendar: Calendar,
        startTime: Date,
        endTime: Date,
        image?: Buffer
    ) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.type = type;
        this.visibility = visibility;
        this.calendar = calendar;
        this.startTime = startTime;
        this.endTime = endTime;
        this.attendees = [];
        this.image = image;
    }

    /**
     * @brief Fetch all public events between two dates
     *
     * @param conn
     * @param min_date
     * @param max_date
     *
     */
    public static fetchAllPublicEvents(
        conn: Connection,
        min_date: Date,
        max_date: Date
    ): Promise<Event[]> {
        return conn.getRepository(Event)
            .createQueryBuilder("event")
            .innerJoinAndSelect("event.calendar", "calendar")
            .where(`event.visibility = 'public'`)
            .andWhere(`event.start_time >= :min_date`, { min_date})
            .andWhere(`event.end_time <= :max_date`, { max_date})
            .getMany();
    }

    /**
     * @brief Get an Event instance by its ID
     *
     * @param conn
     * @param event_id
     */
    public static getEventById(
        conn: Connection,
        event_id: number
    ): Promise<Event> {
        return conn.getRepository(Event)
            .createQueryBuilder("event")
            .innerJoinAndSelect("event.calendar", "calendar")
            .where("event.id = :event_id", { event_id })
            .getOne();
    }

    /**
     * @brief Get an Event instance by its ID along with all User attending it
     *
     * @param conn
     * @param eventId
     */
    public static async getEventWithAttendeesById(
        conn: Connection,
        eventId: number
    ): Promise<Event> {
        const event = await this.getEventById(conn, eventId);
        if (!event) {
            return null;
        }

        event.attendees = await EventsToAttendees.getRelationsForEventId(conn, eventId);

        return event;
    }

    /**
     * @brief Remove specified event from calendar
     *
     * @param conn
     * @param eventId
     */
    public static async deleteById(
        conn: Connection,
        eventId: number
    ): Promise<any> {
        await conn.transaction(async entityManager => {
            await entityManager.getRepository(EventsToAttendees)
                .createQueryBuilder()
                .delete()
                .where("event_id = :event_id", {event_id: eventId})
                .execute();

            await entityManager.getRepository(Event)
                .createQueryBuilder("event")
                .delete()
                .where("id = :id", {id: eventId})
                .execute();
        });
    }

    public isValid() {
        return this.name.length > 0
            && this.calendar
            && this.startTime <= this.endTime;
    }
}
