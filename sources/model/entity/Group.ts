//
// Created by benard-g on 2018//07
//

import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity("groups")
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => User)
    @JoinColumn({name: "owner_id"})
    ownerId: number;

    @ManyToMany(type => User)
    @JoinTable()
    members: User[];

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;


    public constructor(name: string, ownerId: number, members: User[]) {
        this.name = name;
        this.ownerId = ownerId;
        this.members = members;
    }
}
