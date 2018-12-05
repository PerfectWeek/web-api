import {Column, Connection, Entity, Index, PrimaryGeneratedColumn, Repository} from "typeorm";

import {Encrypt} from "../../utils/encrypt";
import {UserValidator} from "../../utils/validator/UserValidator";
import {Group} from "./Group";
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

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    groups: Group[] = [];


    public constructor(pseudo: string, email: string, ciphered_password: string) {
        this.pseudo = pseudo;
        this.email = email;
        this.cipheredPassword = ciphered_password;
    }

    /**
     * @brief Check if a User satisfies the basic validation rules (pseudo format, email, ...)
     *
     * @return true is the User is valid
     * @return false otherwise
     */
    public isValid(): boolean {
        return UserValidator.pseudo_regex.test(this.pseudo)
            && UserValidator.email_regex.test(this.email);
    }

    /**
     * @brief Check if the given password is valid for this User
     *
     * @param password
     *
     * @return true if the password is valid
     * @return false otherwise
     */
    public async checkPassword(password: string): Promise<boolean> {
        return Encrypt.matchPassword(password, this.cipheredPassword);
    }

    /**
     * @brief Check if a User with the same pseudo or email already exists
     *
     * @param conn      The database Connection
     * @param email
     * @param pseudo
     *
     * @return true if the User already exists
     * @return false otherwise
     */
    public static async alreadyExists(
        conn: Connection,
        email: string,
        pseudo: string
    ) : Promise<boolean> {
        const userRepository = conn.getRepository(User);

        let queryBuilder = userRepository
            .createQueryBuilder("user")
            .where("FALSE");

        if (email) {
            queryBuilder = queryBuilder.orWhere("user.email = :email", {email: email});
        }
        if (pseudo) {
            queryBuilder = queryBuilder.orWhere("user.pseudo = :pseudo", {pseudo: pseudo});
        }

        const userCount = await queryBuilder.getCount();
        return userCount > 0;
    }

    /**
     * @brief Find a User by email
     *
     * @param conn  The database Connection
     * @param email
     *
     * @return The corresponding User on success
     * @return null otherwise
     */
    public static async findByEmail(
        conn: Connection,
        email: string
    ): Promise<User> {
        const userRepository = conn.getRepository(User);

        return userRepository
            .findOne({where: {email: email}});
    }

    /**
     * @brief Find a User by pseudo
     *
     * @param conn  The database Connection
     * @param pseudo
     *
     * @return The corresponding User on success
     * @return null otherwise
     */
    public static async findByPseudo(
        conn: Connection,
        pseudo: string
    ): Promise<User> {
        const userRepository = conn.getRepository(User);

        return userRepository
            .findOne({where: {pseudo: pseudo}});
    }

    /**
     * @brief Delete a User
     *
     * @param conn      The database Connection
     * @param userId    The id of the User you want to remove
     */
    public static async deleteUser(
        conn: Connection,
        userId: number
    ): Promise<any> {
        await conn.transaction(async entityManager => {
            const userRepository = entityManager.getRepository(User);

            // TODO: Remove User from all its Events
            // TODO: Remove User from all its Calendars
            // TODO: Remove Calendars with no Owners

            await userRepository
                .createQueryBuilder("user")
                .delete()
                .where("user.id = :id", {id: userId})
                .execute();
        });
    }

    /**
     * @brief Get all calendars for a User
     *
     * @param calendarsToOwnersRepository
     * @param userId
     *
     * @returns The expected calendar list on success
     * @returns null on error
     */
    static async getAllCalendars(
        calendarsToOwnersRepository: Repository<CalendarsToOwners>,
        userId: number
    ) : Promise<CalendarsToOwners[]> {
        return await calendarsToOwnersRepository
            .createQueryBuilder("cto")
            .innerJoinAndMapOne("cto.calendar", "calendars", "calendar", "calendar.id = cto.calendar_id")
            .where("cto.owner_id = :userId", {userId: userId})
            .getMany();
    }

    /**
     * @brief Get all groups for a User
     *
     * @param conn      The database Connection
     * @param userId
     *
     * @returns The expected group list on success
     * @returns null on error
     */
    static async getAllGroups(
        conn: Connection,
        userId: number
    ): Promise<Group[]> {
        // TODO: Get all Groups
        return [];
    }
}
