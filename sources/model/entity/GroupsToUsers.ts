import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Repository} from "typeorm";

import {User} from "./User";
import {Group} from "./Group";


export enum Role {
    Admin = "Admin",
    Spectator = "Spectator"
}

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

    @Column({enum: Role})
    role: Role;


    public constructor(group_id: number, user_id: number, role: Role) {
        this.group_id = group_id;
        this.user_id = user_id;
        this.role = role;
    }

    static async getRelation(
        groupToUserRepository: Repository<GroupsToUsers>,
        groupId: number,
        userId: number
    ): Promise<GroupsToUsers> {
        return groupToUserRepository
            .createQueryBuilder()
            .select()
            .where("group_id = :group_id", {group_id: groupId})
            .andWhere("user_id = :user_id", {user_id: userId})
            .getOne();
    }
}
