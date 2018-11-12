//
// Created by benard-g on 2018/09/03
//

import {Column, Entity, Index, PrimaryGeneratedColumn, Repository} from "typeorm";
import {Encrypt} from "../../utils/encrypt";
import {ApiException} from "../../utils/apiException";
import {UserValidator} from "../../utils/validator/UserValidator";
import {Group} from "./Group";
import {GroupsToUsers} from "./GroupsToUsers";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 31})
    @Index({unique: true})
    pseudo: string;

    @Column()
    @Index({unique: true})
    email: string;

    @Column({name: "ciphered_password"})
    cipheredPassword: string;

    groups: Group[] = [];

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;


    public constructor(pseudo: string, email: string, ciphered_password: string) {
        this.pseudo = pseudo;
        this.email = email;
        this.cipheredPassword = ciphered_password;
    }

    //
    // Check if a User satisfies the basic rules (pseudo format, email format, ...)
    //
    public isValid() : boolean {
        return UserValidator.pseudo_regex.test(this.pseudo)
            && UserValidator.email_regex.test(this.email);
    }

    //
    // Check if the given password is valid for this User
    //
    public async checkPassword(password: string): Promise<boolean> {
        return await Encrypt.matchPassword(password, this.cipheredPassword);
    }

    //
    // Cipher the given password
    //
    public static async cipherPassword(password: string) : Promise<string> {
        if (password.length < 8)
            throw new ApiException(403, "Password must be at least 8 characters long");
        return Encrypt.hashPassword(password);
    }


    //
    // Delete a User
    //
    static async deleteUser(
        userRepository: Repository<User>,
        groupsToUsersRepository: Repository<GroupsToUsers>,
        user_id: number
    ) : Promise<any> {
        await groupsToUsersRepository
            .createQueryBuilder()
            .delete()
            .where("user_id = :user_id", {user_id: user_id})
            .execute();

        await userRepository
            .createQueryBuilder()
            .delete()
            .where("id = :user_id", {user_id: user_id})
            .execute();
    }

    //
    // Get all groups of a User
    //
    static async getAllGroups(
        groupsRepository: Repository<Group>,
        userId: number
    ) : Promise<Group[]> {
        return await groupsRepository
            .createQueryBuilder()
            .innerJoinAndSelect(GroupsToUsers, "gtu", `gtu.group_id = "Group"."id"`)
            .where({user_id: userId})
            .getMany();
    }
}
