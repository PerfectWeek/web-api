//
// Created by benard-g on 2018//07
//

import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("groups")
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;
}
