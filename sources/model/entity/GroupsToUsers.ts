//
// Created by benard-g on 2018/11/11
//

import {Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import {User} from "./User";
import {Group} from "./Group";


@Entity("groups_to_users")
export class GroupsToUsers {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    @JoinColumn({name: "user_id"})
    user: User;

    @ManyToOne(type => Group)
    @JoinColumn({name: "group_id"})
    group: Group;


    public constructor(group: Group, user: User) {
        this.group = group;
        this.user = user;
    }
}
