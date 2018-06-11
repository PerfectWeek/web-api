//
// Created by benard_g on 2018/06/03
//

import {Db, DbObject} from "../../utils/db";

import {Encrypt} from "../../utils/encrypt";
import {ApiException} from "../../utils/apiException";

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

    static async hashPassword(password: string): Promise<string> {
        // - check password validity
        if (password.length < 8)
            throw new ApiException(403, "Password must be at least 8 characters long");
        return await Encrypt.hashPassword(password);
    }

    public async checkPassword(password: string): Promise<boolean> {
        return await Encrypt.matchPassword(password, this.hashed_password);
    }

    // Validators
    private static pseudo_regex = new RegExp(/^[a-zA-Z0-9_-]{2,42}$/);
    private static email_regex = new RegExp(/^[a-zA-Z][a-zA-Z0-9-_.]*@[a-zA-Z][a-zA-Z0-9-_]*(?:\.[a-zA-Z]{2,4})+$/);

    public isValid() {
        return User.pseudo_regex.test(this.pseudo)
            && User.email_regex.test(this.email);
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

        return !db_user
            ? null
            : new DbObject<User>(
                db_user.id,
                User.create(db_user),
                db_user.created_at,
                db_user.updated_at);
    }

    public static async getOneByEmail(email: string): Promise<DbObject<User>> {
        const db_user = await Db.table(tableName).where({email: email}).first();

        return !db_user
            ? null
            : new DbObject<User>(
                db_user.id,
                User.create(db_user),
                db_user.created_at,
                db_user.updated_at);
    }

    public static async getOneById(id: number): Promise<DbObject<User>> {
        const db_user = await Db.table(tableName).where({id: id}).first();

        return !db_user
            ? null
            : new DbObject<User>(
                db_user.id,
                User.create(db_user),
                db_user.created_at,
                db_user.updated_at);
    }
}
