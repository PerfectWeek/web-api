import {Column, Entity, PrimaryGeneratedColumn, Repository} from "typeorm";

import {GroupsToUsers, Role} from "./GroupsToUsers";
import {User} from "./User";


@Entity("groups")
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({name: "nb_members"})
    nbMembers: number;

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    members: GroupsToUsers[] = [];


    public constructor(name: string) {
        this.name = name;
        this.nbMembers = 0;
        this.members = [];
    }

    /**
     * @brief Check if a Group is valid and can be created
     */
    public isValid() : boolean {
        return this.name.length > 0;
    }

    /**
     * @brief Save a new Group in the database
     *
     * @param groupRepository           The Repository used to access Group resources
     * @param groupToUserRepository     The Repository used to access GroupToUser resources
     * @param group                     The Group to save
     * @param members                   The members to add in the Group
     *
     * @return The created Group
     */
    static async createGroup(
        groupRepository: Repository<Group>,
        groupToUserRepository: Repository<GroupsToUsers>,
        group: Group,
        members: User[]
    ): Promise<Group> {
        const createdGroup = await groupRepository.save(group);

        group.members = members.map(user => new GroupsToUsers(createdGroup.id, user.id, Role.Admin));
        await groupToUserRepository.save(group.members);

        group.nbMembers = group.members.length;
        return group;
    }

    /**
     * @brief Get a Group (member list is not filled)
     *
     * @param groupRepository
     * @param groupId
     *
     * @return The requested Group information on success
     * @return null on error
     */
    static async getGroupInfo(
        groupRepository: Repository<Group>,
        groupId: number
    ) : Promise<Group> {
        let group = await groupRepository
            .createQueryBuilder("groups")
            .where({group_id: groupId})
            .getOne();
        if (!group) {
            return null;
        }

        group.members = [];
        return group;
    }

    /**
     * @brief Delete a Group
     *
     * @param groupRepository           The Repository used to access Group resources
     * @param groupToUserRepository     The Repository used to access GroupToUser resources
     * @param groupId                   The id of the Group
     */
    static async deleteGroup(
        groupRepository: Repository<Group>,
        groupToUserRepository: Repository<GroupsToUsers>,
        groupId: number
    ) : Promise<any> {
        await groupToUserRepository
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
