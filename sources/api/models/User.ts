//
// Created by benard_g on 2018/06/03
//

import {Db, DbObject} from "../db";

export class User
{
    public pseudo: string;
    public email: string;
    public hashed_password: string;

    public constructor(pseudo: string, email: string, hashed_password: string) {
        this.pseudo = pseudo;
        this.email = email;
        this.hashed_password = hashed_password;
    }

    public static hashPassword(password: string): string {
        // TODO
        // - check password validity
        // - hash password
        return password;
    }

    public checkPassword(password: string): boolean {
        // TODO
        // - Check if the given password is compatible with the hash
        return true;
    }

    // Validators
    private static pseudo_regex = new RegExp(/^[a-zA-Z0-9_-]{2,42}$/);
    private static email_regex = new RegExp(/^[a-zA-Z][a-zA-Z0-9-_.]*@[a-zA-Z][a-zA-Z0-9-_]*(?:\.[a-zA-Z]{2,4})+$/);

    public isValid() {
        if (!User.pseudo_regex.test(this.pseudo)) {
            console.log('Bad pseudo');
            return false;
        }
        if (!User.email_regex.test(this.email)) {
            console.log('Bad email');
            return false;
        }
        return true;
    }

    public static create(user: any): User {
        return new User(
            user.pseudo,
            user.email,
            user.hashed_password
        );
    }
}

export const tableName = "users";

export class UserModel {
    public static async createOne(user: User) {
        return Db.table(tableName).insert(user);
    }

    public static async getOneByPseudo(pseudo: string): Promise<DbObject<User>> {
        const db_user = await Db.table(tableName).where({pseudo: pseudo}).first();

        return new DbObject<User>(
            db_user.id,
            new User(
                db_user.pseudo,
                db_user.email,
                db_user.hashed_password
            ),
            db_user.created_at,
            db_user.updated_at);
    }
}
