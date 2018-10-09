//
// Created by benard-g on 2018//07
//

import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    Repository
} from "typeorm";
import {User} from "./User";

@Entity("groups")
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => User)
    @JoinColumn()
    owner: User;

    @ManyToMany(type => User)
    @JoinTable()
    members: User[];

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
    // Get one Group by Id
    //
    static async getGroupInfo(groupRepository: Repository<Group>, groupId: number) : Promise<Group> {
        return await groupRepository
            .createQueryBuilder("groups")
            .leftJoinAndSelect("groups.owner", "owner")
            .leftJoinAndSelect("groups.members", "members")
            .where({id: groupId})
            .getOne();
    }
}
