//
// Created by benard-g on 2018//07
//

import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";
import {GroupsToUsers} from "./GroupsToUsers";

@Entity("groups")
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => User)
    @JoinColumn()
    owner: User;

    members: User[] = [];

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    public constructor(name: string, owner: User, members: User[]) {
        this.name = name;
        this.owner = owner;
        this.members = members;
    }

    //
    // Check if a Group satisfies the basic rules (name, ...)
    //
    public isValid() : boolean {
        return this.name.length > 0;
    }

    //
    // Create Group
    //
    static async createGroup(
        groupRepository: Repository<Group>,
        groupToUsersRepository: Repository<GroupsToUsers>,
        group: Group
    ): Promise<Group> {
        await groupRepository.save(group);
        const relations = group.members.map(user => new GroupsToUsers(group.id, user.id));
        await groupToUsersRepository.save(relations);
        return group;
    }

    //
    // Get one Group by Id
    //
    static async getGroupInfo(
        groupRepository: Repository<Group>,
        userRepository: Repository<User>,
        groupId: number
    ) : Promise<Group> {
        let group = await groupRepository
            .createQueryBuilder("groups")
            .leftJoinAndSelect("groups.owner", "owner")
            .where({group_id: groupId})
            .getOne();

        if (group) {
            group.members = await this.getGroupMembers(userRepository, groupId);
        }

        return group;
    }

    //
    // Get Group members
    //
    static async getGroupMembers(
        userRepository: Repository<User>,
        groupId: number
    ) : Promise<User[]> {
        return await userRepository
            .createQueryBuilder()
            .innerJoinAndSelect(GroupsToUsers, "gtu", `gtu.user_id = "User"."id"`)
            .where("gtu.group_id = :group_id", {group_id: groupId})
            .getMany();
    }

    static async deleteGroup(
        groupRepository: Repository<Group>,
        groupToUsersRepository: Repository<GroupsToUsers>,
        groupId: number
    ) : Promise<any> {
        await groupToUsersRepository
            .createQueryBuilder()
            .delete()
            .where("group_id = :group_id", {group_id: groupId})
            .execute();

        await groupRepository
            .createQueryBuilder()
            .delete()
            .where("id = :group_id", {group_id: groupId})
            .execute();
    }
}
