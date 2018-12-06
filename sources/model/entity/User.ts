import {Column, Entity, Index, PrimaryGeneratedColumn, Repository, Connection} from "typeorm";

import {Encrypt} from "../../utils/encrypt";
import {ApiException} from "../../utils/apiException";
import {UserValidator} from "../../utils/validator/UserValidator";
import {Group} from "./Group";
import {GroupsToUsers} from "./GroupsToUsers";
import { CalendarsToOwners } from "./CalendarsToOwners";


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

     /**
     * @brief Check if a User satisfies the basic rules (pseudo format, email format, ...)
     */
    public isValid() : boolean {
        return UserValidator.pseudo_regex.test(this.pseudo)
            && UserValidator.email_regex.test(this.email);
    }

    /**
     * @brief Check if the given password is valid for this User
     */
    public async checkPassword(password: string): Promise<boolean> {
        return await Encrypt.matchPassword(password, this.cipheredPassword);
    }

    /**
     * @brief cipher the given password
     */
    public static async cipherPassword(password: string) : Promise<string> {
        if (password.length < 8)
            throw new ApiException(403, "Password must be at least 8 characters long");
        return Encrypt.hashPassword(password);
    }


    /**
     * @brief Delete a User
     *
     * @param conn
     * @param user_id
     */
    static async deleteUser(
        conn: Connection,
        user_id: number
    ) : Promise<any> {
        // TODO: Remove user from its groups and delete those becoming empty
        await conn.getRepository(GroupsToUsers)
            .createQueryBuilder()
            .delete()
            .where("user_id = :user_id", {user_id: user_id})
            .execute();

        await conn.getRepository(CalendarsToOwners)
            .createQueryBuilder()
            .delete()
            .where("owner_id = :user_id", {user_id: user_id})
            .execute();

        await conn.getRepository(User)
            .createQueryBuilder()
            .delete()
            .where("id = :user_id", {user_id: user_id})
            .execute();
    }

    /**
     * @brief Get all calendars a User owns
     *
     * @param connection
     * @param userId
     *
     * @returns The expected calendar list on success
     * @returns null on error
     */
    static async getAllCalendars(
        conn: Connection,
        userId: number
    ) : Promise<CalendarsToOwners[]> {
        return await conn.getRepository(CalendarsToOwners)
            .createQueryBuilder("cto")
            .innerJoinAndMapOne("cto.calendar", "calendars", "calendar", "calendar.id = cto.calendar_id")
            .where("cto.owner_id = :userId", {userId: userId})
            .getMany();
    }

    /**
     * @brief Get all groups for a User
     *
     * @param groupsRepository
     * @param userId
     *
     * @returns The expected group list on success
     * @returns null on error
     */
    static async getAllGroups(
        groupsRepository: Repository<Group>,
        userId: number
    ) : Promise<Group[]> {
        return await groupsRepository
            .createQueryBuilder()
            .innerJoinAndSelect(GroupsToUsers, "gtu", `gtu.group_id = "Group"."id"`)
            .where("gtu.user_id = :user_id", {user_id: userId})
            .getMany();
    }

    static async findUserByPseudo(
        conn: Connection,
        userPseudo: string
    ) : Promise<User> {
        return await conn.getRepository(User)
            .createQueryBuilder()
            .where({pseudo: userPseudo})
            .getOne();
    }
}
