import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, Connection, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("google_calendar_credentials")
export class GoogleCalendarCredentials {
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn({ name: "access_token" })
    accessToken: string;

    @Column({ name: "refresh_token" })
    refreshToken: string;

    @Column()
    scope: string;

    @Column({ name: "token_type" })
    tokenType: string;

    @Column({ name: "expiry_date" })
    expiryDate: Date;

    @OneToOne(type => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    public constructor(accessToken: string, refreshToken: string, id_token: string, tokenType: string, expiryDate: Date, user: User) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.scope = id_token;
        this.tokenType = tokenType;
        this.expiryDate = expiryDate;
        this.user = user;
    }

    /**
     * @brief Find a GoogleCalendarCredential by id
     * 
     * @param conn The database connection
     * @param tokenId 
     * 
     * @return The Token on success
     * @return null on failure
     */
    public static async findById(
            conn: Connection,
            tokenId: number,
    ): Promise<GoogleCalendarCredentials> {
        return conn.getRepository(GoogleCalendarCredentials)
            .findOne({ where: { id: tokenId } });
    }

    /**
     * @brief Delete a GoogleCalendarCredential by id
     * 
     * @param conn The database connection
     * @param tokenId 
     */
    public static async deleteById(
            conn: Connection,
            tokenId: number,
    ): Promise<any> {
        await conn.transaction(async entityManager => {
            await entityManager.getRepository(GoogleCalendarCredentials)
                .createQueryBuilder()
                .delete()
                .where("id = :id", { id: tokenId })
                .execute();
        });
    }
}
