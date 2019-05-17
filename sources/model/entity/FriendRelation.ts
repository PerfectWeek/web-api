import { Connection, Entity, PrimaryColumn, Index, Column } from "typeorm";

import { User } from "./User";


@Entity("friend_relations")
export class FriendRelation {
    @PrimaryColumn({ name: "requesting_id" })
    requesting_id: number;

    @PrimaryColumn({ name: "requested_id" })
    @Index()
    requested_id: number;

    @Column()
    confirmed: boolean;

    requestingUser: User;

    requestedUser: User;


    public constructor(requesting_id: number, requested_id: number, confirmed: boolean) {
        this.requesting_id = requesting_id;
        this.requested_id = requested_id;
        this.confirmed = confirmed;
        this.requestingUser = undefined;
        this.requestedUser = undefined;
    }


    public static async findReceivedRequest(
        conn: Connection,
        requestingId: number,
        requestedId: number
    ): Promise<FriendRelation> {
        return conn
            .createQueryBuilder(FriendRelation, "fr")
            .where("requesting_id = :requesting_id", { requesting_id: requestingId })
            .andWhere("requested_id = :requested_id", { requested_id: requestedId })
            .innerJoinAndMapOne("fr.requestingUser", "users", "user", "fr.requesting_id = user.id")
            .getOne();
    }


    public static async acceptRequest(
        conn: Connection,
        requestingId: number,
        requestedId: number
    ): Promise<any> {
        return conn
            .createQueryBuilder()
            .update(FriendRelation)
            .set({ confirmed: true })
            .where("requesting_id = :requesting_id", { requesting_id: requestingId })
            .andWhere("requested_id = :requested_id", { requested_id: requestedId })
            .execute();
    }


    public static async fetchAllFriends(
        conn: Connection,
        userId: number
    ): Promise<User[]> {
        const sentInvites = await conn
            .createQueryBuilder(User, "user")
            .innerJoin("friend_relations", "fr", "fr.requested_id = user.id")
            .where("fr.requesting_id = :id", { id: userId })
            .andWhere("fr.confirmed = true")
            .getMany();
        const receivedInvites = await conn
            .createQueryBuilder(User, "user")
            .innerJoin("friend_relations", "fr", "fr.requesting_id = user.id")
            .where("fr.requested_id = :id", { id: userId })
            .andWhere("fr.confirmed = true")
            .getMany();
        return sentInvites.concat(receivedInvites);
    }


    public static async fetchAllReceivedRequests(
        conn: Connection,
        userId: number
    ): Promise<FriendRelation[]> {
        return conn
            .createQueryBuilder(FriendRelation, "fr")
            .innerJoinAndMapOne("fr.requestingUser", "users", "user", "fr.requesting_id = user.id")
            .where("requested_id = :requested_id", { requested_id: userId })
            .andWhere("fr.confirmed = false")
            .getMany();
    }
}
