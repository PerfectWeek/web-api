import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";

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
}
