//
// Created by benard-g on 2018/11/11
//

import {Entity, Index, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";

import {User} from "./User";
import {Group} from "./Group";


@Entity("groups_to_users")
export class GroupsToUsers {
    @PrimaryColumn()
    @ManyToOne(type => Group)
    @JoinColumn({name: "group_id"})
    group_id: number;

    @PrimaryColumn()
    @ManyToOne(type => User)
    @JoinColumn({name: "user_id"})
    @Index()
    user_id: number;


    public constructor(group_id: number, user_id: number) {
        this.group_id = group_id;
        this.user_id = user_id;
    }
}
