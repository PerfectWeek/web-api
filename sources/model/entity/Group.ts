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

    /**
     * @brief Check if a Group is valid and can be created
     */
    public isValid() : boolean {
        return this.name.length > 0
            && this.members.length >= 1;
    }

    /**
     * @brief Save a new Group in the database
     *
     * @param groupRepository           The Repository used to access Group resources
     * @param groupToUserRepository     The Repository used to access GroupToUser resources
     * @param group                     The Group to save
     *
     * @return The created Group
     */
    static async createGroup(
        groupRepository: Repository<Group>,
        groupToUserRepository: Repository<GroupsToUsers>,
        group: Group
    ): Promise<Group> {
        const createdGroup = await groupRepository.save(group);

        const relations = group.members.map(user => new GroupsToUsers(createdGroup.id, user.id));
        await groupToUserRepository.save(relations);

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
            .leftJoinAndSelect("groups.owner", "owner")
            .where({group_id: groupId})
            .getOne();
        if (!group) {
            return null;
        }

        group.members = [];
        return group;
    }

    /**
     * @brief Get both a Group and its members
     *
     * @param groupRepository   The Repository used to access Group resources
     * @param userRepository    The Repository used to access User resources
     * @param groupId           The id of the Group
     *
     * @return The requested Groups with all its members in the member list on success
     * @return null on error
     */
    static async getGroupAndMembers(
        groupRepository: Repository<Group>,
        userRepository: Repository<User>,
        groupId: number
    ) : Promise<Group> {
        let group = await this.getGroupInfo(groupRepository, groupId);
        if (!group) {
            return null;
        }

        group.members = await this.getGroupMembers(userRepository, groupId);
        return group;
    }

    /**
     * @brief Get the Users of a Group
     *
     * @param userRepository    The Repository used to access User resources
     * @param groupId           The id of the Group
     *
     * @return The list of Users of the requested Group on success
     * @return null on error
     */
    static async getGroupMembers(
        userRepository: Repository<User>,
        groupId: number
    ) : Promise<User[]> {
        return userRepository
            .createQueryBuilder()
            .innerJoinAndSelect(GroupsToUsers, "gtu", `gtu.user_id = "User"."id"`)
            .where("gtu.group_id = :group_id", {group_id: groupId})
            .getMany();
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
